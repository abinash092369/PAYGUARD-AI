import os
import pandas as pd
from sqlalchemy.orm import Session
from app.models.transaction import Transaction


def seed_transactions_if_empty(db: Session, max_seed_rows: int = 5000):
    """
    Seeds the SQLite database with generated CSV transactions if empty.
    """
    count = db.query(Transaction).count()
    if count > 0:
        return

    # Find transactions.csv
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.abspath(os.path.join(base_dir, "..", "..", "..", "data", "transactions.csv"))

    if not os.path.exists(csv_path):
        print(f"Data seeder: {csv_path} does not exist yet.")
        return

    print(f"Seeding database from {csv_path} (loading up to {max_seed_rows} records)...")
    df = pd.read_csv(csv_path)
    if max_seed_rows and len(df) > max_seed_rows:
        df = df.iloc[:max_seed_rows]

    records = df.to_dict(orient="records")
    db_objects = [Transaction(**rec) for rec in records]

    db.bulk_save_objects(db_objects)
    db.commit()
    print(f"Database seeded with {len(db_objects)} transactions.")
