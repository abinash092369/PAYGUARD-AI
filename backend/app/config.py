import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./payguard.db")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://payguard-ai.netlify.app")
CORS_ORIGINS = [
    origin.strip() for origin in os.getenv("CORS_ORIGINS", f"{FRONTEND_URL},https://payguard-ai.netlify.app,http://localhost:5173,http://127.0.0.1:5173").split(",") if origin.strip()
]

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_demo_key_id")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "demo_secret_key")

PORT = int(os.getenv("PORT", 8000))
