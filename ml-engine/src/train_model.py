"""
PayGuard AI - Model Training & Selection Engine
Trains Logistic Regression, Random Forest, and HistGradientBoosting classifiers.
Selects the best model based on fraud risk metrics and serializes model artifacts.
"""

import os
import sys
import json
import argparse
from datetime import datetime
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    roc_curve,
    precision_recall_curve,
)
import matplotlib.pyplot as plt
import seaborn as sns

# Ensure src module path resolution
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import feature engineering functions
from src.feature_engineering import prepare_feature_matrix, build_preprocessor


def evaluate_classifier(model, X_train, y_train, X_test, y_test, model_name: str) -> dict:
    """
    Fits and evaluates a classifier, returning metrics dictionary.
    """
    print(f"Training {model_name}...")
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    if hasattr(model, "predict_proba"):
        y_proba = model.predict_proba(X_test)[:, 1]
    else:
        y_proba = y_pred

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()

    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    roc_auc = roc_auc_score(y_test, y_proba)
    pr_auc = average_precision_score(y_test, y_proba)

    metrics = {
        "model_name": model_name,
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1_score": round(float(f1), 4),
        "roc_auc": round(float(roc_auc), 4),
        "pr_auc": round(float(pr_auc), 4),
        "true_positives": int(tp),
        "true_negatives": int(tn),
        "false_positives": int(fp),
        "false_negatives": int(fn),
    }

    print(f"  [{model_name}] Recall: {rec:.4f} | Precision: {prec:.4f} | F1: {f1:.4f} | ROC-AUC: {roc_auc:.4f} | PR-AUC: {pr_auc:.4f}")
    return metrics, model, y_pred, y_proba


def generate_evaluation_plots(models_dict, X_test, y_test, best_name, output_dirs, preprocessor, feature_names):
    """
    Generates and saves ROC curves, PR curves, Confusion Matrix, and Feature Importance charts.
    """
    sns.set_theme(style="darkgrid")
    plt.rcParams.update({"figure.autolayout": True})

    for out_dir in output_dirs:
        os.makedirs(out_dir, exist_ok=True)

    # 1. ROC Curves Plot
    fig, ax = plt.subplots(figsize=(8, 6))
    for name, data in models_dict.items():
        fpr, tpr, _ = roc_curve(y_test, data["y_proba"])
        ax.plot(fpr, tpr, label=f"{name} (AUC = {data['metrics']['roc_auc']:.3f})", linewidth=2)
    ax.plot([0, 1], [0, 1], "k--", label="Random Chance")
    ax.set_title("ROC Curves Comparison", fontsize=14, fontweight="bold", pad=12)
    ax.set_xlabel("False Positive Rate")
    ax.set_ylabel("True Positive Rate (Recall)")
    ax.legend(loc="lower right")
    for out_dir in output_dirs:
        plt.savefig(os.path.join(out_dir, "roc_curve.png"), dpi=300)
    plt.close()

    # 2. Precision-Recall Curves Plot
    fig, ax = plt.subplots(figsize=(8, 6))
    for name, data in models_dict.items():
        prec, rec, _ = precision_recall_curve(y_test, data["y_proba"])
        ax.plot(rec, prec, label=f"{name} (PR-AUC = {data['metrics']['pr_auc']:.3f})", linewidth=2)
    ax.set_title("Precision-Recall Curves Comparison", fontsize=14, fontweight="bold", pad=12)
    ax.set_xlabel("Recall")
    ax.set_ylabel("Precision")
    ax.legend(loc="lower left")
    for out_dir in output_dirs:
        plt.savefig(os.path.join(out_dir, "precision_recall_curve.png"), dpi=300)
    plt.close()

    # 3. Best Model Confusion Matrix
    best_data = models_dict[best_name]
    cm = confusion_matrix(y_test, best_data["y_pred"])
    fig, ax = plt.subplots(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Reds", cbar=False,
                xticklabels=["Legitimate (0)", "Fraudulent (1)"],
                yticklabels=["Legitimate (0)", "Fraudulent (1)"], ax=ax)
    ax.set_title(f"Confusion Matrix — {best_name}", fontsize=14, fontweight="bold", pad=12)
    ax.set_xlabel("Predicted Label")
    ax.set_ylabel("Actual Label")
    for out_dir in output_dirs:
        plt.savefig(os.path.join(out_dir, "confusion_matrix.png"), dpi=300)
    plt.close()

    # 4. Feature Importance for Best Model (if supported)
    best_model = best_data["model"]
    if hasattr(best_model, "feature_importances_"):
        importances = best_model.feature_importances_
        indices = np.argsort(importances)[::-1][:10]

        top_names = [feature_names[i] for i in indices]
        top_scores = importances[indices]

        fig, ax = plt.subplots(figsize=(9, 5))
        sns.barplot(x=top_scores, y=top_names, palette="viridis", ax=ax)
        ax.set_title(f"Top 10 Feature Importances — {best_name}", fontsize=14, fontweight="bold", pad=12)
        ax.set_xlabel("Feature Importance Score")
        ax.set_ylabel("Feature")
        for out_dir in output_dirs:
            plt.savefig(os.path.join(out_dir, "feature_importance.png"), dpi=300)
        plt.close()


