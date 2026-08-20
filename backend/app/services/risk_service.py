import os
import sys
from typing import Dict, Any

# Dynamically ensure ml-engine/src is on sys.path for ML service invocation
base_dir = os.path.dirname(os.path.abspath(__file__))
ml_engine_src = os.path.abspath(os.path.join(base_dir, "..", "..", "..", "ml-engine"))
if ml_engine_src not in sys.path:
    sys.path.insert(0, ml_engine_src)

from src.model_service import ModelService


class BackendRiskService:
    @staticmethod
    def analyze_transaction(transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Invokes ML Engine ModelService to analyze transaction risk and explainability.
        """
        return ModelService.analyze_transaction_risk(transaction_data)
