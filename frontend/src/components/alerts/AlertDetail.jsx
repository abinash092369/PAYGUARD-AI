import React, { useState, useEffect } from 'react'
import { X, ShieldAlert, Cpu, CheckCircle2, User, CreditCard, Clock, Check, AlertTriangle } from 'lucide-react'
import { getAlertById, updateAlertStatus } from '../../api/alerts'
import { AlertSeverityBadge, AlertStatusBadge } from './AlertBadges'
import { RiskScore } from '../risk/RiskScore'
import { RiskDecision } from '../risk/RiskDecision'
import { RiskFactors } from '../risk/RiskFactors'
import { formatCurrency } from '../../utils/formatters'

export function AlertDetail({ alertId, onClose, onStatusUpdated }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchDetail = async () => {
    try {
      setLoading(true)
      const res = await getAlertById(alertId)
      setData(res)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to fetch alert details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (alertId) {
      fetchDetail()
    }
  }, [alertId])

  const handleStatusChange = async (newStatus) => {
    try {
      setActionLoading(true)
      const updated = await updateAlertStatus(alertId, newStatus)
      if (data && data.alert) {
        setData({ ...data, alert: updated })
      }
      if (onStatusUpdated) {
        onStatusUpdated(updated)
      }
    } catch (err) {
      setError(err.message || 'Failed to update alert status')
    } finally {
      setActionLoading(false)
    }
  }

  if (!alertId) return null

  const alert = data?.alert
  const txn = data?.transaction
  const factors = data?.risk_factors || []

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-slate-100">{alertId}</h3>
              {alert && <AlertSeverityBadge severity={alert.severity} />}
              {alert && <AlertStatusBadge status={alert.status} />}
            </div>
            <p className="text-xs text-slate-400 mt-1">Transaction Target: <span className="text-cyan-400 font-bold">{alert?.transaction_id}</span></p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading alert investigation details...</div>
        ) : alert ? (
          <div className="space-y-5">
            
            {/* Status Action Buttons */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
              <p className="text-xs font-bold text-slate-300">Analyst Investigation Workflow</p>
              <div className="flex flex-wrap items-center gap-2">
                {alert.status !== 'INVESTIGATING' && (
                  <button
                    onClick={() => handleStatusChange('INVESTIGATING')}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all disabled:opacity-50"
                  >
                    Mark Investigating
                  </button>
                )}
                {alert.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleStatusChange('RESOLVED')}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all disabled:opacity-50"
                  >
                    Resolve Alert
                  </button>
                )}
                {alert.status !== 'DISMISSED' && (
                  <button
                    onClick={() => handleStatusChange('DISMISSED')}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 text-xs font-bold transition-all disabled:opacity-50"
                  >
                    Dismiss False Positive
                  </button>
                )}
              </div>
            </div>

            {/* Risk Visual Score */}
            <RiskScore score={alert.risk_score} level={alert.risk_level} decision={alert.decision} />
            <RiskDecision decision={alert.decision} summary={alert.description} />
            <RiskFactors factors={factors} />

            {/* Underlying Telemetry Box */}
            {txn && (
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                <p className="font-bold text-slate-300">Underlying Payment Telemetry</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-400">
                  <div>Amount: <span className="text-slate-100 font-bold">{formatCurrency(txn.amount)}</span></div>
                  <div>User ID: <span className="text-cyan-400 font-bold">{txn.user_id}</span></div>
                  <div>Rail: <span className="text-slate-200">{txn.payment_method}</span></div>
                  <div>Category: <span className="text-slate-200 capitalize">{txn.merchant_category}</span></div>
                  <div>Origin IP: <span className="text-slate-200">{txn.ip_address}</span></div>
                  <div>Country: <span className="text-slate-200">{txn.country}</span></div>
                </div>
              </div>
            )}

            {error && <p className="text-xs text-rose-400 text-center">{error}</p>}
          </div>
        ) : null}

      </div>
    </div>
  )
}
