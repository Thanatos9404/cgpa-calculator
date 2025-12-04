"""
Database connection and session management
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session as DBSession
from contextlib import contextmanager
import os
from pathlib import Path

# Create database directory if it doesn't exist
DB_DIR = Path(__file__).parent.parent.parent / "data"
DB_DIR.mkdir(exist_ok=True)

# SQLite database URL
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_DIR}/cgpa_app.db")

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=True  # Set to False in production
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    Dependency for getting database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Initialize database tables
    """
    from app.database.models import Base
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized successfully")
