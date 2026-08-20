# Production Dockerfile for PayGuard AI FastAPI Backend
FROM python:3.11-slim

# Set working directory to workspace root
WORKDIR /workspace

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy application files and ML model artifacts
COPY backend/ ./backend/
COPY ml-engine/ ./ml-engine/
COPY data/ ./data/

# Set working directory to backend for uvicorn execution
WORKDIR /workspace/backend

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Expose port
EXPOSE 8000

# Production Uvicorn start command
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]


