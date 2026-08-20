from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def init_db_and_migrations():
    """
    Initializes database tables and executes automatic schema migrations for SQLite.
    """
    Base.metadata.create_all(bind=engine)

    # Migrate missing columns if table already existed prior to Phase 7
    if DATABASE_URL.startswith("sqlite"):
        with engine.connect() as conn:
            try:
                result = conn.execute(text("PRAGMA table_info(transactions);")).fetchall()
                col_names = [row[1] for row in result]
                if "transaction_source" not in col_names:
                    conn.execute(text("ALTER TABLE transactions ADD COLUMN transaction_source VARCHAR(32) DEFAULT 'SYNTHETIC';"))
                    conn.commit()
            except Exception as e:
                pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
