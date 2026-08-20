from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import DATABASE_URL

# Support both SQLite (local development) and PostgreSQL (managed cloud deployment)
is_sqlite = DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def init_db_and_migrations():
    """
    Initializes database tables and executes automatic schema migrations.
    """
    Base.metadata.create_all(bind=engine)

    # Automatic schema migration for SQLite local dev databases
    if is_sqlite:
        with engine.connect() as conn:
            try:
                result = conn.execute(text("PRAGMA table_info(transactions);")).fetchall()
                col_names = [row[1] for row in result]
                if "transaction_source" not in col_names:
                    conn.execute(text("ALTER TABLE transactions ADD COLUMN transaction_source VARCHAR(32) DEFAULT 'SYNTHETIC';"))
                    conn.commit()
            except Exception:
                pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
