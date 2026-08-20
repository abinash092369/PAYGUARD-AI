import React, { useState } from 'react'
import { X, ShieldAlert, Cpu, CheckCircle2, User, CreditCard, MapPin, Clock } from 'lucide-react'
import { getTransactionRisk } from '../api/risk'
import { RiskScore } from './risk/RiskScore'
import { RiskDecision } from './risk/RiskDecision'
import { RiskFactors } from './risk/RiskFactors'
import { formatCurrency } from '../utils/formatters'

export function TransactionDetailModal({ transaction, onClose }) {
  const [riskData, setRiskData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!transaction) return null

  const handleRunRiskAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getTransactionRisk(transaction.transaction_id)
      if (res && res.data) {
        setRiskData(res.data)
      }
    } catch (err) {
      setError(err.message || 'Failed to run risk analysis')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-slate-100">{transaction.transaction_id}</h3>
              {transaction.fraud_label === 1 ? (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  FLAGGED FRAUD
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  LEGITIMATE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">Telemetry Record & ML Risk Profile</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Attributes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <p className="text-slate-400 font-medium">Amount</p>
            <p className="text-sm font-bold text-slate-100 mt-0.5">{formatCurrency(transaction.amount, transaction.currency)}</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <p className="text-slate-400 font-medium">User ID</p>
            <p className="text-sm font-bold text-cyan-400 mt-0.5">{transaction.user_id}</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <p className="text-slate-400 font-medium">Merchant ID</p>
            <p className="text-sm font-bold text-slate-200 mt-0.5">{transaction.merchant_id}</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <p className="text-slate-400 font-medium">Payment Rail</p>
            <p className="text-xs font-semibold text-slate-200 mt-0.5">{transaction.payment_method}</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <p className="text-slate-400 font-medium">Category</p>
            <p className="text-xs font-semibold text-slate-200 mt-0.5 capitalize">{transaction.merchant_category}</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <p className="text-slate-400 font-medium">Origin Country</p>
            <p className="text-xs font-semibold text-slate-200 mt-0.5">{transaction.country}</p>
          </div>
        </div>

        {/* Behavioral Telemetry Details */}
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
          <p className="font-bold text-slate-300">Behavioral Telemetry Signals</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400">
            <div>Device Binding: <span className="text-slate-200">{transaction.is_new_device === 1 ? 'New Device' : 'Known'}</span></div>
            <div>IP Location: <span className="text-slate-200">{transaction.is_new_ip === 1 ? 'New IP' : 'Known'}</span></div>
            <div>24h Count: <span className="text-slate-200">{transaction.transaction_count_24h} txns</span></div>
            <div>Failed 24h: <span className="text-slate-200">{transaction.failed_transactions_24h} attempts</span></div>
            <div>Distance Jump: <span className="text-slate-200">{transaction.distance_from_previous_transaction} km</span></div>
            <div>Velocity Score: <span className="text-slate-200">{transaction.velocity_score}</span></div>
            <div>Chargebacks: <span className="text-slate-200">{transaction.chargeback_history === 1 ? 'Yes' : 'None'}</span></div>
            <div>Timestamp: <span className="text-slate-200">{transaction.transaction_timestamp}</span></div>
          </div>
        </div>

        {/* AI Risk Analysis Action */}
        {!riskData ? (
          <div className="pt-2">
            <button
              onClick={handleRunRiskAnalysis}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm tracking-wide shadow-lg flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <Cpu className="w-4 h-4" />
              <span>{loading ? 'Executing ML Risk Engine...' : 'Run Real-Time AI Risk Analysis'}</span>
            </button>
            {error && <p className="text-xs text-rose-400 mt-2 text-center">{error}</p>}
          </div>
        ) : (
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <RiskScore score={riskData.risk_score} level={riskData.risk_level} decision={riskData.decision} />
            <RiskDecision decision={riskData.decision} summary={riskData.summary} />
            <RiskFactors factors={riskData.risk_factors} />
          </div>
        )}

      </div>
    </div>
  )
}
