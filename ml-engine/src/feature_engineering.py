"""
PayGuard AI - Feature Engineering Module
Transforms raw transaction telemetry into domain-specific ML features.
"""

import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder


RAW_NUMERICAL_FEATURES = [
    "amount",
    "customer_age",
    "account_age_days",
    "transaction_count_24h",
    "transaction_amount_24h",
    "failed_transactions_24h",
    "previous_transaction_amount",
    "distance_from_previous_transaction",
    "is_new_device",
    "is_new_ip",
    "is_international",
    "hour_of_day",
    "velocity_score",
    "chargeback_history",
]

ENGINEERED_NUMERICAL_FEATURES = [
    "amount_deviation_ratio",
    "amount_vs_previous_ratio",
    "transaction_velocity",
    "risk_signal_count",
    "account_age_normalized",
    "distance_velocity_relationship",
    "is_night_transaction",
]

CATEGORICAL_FEATURES = [
    "payment_method",
    "country",
    "merchant_category",
]


def add_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Derives domain-informed behavioral and risk features from raw transaction fields.
    """
    df = df.copy()

    # 1. Amount deviation relative to recent 24h average transaction amount
    avg_24h_amt = df["transaction_amount_24h"] / (df["transaction_count_24h"] + 1e-5)
    df["amount_deviation_ratio"] = df["amount"] / (avg_24h_amt + 1.0)

    # 2. Amount ratio compared to immediate previous transaction
    df["amount_vs_previous_ratio"] = df["amount"] / (df["previous_transaction_amount"] + 1.0)

    # 3. Transaction velocity (count normalized per hour)
    df["transaction_velocity"] = df["transaction_count_24h"] / 24.0

    # 4. Composite risk signal count (sum of discrete threat indicators)
    df["risk_signal_count"] = (
        df["is_new_device"].astype(int)
        + df["is_new_ip"].astype(int)
        + df["is_international"].astype(int)
        + df["chargeback_history"].astype(int)
        + (df["failed_transactions_24h"] >= 2).astype(int)
    )

    # 5. Normalized account age in years
    df["account_age_normalized"] = df["account_age_days"] / 365.0

    # 6. Interaction feature: Distance jump multiplied by velocity score
    df["distance_velocity_relationship"] = (
        df["distance_from_previous_transaction"] * df["velocity_score"]
    )

    # 7. Night transaction indicator (1 AM - 4 AM)
    df["is_night_transaction"] = df["hour_of_day"].isin([1, 2, 3, 4]).astype(int)

    return df


def prepare_feature_matrix(df: pd.DataFrame):
    """
    Applies feature engineering and splits DataFrame into feature DataFrame X and label Series y (if present).
    """
    df_engineered = add_engineered_features(df)

    feature_cols = RAW_NUMERICAL_FEATURES + ENGINEERED_NUMERICAL_FEATURES + CATEGORICAL_FEATURES

    X = df_engineered[feature_cols]

    y = None
    if "fraud_label" in df.columns:
        y = df["fraud_label"].values

    return X, y


def build_preprocessor():
    """
    Constructs a ColumnTransformer for feature scaling and encoding.
    """
    all_numerical = RAW_NUMERICAL_FEATURES + ENGINEERED_NUMERICAL_FEATURES

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), all_numerical),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_FEATURES),
        ],
        remainder="drop",
    )
    return preprocessor
