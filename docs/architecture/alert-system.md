# PayGuard AI — Alert System & Monitoring Architecture

```mermaid
graph TD
    A[Transaction Telemetry Payload] --> B[ML Risk Model Service]
    B -->|0-100 Risk Score & Level| C[Risk Scoring Engine]
    C -->|High >=50 / Critical >=75| D[Alert Generation & Deduplication Service]
    
    D -->|Check Active Unresolved Alert| E{Alert Exists?}
    E -->|Yes| F[Update Existing Alert Payload & Risk Factors]
    E -->|No| G[Insert New Alert Record into SQLite DB]
    
    G --> H[Alert Management Console / REST APIs]
    F --> H
    
    H -->|GET /api/alerts| I[Alerts List & Search UI]
    H -->|GET /api/alerts/{id}| J[Alert Investigation Detail UI]
    J -->|PATCH /api/alerts/{id}| K[Analyst Workflow: OPEN -> INVESTIGATING -> RESOLVED / DISMISSED]
```

## Alert Lifecycle & Severity Levels

1. **Trigger Criteria**:
   - **CRITICAL** (Risk Score 75–100): Immediate critical alert created; default decision `BLOCK`.
   - **HIGH** (Risk Score 50–74): High severity alert created; default decision `REVIEW`.
   - **MEDIUM** (Risk Score 25–49): Monitoring alert logged; default decision `REVIEW`.
   - **LOW** (Risk Score 0–24): Clean transaction; no alert generated; default decision `ALLOW`.

2. **Alert Deduplication**:
   - For a given transaction ID, only one active (`OPEN` or `INVESTIGATING`) alert is maintained. Subsequent re-evaluations update the existing alert record to prevent alert fatigue.

3. **Analyst Workflow Status Transitions**:
   - `OPEN`: Newly generated alert awaiting analyst triaging.
   - `INVESTIGATING`: Analyst is investigating transaction telemetry and behavioral risk factors.
   - `RESOLVED`: Fraud threat confirmed and mitigated.
   - `DISMISSED`: Verified as false positive or legitimate customer activity.
