import React from 'react'
import { RiskBadge } from './RiskBadge'

export function RiskScore({ score = 0, level = 'LOW', decision = 'ALLOW' }) {
  const getScoreColor = () => {
    if (score <= 24) return 'text-emerald-400'
    if (score <= 49) return 'text-amber-400'
    if (score <= 74) return 'text-orange-400'
    return 'text-rose-400'
  }

  const getMeterGradient = () => {
    if (score <= 24) return 'from-emerald-500 to-teal-400'
    if (score <= 49) return 'from-amber-500 to-yellow-400'
    if (score <= 74) return 'from-orange-500 to-amber-500'
    return 'from-rose-600 to-red-500'
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg text-center space-y-4">
      <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">PayGuard Risk Score</p>
      
      <div className="flex flex-col items-center justify-center">
        <div className="relative inline-flex items-baseline">
          <span className={`text-5xl font-extrabold tracking-tight ${getScoreColor()}`}>
            {score}
          </span>
          <span className="text-xl font-medium text-slate-500 ml-1">/ 100</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getMeterGradient()} transition-all duration-500`}
            style={{ width: `${Math.max(4, Math.min(100, score))}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-3 pt-1">
        <RiskBadge level={level} type="level" />
        <RiskBadge level={`Action: ${decision}`} type="decision" />
      </div>
    </div>
  )
}
