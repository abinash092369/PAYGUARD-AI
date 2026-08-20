import argparse
import os
import sys
import shutil
from datetime import datetime

# Add parent directory to sys.path so app can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models.transaction import Transaction
from app.models.alert import Alert
from app.models.payment import Payment

def migrate(postgres_url, dry_run=True):
    sqlite_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "payguard.db"))
    if not os.path.exists(sqlite_path):
        print(f"Error: SQLite database file not found at {sqlite_path}")
        sys.exit(1)
        
    sqlite_engine = create_engine(f"sqlite:///{sqlite_path}")
    postgres_engine = create_engine(postgres_url)

    # 1. Back up SQLite database
    backup_path = sqlite_path + ".backup"
    if not os.path.exists(backup_path):
        print(f"Creating SQLite backup at: {backup_path}")
        shutil.copy2(sqlite_path, backup_path)
    else:
        print(f"SQLite backup already exists at: {backup_path}")
    
    # Establish sessions
    SqliteSession = sessionmaker(bind=sqlite_engine)
    PostgresSession = sessionmaker(bind=postgres_engine)
    
    sqlite_session = SqliteSession()
    postgres_session = PostgresSession()
    
    try:
        # 2. Inspect SQLite Schema
        sqlite_inspector = inspect(sqlite_engine)
        sqlite_tables = sqlite_inspector.get_table_names()
        print(f"\nSQLite Tables Detected: {sqlite_tables}")
        
        model_tables = ["transactions", "alerts", "payments"]
        
        print("\n--- SCHEMA & STRUCTURE ANALYSIS ---")
        for table in model_tables:
            if table not in sqlite_tables:
                print(f"Warning: Expected table '{table}' not found in SQLite.")
                continue
            sqlite_cols = {col['name']: str(col['type']) for col in sqlite_inspector.get_columns(table)}
            print(f"Table '{table}' columns in SQLite: {list(sqlite_cols.keys())}")
        
        # 3. Check PostgreSQL State
        postgres_inspector = inspect(postgres_engine)
        postgres_tables = postgres_inspector.get_table_names()
        print(f"\nPostgreSQL Existing Tables: {postgres_tables}")
        
        # Row counts dictionary
        report = {}
        
        for table in model_tables:
            sqlite_count = sqlite_session.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
            
            pg_exists = table in postgres_tables
            pg_count_before = 0
            if pg_exists:
                pg_count_before = postgres_session.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
            
            report[table] = {
                "sqlite_count": sqlite_count,
                "pg_exists": pg_exists,
                "pg_count_before": pg_count_before,
                "migrated": 0,
                "pg_count_after": pg_count_before,
                "skipped": 0,
                "failed": 0
            }
            
        print("\n--- DRY RUN COMPARATIVE REPORT (Row Counts) ---")
        for table, counts in report.items():
            print(f"Table: {table}")
            print(f"  - SQLite Row Count: {counts['sqlite_count']}")
            print(f"  - PostgreSQL Table Exists: {counts['pg_exists']}")
            print(f"  - PostgreSQL Row Count Before: {counts['pg_count_before']}")
            
        if dry_run:
            print("\n*** DRY RUN COMPLETED. No database changes were made. ***")
            return
            
        # 4. RUN ACTUAL MIGRATION
        print("\n--- RUNNING MIGRATION ---")
        # Create tables on Postgres if they do not exist
        Base.metadata.create_all(bind=postgres_engine)
        
        # A. Migrate Transactions
        print("Migrating 'transactions'...")
        existing_txn_ids = set(
            row[0] for row in postgres_session.execute(text("SELECT transaction_id FROM transactions")).fetchall()
        )
        
        sqlite_txns = sqlite_session.query(Transaction).all()
        to_insert_txns = []
        for txn in sqlite_txns:
            if txn.transaction_id in existing_txn_ids:
                report["transactions"]["skipped"] += 1
                continue
            
            new_txn = Transaction(
                transaction_id=txn.transaction_id,
                user_id=txn.user_id,
                merchant_id=txn.merchant_id,
                amount=txn.amount,
                currency=txn.currency,
                transaction_timestamp=txn.transaction_timestamp,
                payment_method=txn.payment_method,
                device_id=txn.device_id,
                ip_address=txn.ip_address,
                country=txn.country,
                merchant_category=txn.merchant_category,
                customer_age=txn.customer_age,
                account_age_days=txn.account_age_days,
                transaction_count_24h=txn.transaction_count_24h,
                transaction_amount_24h=txn.transaction_amount_24h,
                failed_transactions_24h=txn.failed_transactions_24h,
                previous_transaction_amount=txn.previous_transaction_amount,
                distance_from_previous_transaction=txn.distance_from_previous_transaction,
                is_new_device=txn.is_new_device,
                is_new_ip=txn.is_new_ip,
                is_international=txn.is_international,
                hour_of_day=txn.hour_of_day,
                velocity_score=txn.velocity_score,
                chargeback_history=txn.chargeback_history,
                fraud_label=txn.fraud_label,
                transaction_source=txn.transaction_source
            )
            to_insert_txns.append(new_txn)
            
        if to_insert_txns:
            postgres_session.bulk_save_objects(to_insert_txns)
            postgres_session.commit()
            report["transactions"]["migrated"] = len(to_insert_txns)
            print(f"Successfully migrated {len(to_insert_txns)} transactions.")
        else:
            print("No new transactions to migrate.")

        # B. Migrate Alerts
        print("Migrating 'alerts'...")
        existing_alert_ids = set(
            row[0] for row in postgres_session.execute(text("SELECT alert_id FROM alerts")).fetchall()
        )
        sqlite_alerts = sqlite_session.query(Alert).all()
        to_insert_alerts = []
        for alert in sqlite_alerts:
            if alert.alert_id in existing_alert_ids:
                report["alerts"]["skipped"] += 1
                continue
                
            new_alert = Alert(
                alert_id=alert.alert_id,
                transaction_id=alert.transaction_id,
                created_at=alert.created_at,
                risk_score=alert.risk_score,
                risk_level=alert.risk_level,
                decision=alert.decision,
                primary_risk_factor=alert.primary_risk_factor,
                severity=alert.severity,
                status=alert.status,
                description=alert.description
            )
            to_insert_alerts.append(new_alert)
            
        if to_insert_alerts:
            postgres_session.bulk_save_objects(to_insert_alerts)
            postgres_session.commit()
            report["alerts"]["migrated"] = len(to_insert_alerts)
            print(f"Successfully migrated {len(to_insert_alerts)} alerts.")
        else:
            print("No new alerts to migrate.")

        # C. Migrate Payments
        print("Migrating 'payments'...")
        existing_order_ids = set(
            row[0] for row in postgres_session.execute(text("SELECT order_id FROM payments")).fetchall()
        )
        sqlite_payments = sqlite_session.query(Payment).all()
        to_insert_payments = []
        for payment in sqlite_payments:
            if payment.order_id in existing_order_ids:
                report["payments"]["skipped"] += 1
                continue
                
            new_payment = Payment(
                payment_id=payment.payment_id,
                order_id=payment.order_id,
                amount=payment.amount,
                amount_paise=payment.amount_paise,
                currency=payment.currency,
                status=payment.status,
                created_at=payment.created_at,
                verified=payment.verified,
                transaction_id=payment.transaction_id
            )
            to_insert_payments.append(new_payment)
            
        if to_insert_payments:
            postgres_session.bulk_save_objects(to_insert_payments)
            postgres_session.commit()
            report["payments"]["migrated"] = len(to_insert_payments)
            print(f"Successfully migrated {len(to_insert_payments)} payments.")
        else:
            print("No new payments to migrate.")

        # D. Reset serial key sequences in PostgreSQL
        print("\nResetting PostgreSQL serial sequences...")
        for table in model_tables:
            postgres_session.execute(text(
                f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), coalesce(max(id), 1)) FROM {table}"
            ))
        postgres_session.commit()
        print("Sequences reset successfully.")
        
        # E. Verify counts
        for table in model_tables:
            pg_count_after = postgres_session.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
            report[table]["pg_count_after"] = pg_count_after

        print("\n--- FINAL MIGRATION SUMMARY REPORT ---")
        print(f"{'Table':<15} | {'SQLite Rows':<12} | {'Before PG':<10} | {'Migrated':<8} | {'After PG':<8} | {'Skipped':<8}")
        print("-" * 70)
        for table, r in report.items():
            print(f"{table:<15} | {r['sqlite_count']:<12} | {r['pg_count_before']:<10} | {r['migrated']:<8} | {r['pg_count_after']:<8} | {r['skipped']:<8}")

    except Exception as e:
        postgres_session.rollback()
        print(f"\nMigration failed with error: {e}")
        raise e
    finally:
        sqlite_session.close()
        postgres_session.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate PayGuard AI SQLite database to PostgreSQL.")
    parser.add_argument("--postgres-url", help="PostgreSQL connection string")
    parser.add_argument("--execute", action="store_true", help="Execute the migration (without this, dry run is performed)")
    args = parser.parse_args()
    
    postgres_url = args.postgres_url or os.environ.get("POSTGRES_DATABASE_URL")
    if not postgres_url:
        print("Error: PostgreSQL Database URL is required. Please set POSTGRES_DATABASE_URL or pass --postgres-url.")
        sys.exit(1)
        
    dry_run = not args.execute
    print(f"Starting migration in {'DRY RUN' if dry_run else 'EXECUTE'} mode...")
    
    migrate(postgres_url, dry_run=dry_run)
