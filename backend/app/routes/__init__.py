from app.routes.transactions import router as transactions_router
from app.routes.risk import router as risk_router
from app.routes.dashboard import router as dashboard_router
from app.routes.alerts import router as alerts_router
from app.routes.analytics import router as analytics_router
from app.routes.monitoring import router as monitoring_router
from app.routes.payments import router as payments_router

__all__ = [
    "transactions_router",
    "risk_router",
    "dashboard_router",
    "alerts_router",
    "analytics_router",
    "monitoring_router",
    "payments_router",
]
