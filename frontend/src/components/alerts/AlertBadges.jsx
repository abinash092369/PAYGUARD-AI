import React from 'react'

export function AlertSeverityBadge({ severity }) {
  const getStyle = () => {
    switch ((severity || '').toUpperCase()) {
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

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getStyle()}`}>
      {severity}
    </span>
  )
}

export function AlertStatusBadge({ status }) {
  const getStyle = () => {
    switch ((status || '').toUpperCase()) {
      case 'OPEN':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
      case 'INVESTIGATING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      case 'RESOLVED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      case 'DISMISSED':
        return 'bg-slate-800 text-slate-400 border-slate-700'
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700'
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getStyle()}`}>
      {status}
    </span>
  )
}
