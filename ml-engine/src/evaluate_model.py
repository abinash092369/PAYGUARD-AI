"""
PayGuard AI - Model Evaluation & Reporting Module
Loads trained model artifacts and generates comprehensive performance reports.
"""

import os
import sys
import json
import argparse
import pandas as pd
import joblib

from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
)

# Ensure src module path resolution
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.feature_engineering import prepare_feature_matrix


def evaluate_saved_model(data_path: str):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, "..", ".."))

    models_dir = os.path.join(project_root, "ml-engine", "models")
    model_path = os.path.join(models_dir, "payguard_model.joblib")
    prep_path = os.path.join(models_dir, "preprocessor.joblib")
    meta_path = os.path.join(models_dir, "model_metadata.json")

    print("==================================================")
    print("      PAYGUARD AI - MODEL EVALUATION REPORT       ")
    print("==================================================")

    if not (os.path.exists(model_path) and os.path.exists(prep_path) and os.path.exists(meta_path)):
        print("ERROR: Trained model artifacts missing. Run `python src/train_model.py` first.")
        sys.exit(1)

    with open(meta_path, "r") as f:
        metadata = json.load(f)

    model = joblib.load(model_path)
    preprocessor = joblib.load(prep_path)

    df = pd.read_csv(data_path)
    X_raw, y = prepare_feature_matrix(df)
    X_proc = preprocessor.transform(X_raw)

    y_pred = model.predict(X_proc)
    y_proba = model.predict_proba(X_proc)[:, 1] if hasattr(model, "predict_proba") else y_pred

    prec = precision_score(y, y_pred, zero_division=0)
    rec = recall_score(y, y_pred, zero_division=0)
    f1 = f1_score(y, y_pred, zero_division=0)
    roc_auc = roc_auc_score(y, y_proba)
    pr_auc = average_precision_score(y, y_proba)

    cm = confusion_matrix(y, y_pred)
    tn, fp, fn, tp = cm.ravel()

    print(f"Selected Model:         {metadata['model_name']} (v{metadata.get('version', '1.0.0')})")
    print(f"Training Datetime:      {metadata.get('training_datetime', 'N/A')}")
    print(f"Total Evaluated Rows:   {len(df):,}")
    print(f"Feature Count:          {len(metadata.get('feature_names', []))}")
    print("--------------------------------------------------")
    print(f"Precision:              {prec:.4f}")
    print(f"Recall:                 {rec:.4f}")
    print(f"F1 Score:               {f1:.4f}")
    print(f"ROC-AUC:                {roc_auc:.4f}")
    print(f"PR-AUC (Avg Precision): {pr_auc:.4f}")
    print("--------------------------------------------------")
    print("CONFUSION MATRIX METRICS:")
    print(f"  True Positives (TP):  {tp:,}")
    print(f"  True Negatives (TN):  {tn:,}")
    print(f"  False Positives (FP): {fp:,}")
    print(f"  False Negatives (FN): {fn:,}")
    print("--------------------------------------------------")
    print("TOP PREDICTIVE FEATURES:")
    for idx, feat in enumerate(metadata.get("top_features", []), 1):
        print(f"  {idx}. {feat}")
    print("==================================================\n")


def main():
    parser = argparse.ArgumentParser(description="Evaluate PayGuard AI Model")
    parser.add_argument("--data", type=str, default=None, help="Path to CSV dataset")

    args = parser.parse_args()

    if args.data is None:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.abspath(os.path.join(script_dir, "..", ".."))
        data_path = os.path.join(project_root, "data", "transactions.csv")
    else:
        data_path = args.data

    evaluate_saved_model(data_path)


if __name__ == "__main__":
    main()
