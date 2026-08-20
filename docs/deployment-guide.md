# PayGuard AI — Production Deployment Guide

This guide details deployment options for hosting PayGuard AI on modern cloud infrastructure.

---

## Architecture Overview

- **Frontend**: Deployed as static SPA assets to **Vercel**, **Netlify**, or **Cloudflare Pages**.
- **Backend**: Containerized FastAPI service hosted on **Render**, **Railway**, **Google Cloud Run**, or **AWS App Runner**.
- **Database**: Managed **PostgreSQL** instance (e.g. Render Postgres, Supabase, Neon DB, or AWS RDS).

---

## 1. Backend Deployment (Render / Cloud Run)

### Environment Variables
Configure the following environment variables on your backend hosting platform:

```env
DATABASE_URL=postgresql://user:password@hostname:5432/payguard
FRONTEND_URL=https://payguard-ai.vercel.app
CORS_ORIGINS=https://payguard-ai.vercel.app
RAZORPAY_KEY_ID=rzp_test_YourTestKeyIdHere
RAZORPAY_KEY_SECRET=YourTestKeySecretHere
PORT=8000
```

### Build & Start Command
- **Docker Deployment**: Use `backend/Dockerfile`.
- **Direct Python Start Command**:
  ```bash
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```

---

## 2. Frontend Deployment (Vercel / Netlify)

### Environment Variables
Configure environment variables in Vercel/Netlify dashboard:

```env
VITE_API_BASE_URL=https://payguard-backend.onrender.com
VITE_RAZORPAY_KEY_ID=rzp_test_YourTestKeyIdHere
```

### Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

---

## 3. Production Verification Checklist

1. Verify `GET /health` returns HTTP 200 `{"status": "healthy"}`.
2. Verify `GET /health/ready` returns HTTP 200 `{"status": "ready"}`.
3. Ensure `RAZORPAY_KEY_SECRET` is never exposed in client bundle or network payload.
4. Verify HTTP Security Headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`).
