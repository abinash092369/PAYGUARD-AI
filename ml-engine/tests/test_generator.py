import os
import unittest
import pandas as pd
from src.generate_data import generate_transactions
from src.validate_data import validate_dataset


class TestDatasetGenerator(unittest.TestCase):
    def test_generation_shape_and_columns(self):
        rows = 1000
        seed = 42
        df = generate_transactions(num_rows=rows, seed=seed)

        self.assertEqual(len(df), rows)
        self.assertEqual(len(df.columns), 25)
        self.assertIn("fraud_label", df.columns)
        self.assertIn("transaction_id", df.columns)

    def test_uniqueness_and_label_range(self):
        df = generate_transactions(num_rows=500, seed=123)
        unique_ids = df["transaction_id"].nunique()
        self.assertEqual(unique_ids, 500)

        unique_labels = set(df["fraud_label"].unique())
        self.assertTrue(unique_labels.issubset({0, 1}))

    def test_fraud_rate_bounds(self):
        df = generate_transactions(num_rows=2000, seed=99)
        fraud_rate = (df["fraud_label"].sum() / len(df)) * 100
        self.assertGreaterEqual(fraud_rate, 1.0)
        self.assertLessEqual(fraud_rate, 10.0)


if __name__ == "__main__":
    unittest.main()
