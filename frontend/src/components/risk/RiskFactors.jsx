import React from 'react'
import { AlertTriangle, ShieldAlert } from 'lucide-react'
import { RiskBadge } from './RiskBadge'

export function RiskFactors({ factors = [] }) {
  if (!factors || factors.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
        <p className="text-xs text-slate-400">No anomalous risk factors detected for this transaction.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 text-slate-200">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        <h4 className="text-sm font-semibold">Detected Threat Vectors ({factors.length})</h4>
      </div>

      <div className="space-y-2">
        {factors.map((factor, idx) => (
          <div
            key={idx}
            className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-start space-x-3 text-left"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-slate-200 truncate">{factor.title}</p>
                <RiskBadge level={factor.severity} type="level" />
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{factor.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
