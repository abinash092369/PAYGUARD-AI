import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./payguard.db")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_demo_key_id")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "demo_secret_key")
