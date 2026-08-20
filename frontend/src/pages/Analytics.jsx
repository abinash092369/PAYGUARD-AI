import React, { useState, useEffect } from 'react'
import { BarChart2, ShieldAlert, Cpu, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { getTopRiskSignals, getRiskDistribution } from '../api/dashboard'

export function Analytics() {
  const [signals, setSignals] = useState([])
  const [riskDist, setRiskDist] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getTopRiskSignals(), getRiskDistribution()])
      .then(([sigData, distData]) => {
        setSignals(sigData)
        setRiskDist(distData)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-cyan-400" /> Deep Risk Analytics & Threat Vector Breakdown
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Structural insights into feature importance, risk factor severities, and policy enforcement boundaries.
          </p>
        </div>
      </div>

      {/* Policy Thresholds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400">LOW RISK (0–24)</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">ALLOW</span>
          </div>
          <p className="text-xs text-slate-300">Standard legitimate customer pattern with clean device and network telemetry.</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400">MEDIUM RISK (25–49)</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">REVIEW</span>
          </div>
          <p className="text-xs text-slate-300">Minor behavioral anomalies requiring lightweight 2FA/OTP verification step.</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-400">HIGH RISK (50–74)</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">REVIEW</span>
          </div>
          <p className="text-xs text-slate-300">Significant risk indicators. Flagged for manual risk analyst review before release.</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400">CRITICAL RISK (75–100)</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">BLOCK</span>
          </div>
          <p className="text-xs text-slate-300">High probability account takeover or card testing attack. Instant block applied.</p>
        </div>

      </div>

      {/* Threat Vectors Detailed Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 text-left">
        <div>
          <h3 className="text-sm font-bold text-slate-200">Threat Vector Code Catalog</h3>
          <p className="text-[11px] text-slate-400">11 grounded behavioral risk factors evaluated in real time</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {signals.map((sig, idx) => (
            <div key={idx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 font-mono">{sig.signal_code}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Count: {sig.count.toLocaleString()}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-200">{sig.signal_name}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{sig.description}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
