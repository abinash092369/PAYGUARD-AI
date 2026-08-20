from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import FRONTEND_URL
from app.database import Base, engine
from app.routes import (
    transactions_router,
    risk_router,
    dashboard_router,
    alerts_router,
    analytics_router,
    monitoring_router,
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PayGuard AI Backend",
    description="Intelligent Payment Fraud Detection & Risk Engine - Backend API",
    version="1.0.0"
)

# CORS configuration for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(transactions_router)
app.include_router(risk_router)
app.include_router(dashboard_router)
app.include_router(alerts_router)
app.include_router(analytics_router)
app.include_router(monitoring_router)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "PayGuard AI Backend"
    }
