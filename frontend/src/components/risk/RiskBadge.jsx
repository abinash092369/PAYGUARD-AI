import React from 'react'

export function RiskBadge({ level, type = 'level' }) {
  const getColors = () => {
    const val = (level || '').toUpperCase()
    if (type === 'decision') {
      switch (val) {
        case 'ALLOW':
          return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        case 'REVIEW':
          return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        case 'BLOCK':
          return 'bg-rose-500/10 text-rose-400 border-rose-500/30'
        default:
          return 'bg-slate-800 text-slate-300 border-slate-700'
      }
    } else {
      switch (val) {
        case 'LOW':
          return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        case 'MEDIUM':
          return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        case 'HIGH':
          return 'bg-orange-500/10 text-orange-400 border-orange-500/30'
        case 'CRITICAL':
          return 'bg-rose-500/10 text-rose-400 border-rose-500/30'
        default:
          return 'bg-slate-800 text-slate-300 border-slate-700'
      }
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border ${getColors()}`}>
      {level}
    </span>
  )
}
