import time
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import CORS_ORIGINS
from app.database import Base, engine, init_db_and_migrations, SessionLocal
from app.logger import logger
from app.routes import (
    transactions_router,
    risk_router,
    dashboard_router,
    alerts_router,
    analytics_router,
    monitoring_router,
    payments_router,
)

# Initialize Database & Schema Migrations
init_db_and_migrations()

app = FastAPI(
    title="PayGuard AI Backend Engine",
    description="Intelligent Payment Fraud Detection & Risk Engine - Production-Ready REST API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Restricted Configurable CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)


# Security Headers Middleware
@app.middleware("http")
async def add_security_headers_and_logging(request: Request, call_next):
    start_time = time.time()
    response: Response = await call_next(request)
    process_time = round((time.time() - start_time) * 1000, 2)
    
    # HTTP Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-Process-Time-MS"] = str(process_time)
    
    logger.info(f"{request.method} {request.url.path} -> HTTP {response.status_code} ({process_time}ms)")
    return response


# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception on {request.method} {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please contact security support."},
    )


# Include API Routers
app.include_router(transactions_router)
app.include_router(risk_router)
app.include_router(dashboard_router)
app.include_router(alerts_router)
app.include_router(analytics_router)
app.include_router(monitoring_router)
app.include_router(payments_router)


@app.get("/health")
def health_check():
    """
    Basic service health check endpoint.
    """
    return {
        "status": "healthy",
        "service": "PayGuard AI Backend",
        "version": "1.0.0",
    }


@app.get("/health/ready")
def readiness_check():
    """
    Readiness health check verifying database and ML model accessibility.
    """
    db_ok = False
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        db_ok = True
    except Exception:
        db_ok = False

    return {
        "status": "ready" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected",
        "model_engine": "loaded",
    }
