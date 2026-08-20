import os
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.transaction import Transaction
from app.schemas.risk import RiskAnalysisRequest, RiskAnalysisResponse, RiskAnalysisResult
from app.services.risk_service import BackendRiskService
from app.services.data_loader import seed_transactions_if_empty

router = APIRouter(tags=["Risk Engine"])


def get_csv_fallback_df():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.abspath(os.path.join(base_dir, "..", "..", "..", "data", "transactions.csv"))
    if os.path.exists(csv_path):
        return pd.read_csv(csv_path)
    return None


@router.post("/api/risk/analyze", response_model=RiskAnalysisResponse)
def analyze_transaction_risk(payload: RiskAnalysisRequest = Body(...)):
    """
    POST /api/risk/analyze
    Analyzes transaction risk telemetry and returns 0-100 risk score, decision, and risk factor explanations.
    """
    try:
        data_dict = payload.model_dump()
        result_dict = BackendRiskService.analyze_transaction(data_dict)
        return RiskAnalysisResponse(success=True, data=RiskAnalysisResult(**result_dict))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk Analysis Engine Error: {str(e)}")


@router.get("/api/transactions/{transaction_id}/risk", response_model=RiskAnalysisResponse)
def get_transaction_risk_by_id(transaction_id: str, db: Session = Depends(get_db)):
    """
    GET /api/transactions/{transaction_id}/risk
    Fetches transaction details by transaction_id and runs real-time ML risk analysis.
    """
    seed_transactions_if_empty(db)
    txn = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()

    data_dict = None
    if txn:
        data_dict = {c.name: getattr(txn, c.name) for c in txn.__table__.columns}
    else:
        df = get_csv_fallback_df()
        if df is not None:
            matched = df[df["transaction_id"] == transaction_id]
            if not matched.empty:
                data_dict = matched.iloc[0].to_dict()

    if not data_dict:
        raise HTTPException(status_code=404, detail=f"Transaction '{transaction_id}' not found for risk analysis.")

    try:
        result_dict = BackendRiskService.analyze_transaction(data_dict)
        return RiskAnalysisResponse(success=True, data=RiskAnalysisResult(**result_dict))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk Analysis Engine Error: {str(e)}")
