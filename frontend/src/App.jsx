import React, { useState, useEffect } from 'react'
import { ShieldCheck, CheckCircle2, Database, BarChart3, Activity } from 'lucide-react'
import { getTransactionStats } from './api/transactions'
import { formatCurrency } from './utils/formatters'

function App() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTransactionStats()
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-2xl w-full bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl text-center space-y-6 relative z-10">
        
        {/* Header Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-2 shadow-inner">
          <ShieldCheck className="w-9 h-9" />
        </div>

        {/* Title & Subtitles */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-cyan-400">
            PayGuard AI
          </h1>
          <p className="text-lg sm:text-xl font-medium text-cyan-300/90">
            Intelligent Payment Fraud Detection & Risk Engine
          </p>
          <div className="inline-block px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-sm font-semibold tracking-wide mt-2">
            Track 2 — AI Risk Manager
          </div>
        </div>

        <hr className="border-slate-800 my-6" />

        {/* Status card for Phase 2 */}
        <div className="bg-slate-950/60 rounded-xl p-5 border border-slate-800/80 text-left space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-200">Phase 2 — Synthetic Transaction Pipeline</p>
                <p className="text-xs text-slate-400">Data Model • Validation • EDA • API Foundation</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Ready
            </span>
          </div>

          {/* Dataset Statistics Preview */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-cyan-400" /> Total Rows
                </p>
                <p className="text-base font-bold text-slate-100 mt-1">{stats.total_transactions.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-rose-400" /> Fraud Rate
                </p>
                <p className="text-base font-bold text-rose-400 mt-1">{stats.fraud_rate}%</p>
              </div>
              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-400" /> Legitimate
                </p>
                <p className="text-base font-bold text-emerald-400 mt-1">{stats.legitimate_transactions.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Avg Amount
                </p>
                <p className="text-base font-bold text-slate-200 mt-1">{formatCurrency(stats.average_transaction_amount)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
