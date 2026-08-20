# PayGuard AI — ML Fraud Detection Engine

Machine Learning module for payment fraud detection, risk scoring, and behavioral feature engineering.

> **Note**: Prototype evaluation on synthetic payment telemetry for demonstration purposes.

---

## 1. Dataset
- **Location**: `data/transactions.csv`
- **Volume**: 50,000 synthetic transaction records
- **Class Distribution**: 47,871 Legitimate (95.74%), 2,129 Fraudulent (4.26%)

## 2. Feature Engineering Pipeline (`src/feature_engineering.py`)
Applies scaling and encoding to raw fields and derives key behavioral signals:
- `amount_deviation_ratio`: Transaction amount relative to recent 24h average
- `amount_vs_previous_ratio`: Ratio compared to previous transaction amount
- `transaction_velocity`: Hourly frequency rate
- `risk_signal_count`: Sum of active threat indicators (new device, new IP, international, chargebacks, repeated failures)
- `account_age_normalized`: Account age in years
- `distance_velocity_relationship`: Spatial movement multiplied by velocity score
- `is_night_transaction`: Late-night transaction indicator (1 AM - 4 AM)

## 3. Train/Test Split & Data Leakage Prevention
- **Split**: 80% Training (40,000 rows), 20% Testing (10,000 rows) with stratified splitting (`random_state=42`).
- **Target Leakage Safeguard**: `fraud_label` is strictly excluded from input feature matrix `X`.

## 4. Evaluated Classifiers & Metrics

| Model Name | Precision | Recall | F1-Score | ROC-AUC | PR-AUC |
|---|---|---|---|---|---|
| **Logistic Regression** | Evaluated | Evaluated | Evaluated | Evaluated | Evaluated |
| **Random Forest** | Evaluated | Evaluated | Evaluated | Evaluated | Evaluated |
| **Gradient Boosting** | Evaluated | Evaluated | Evaluated | Evaluated | Evaluated |

## 5. Selected Model & Top Features
- **Selected Model**: Determined by training pipeline based on optimal balance of Recall, F1, and PR-AUC.
- **Artifacts Saved**: `models/payguard_model.joblib`, `models/preprocessor.joblib`, `models/model_metadata.json`.

## 6. Commands & Usage

### Train Pipeline & Save Artifacts
```bash
python src/train_model.py --seed 42
```

### Evaluate Saved Model
```bash
python src/evaluate_model.py
```

### Run Real-time Test Inference
```bash
python src/predict.py
```

### Run ML Test Suite
```bash
python -m unittest discover tests
```

## 7. Model Limitations
- Trained on synthetic payment data.
- Designed as an intelligent prototype for the Razorpay AI Builder Internship 2026.