def train_pipeline(data_path: str, seed: int = 42):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, "..", ".."))

    models_dir = os.path.join(project_root, "ml-engine", "models")
    outputs_dir = os.path.join(project_root, "ml-engine", "outputs")
    screenshots_dir = os.path.join(project_root, "docs", "screenshots")

    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(outputs_dir, exist_ok=True)
    os.makedirs(screenshots_dir, exist_ok=True)

    print(f"Loading transaction dataset for ML training from: {data_path}...")
    if not os.path.exists(data_path):
        print(f"ERROR: Dataset file not found at {data_path}")
        sys.exit(1)

    df = pd.read_csv(data_path)
    total_rows = len(df)

    # Prepare features and labels
    X_raw, y = prepare_feature_matrix(df)

    # Train / Test Split (Stratified 80/20)
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X_raw, y, test_size=0.20, random_state=seed, stratify=y
    )

    print(f"Dataset split: Train = {len(X_train_raw):,} rows, Test = {len(X_test_raw):,} rows.")

    # Preprocessing
    preprocessor = build_preprocessor()
    X_train_proc = preprocessor.fit_transform(X_train_raw)
    X_test_proc = preprocessor.transform(X_test_raw)

    # Extract feature names after One-Hot Encoding
    num_feature_names = preprocessor.transformers_[0][2]
    cat_encoder = preprocessor.transformers_[1][1]
    cat_feature_names = cat_encoder.get_feature_names_out(preprocessor.transformers_[1][2]).tolist()
    feature_names = list(num_feature_names) + list(cat_feature_names)

    # Define candidate classifiers
    classifiers = {
        "Logistic Regression": LogisticRegression(class_weight="balanced", max_iter=1000, random_state=seed),
        "Random Forest": RandomForestClassifier(n_estimators=100, class_weight="balanced", random_state=seed, n_jobs=-1),
        "Gradient Boosting": HistGradientBoostingClassifier(class_weight="balanced", random_state=seed),
    }

    eval_results = {}
    models_dict = {}

    for name, clf in classifiers.items():
        metrics, fitted_clf, y_pred, y_proba = evaluate_classifier(clf, X_train_proc, y_train, X_test_proc, y_test, name)
        eval_results[name] = metrics
        models_dict[name] = {
            "model": fitted_clf,
            "metrics": metrics,
            "y_pred": y_pred,
            "y_proba": y_proba,
        }

    # Model Selection: Prioritize F1-score and PR-AUC for imbalanced risk management
    best_name = max(eval_results.keys(), key=lambda k: (eval_results[k]["f1_score"] + eval_results[k]["pr_auc"]) / 2.0)
    best_data = models_dict[best_name]
    best_metrics = best_data["metrics"]

    print(f"\n==========================================")
    print(f"  SELECTED OPTIMAL MODEL: {best_name}  ")
    print(f"==========================================")
    print(f"Selection Rationale: Highest combined F1 ({best_metrics['f1_score']}) and PR-AUC ({best_metrics['pr_auc']}) on imbalanced fraud data.")

    # Save metrics JSON
    metrics_path = os.path.join(outputs_dir, "model_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(eval_results, f, indent=2)
    print(f"Model metrics saved to: {metrics_path}")

    # Generate Evaluation Charts
    generate_evaluation_plots(models_dict, X_test_proc, y_test, best_name, [outputs_dir, screenshots_dir], preprocessor, feature_names)

    # Extract Top Features for Best Model
    top_features = []
    if hasattr(best_data["model"], "feature_importances_"):
        importances = best_data["model"].feature_importances_
        indices = np.argsort(importances)[::-1][:5]
        top_features = [feature_names[i] for i in indices]

    # Save Joblib Artifacts & Metadata
    model_artifact_path = os.path.join(models_dir, "payguard_model.joblib")
    preprocessor_artifact_path = os.path.join(models_dir, "preprocessor.joblib")
    metadata_path = os.path.join(models_dir, "model_metadata.json")

    joblib.dump(best_data["model"], model_artifact_path)
    joblib.dump(preprocessor, preprocessor_artifact_path)

    metadata = {
        "model_name": best_name,
        "version": "1.0.0",
        "training_datetime": datetime.now().isoformat(),
        "total_dataset_rows": total_rows,
        "train_rows": len(X_train_raw),
        "test_rows": len(X_test_raw),
        "feature_count": len(feature_names),
        "random_seed": seed,
        "metrics": best_metrics,
        "top_features": top_features,
        "feature_names": feature_names,
    }

    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Model saved to:        {model_artifact_path}")
    print(f"Preprocessor saved to: {preprocessor_artifact_path}")
    print(f"Metadata saved to:     {metadata_path}\n")

    return best_metrics, best_name, top_features


def main():
    parser = argparse.ArgumentParser(description="Train PayGuard AI Fraud Detection Models")
    parser.add_argument("--data", type=str, default=None, help="Path to CSV dataset")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")

    args = parser.parse_args()

    if args.data is None:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.abspath(os.path.join(script_dir, "..", ".."))
        data_path = os.path.join(project_root, "data", "transactions.csv")
    else:
        data_path = args.data

    train_pipeline(data_path, seed=args.seed)


if __name__ == "__main__":
    main()
