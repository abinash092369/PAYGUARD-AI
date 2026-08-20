"""
PayGuard AI - Exploratory Data Analysis (EDA)
Analyzes synthetic transaction data and generates statistical visualizations and summary metrics.
"""

import os
import argparse
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns


def perform_eda(data_path: str, output_dir: str):
    print(f"Loading dataset for EDA from: {data_path}...")
    if not os.path.exists(data_path):
        print(f"ERROR: Dataset file not found at {data_path}")
        return

    df = pd.read_csv(data_path)
    os.makedirs(output_dir, exist_ok=True)

    total_txns = len(df)
    fraud_txns = int(df["fraud_label"].sum())
    legit_txns = total_txns - fraud_txns
    fraud_rate = (fraud_txns / total_txns) * 100

    avg_amt = df["amount"].mean()
    median_amt = df["amount"].median()
    max_amt = df["amount"].max()

    print("\n==========================================")
    print("      PAYGUARD AI - EDA STATISTICS       ")
    print("==========================================")
    print(f"Total Transactions:         {total_txns:,}")
    print(f"Legitimate Transactions:    {legit_txns:,} ({100-fraud_rate:.2f}%)")
    print(f"Fraudulent Transactions:    {fraud_txns:,} ({fraud_rate:.2f}%)")
    print(f"Average Transaction Amount: INR {avg_amt:,.2f}")
    print(f"Median Transaction Amount:  INR {median_amt:,.2f}")
    print(f"Max Transaction Amount:     INR {max_amt:,.2f}")
    print("==========================================\n")

    # Set visualization theme
    sns.set_theme(style="darkgrid")
    plt.rcParams.update({"figure.autolayout": True, "font.family": "sans-serif"})

    # 1. Fraud Class Distribution
    fig, ax = plt.subplots(figsize=(7, 5))
    palette = ["#10b981", "#ef4444"]
    sns.countplot(x="fraud_label", data=df, palette=palette, ax=ax)
    ax.set_title("Fraud vs Legitimate Transactions", fontsize=14, fontweight="bold", pad=15)
    ax.set_xticklabels(["Legitimate (0)", "Fraudulent (1)"])
    ax.set_xlabel("Transaction Class")
    ax.set_ylabel("Count")

    for p in ax.patches:
        height = p.get_height()
        ax.annotate(f"{int(height):,}\n({height/total_txns*100:.1f}%)",
                    (p.get_x() + p.get_width() / 2., height / 2),
                    ha='center', va='center', fontsize=11, color='white', fontweight='bold')

    plt.savefig(os.path.join(output_dir, "fraud_distribution.png"), dpi=300)
    plt.close()

    # 2. Fraud Rate by Payment Method
    fig, ax = plt.subplots(figsize=(9, 5))
    pm_stats = df.groupby("payment_method")["fraud_label"].agg(["count", "mean"]).reset_index()
    pm_stats["fraud_rate"] = pm_stats["mean"] * 100
    pm_stats = pm_stats.sort_values(by="fraud_rate", ascending=False)

    sns.barplot(x="payment_method", y="fraud_rate", data=pm_stats, palette="Reds_r", ax=ax)
    ax.set_title("Fraud Rate by Payment Method (%)", fontsize=14, fontweight="bold", pad=15)
    ax.set_xlabel("Payment Method")
    ax.set_ylabel("Fraud Rate (%)")

    for p in ax.patches:
        ax.annotate(f"{p.get_height():.2f}%",
                    (p.get_x() + p.get_width() / 2., p.get_height() + 0.1),
                    ha='center', va='bottom', fontsize=10, fontweight='bold')

    plt.savefig(os.path.join(output_dir, "fraud_by_payment_method.png"), dpi=300)
    plt.close()

    # 3. Fraud Rate by Merchant Category
    fig, ax = plt.subplots(figsize=(10, 5))
    cat_stats = df.groupby("merchant_category")["fraud_label"].agg(["count", "mean"]).reset_index()
    cat_stats["fraud_rate"] = cat_stats["mean"] * 100
    cat_stats = cat_stats.sort_values(by="fraud_rate", ascending=False)

    sns.barplot(x="merchant_category", y="fraud_rate", data=cat_stats, palette="magma", ax=ax)
    ax.set_title("Fraud Rate by Merchant Category (%)", fontsize=14, fontweight="bold", pad=15)
    ax.set_xlabel("Merchant Category")
    ax.set_ylabel("Fraud Rate (%)")
    plt.xticks(rotation=30)

    for p in ax.patches:
        ax.annotate(f"{p.get_height():.2f}%",
                    (p.get_x() + p.get_width() / 2., p.get_height() + 0.1),
                    ha='center', va='bottom', fontsize=9, fontweight='bold')

    plt.savefig(os.path.join(output_dir, "fraud_by_merchant_category.png"), dpi=300)
    plt.close()

    # 4. Fraud Rate by Hour of Day
    fig, ax = plt.subplots(figsize=(10, 5))
    hour_stats = df.groupby("hour_of_day")["fraud_label"].agg(["count", "mean"]).reset_index()
    hour_stats["fraud_rate"] = hour_stats["mean"] * 100

    sns.lineplot(x="hour_of_day", y="fraud_rate", data=hour_stats, marker="o", color="#e11d48", linewidth=2.5, ax=ax)
    ax.set_title("Fraud Rate by Hour of Day (0-23)", fontsize=14, fontweight="bold", pad=15)
    ax.set_xlabel("Hour of Day")
    ax.set_ylabel("Fraud Rate (%)")
    ax.set_xticks(range(0, 24))

    plt.savefig(os.path.join(output_dir, "fraud_by_hour.png"), dpi=300)
    plt.close()

    # 5. Amount Distribution (Legit vs Fraud)
    fig, ax = plt.subplots(figsize=(9, 5))
    sns.kdeplot(df[df["fraud_label"] == 0]["amount"], label="Legitimate", color="#10b981", shade=True, ax=ax)
    sns.kdeplot(df[df["fraud_label"] == 1]["amount"], label="Fraudulent", color="#ef4444", shade=True, ax=ax)
    ax.set_title("Amount Distribution: Legitimate vs Fraudulent", fontsize=14, fontweight="bold", pad=15)
    ax.set_xlabel("Transaction Amount (INR)")
    ax.set_ylabel("Density")
    ax.set_xlim(0, df["amount"].quantile(0.98))
    ax.legend()

    plt.savefig(os.path.join(output_dir, "amount_distribution.png"), dpi=300)
    plt.close()

    print(f"EDA charts successfully generated and saved to: {output_dir}\n")


def main():
    parser = argparse.ArgumentParser(description="Perform EDA on PayGuard AI Synthetic Dataset")
    parser.add_argument("--data", type=str, default=None, help="Path to CSV dataset")
    parser.add_argument("--output-dir", type=str, default=None, help="Directory to save charts")

    args = parser.parse_args()

    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, "..", ".."))

    data_path = args.data if args.data else os.path.join(project_root, "data", "transactions.csv")
    output_dir = args.output_dir if args.output_dir else os.path.join(project_root, "docs", "screenshots")

    perform_eda(data_path, output_dir)


if __name__ == "__main__":
    main()
