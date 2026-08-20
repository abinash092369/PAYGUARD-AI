import math
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.alert import Alert
from app.models.transaction import Transaction
from app.schemas.alert import (
    AlertResponse,
    AlertDetailResponse,
    AlertStatusUpdateRequest,
    AlertStatsResponse,
    PaginatedAlertsResponse,
)
from app.services.alert_service import AlertService
from app.services.risk_service import BackendRiskService
from app.services.data_loader import seed_transactions_if_empty

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("/stats", response_model=AlertStatsResponse)
def get_alert_stats(db: Session = Depends(get_db)):
    """
    Returns summary statistics for security alerts.
    """
    AlertService.seed_initial_alerts_if_empty(db)
    
    total = db.query(Alert).count()
    open_cnt = db.query(Alert).filter(Alert.status == "OPEN").count()
    inv_cnt = db.query(Alert).filter(Alert.status == "INVESTIGATING").count()
    res_cnt = db.query(Alert).filter(Alert.status == "RESOLVED").count()
    dis_cnt = db.query(Alert).filter(Alert.status == "DISMISSED").count()
    
    crit_cnt = db.query(Alert).filter(Alert.severity == "CRITICAL").count()
    high_cnt = db.query(Alert).filter(Alert.severity == "HIGH").count()
    med_cnt = db.query(Alert).filter(Alert.severity == "MEDIUM").count()

    return AlertStatsResponse(
        total=total,
        open=open_cnt,
        investigating=inv_cnt,
        resolved=res_cnt,
        dismissed=dis_cnt,
        critical=crit_cnt,
        high=high_cnt,
        medium=med_cnt,
    )


@router.get("/recent", response_model=List[AlertResponse])
def get_recent_alerts(
    limit: int = Query(10, ge=1, le=50, description="Max alerts to return"),
    db: Session = Depends(get_db)
):
    """
    Returns recent alerts sorted by creation time descending.
    """
    AlertService.seed_initial_alerts_if_empty(db)
    return db.query(Alert).order_by(Alert.created_at.desc()).limit(limit).all()


@router.get("", response_model=PaginatedAlertsResponse)
def get_alerts(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Alerts per page"),
    status: Optional[str] = Query(None, description="Filter by status"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level"),
    search: Optional[str] = Query(None, description="Search alert_id or transaction_id"),
    db: Session = Depends(get_db),
):
    """
    Retrieves paginated alerts with status, severity, risk level, and search filters.
    """
    AlertService.seed_initial_alerts_if_empty(db)
    query = db.query(Alert)

    if status:
        query = query.filter(Alert.status == status.upper())

    if severity:
        query = query.filter(Alert.severity == severity.upper())

    if risk_level:
        query = query.filter(Alert.risk_level == risk_level.upper())

    if search:
        s_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Alert.alert_id.ilike(s_term),
                Alert.transaction_id.ilike(s_term),
            )
        )

    total = query.count()
    total_pages = math.ceil(total / limit) if total > 0 else 0
    offset = (page - 1) * limit
    items = query.order_by(Alert.created_at.desc()).offset(offset).limit(limit).all()

    return PaginatedAlertsResponse(
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
        data=items,
    )


@router.get("/{alert_id}", response_model=AlertDetailResponse)
def get_alert_by_id(alert_id: str, db: Session = Depends(get_db)):
    """
    Retrieves detailed alert context along with underlying transaction telemetry and risk factors.
    """
    AlertService.seed_initial_alerts_if_empty(db)
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found.")

    seed_transactions_if_empty(db)
    txn = db.query(Transaction).filter(Transaction.transaction_id == alert.transaction_id).first()
    
    risk_factors = []
    if txn:
        txn_dict = {c.name: getattr(txn, c.name) for c in txn.__table__.columns}
        risk_res = BackendRiskService.analyze_transaction(txn_dict)
        if risk_res:
            risk_factors = risk_res.get("risk_factors", [])

    return AlertDetailResponse(
        alert=alert,
        transaction=txn,
        risk_factors=risk_factors,
    )


@router.patch("/{alert_id}", response_model=AlertResponse)
def update_alert_status(
    alert_id: str,
    payload: AlertStatusUpdateRequest,
    db: Session = Depends(get_db)
):
    """
    Updates the status of an alert (OPEN, INVESTIGATING, RESOLVED, DISMISSED).
    """
    valid_statuses = ["OPEN", "INVESTIGATING", "RESOLVED", "DISMISSED"]
    target_status = payload.status.upper()
    if target_status not in valid_statuses:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid status '{payload.status}'. Must be one of {valid_statuses}."
        )

    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found.")

    alert.status = target_status
    db.commit()
    db.refresh(alert)
    return alert
