# PayGuard AI - Backend API

FastAPI backend service for PayGuard AI — Intelligent Payment Fraud Detection & Risk Engine.

## Stack
- Python
- FastAPI
- Uvicorn
- Pydantic
- SQLAlchemy
- python-dotenv

## Setup & Running

### 1. Create Virtual Environment
```bash
python -m venv venv
```

### 2. Activate Virtual Environment
- **Windows (PowerShell)**: `.\venv\Scripts\Activate.ps1`
- **Linux/macOS**: `source venv/bin/activate`

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run Dev Server
```bash
uvicorn app.main:app --reload
```

- **Health Endpoint**: `http://127.0.0.1:8000/health`
- **Swagger Documentation**: `http://127.0.0.1:8000/docs`
