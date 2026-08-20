import React from 'react'
import { ShieldCheck, AlertOctagon, CheckCircle2 } from 'lucide-react'

export function RiskDecision({ decision = 'ALLOW', summary = '' }) {
  const getStyle = () => {
    switch (decision) {
      case 'ALLOW':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
        }
      case 'REVIEW':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          icon: <AlertOctagon className="w-5 h-5 text-amber-400" />,
        }
      case 'BLOCK':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          icon: <AlertOctagon className="w-5 h-5 text-rose-400" />,
        }
      default:
        return {
          bg: 'bg-slate-800 border-slate-700 text-slate-300',
          icon: <CheckCircle2 className="w-5 h-5 text-slate-400" />,
        }
    }
  }

  const style = getStyle()

  return (
    <div className={`rounded-xl border p-4 flex items-start space-x-3 text-left ${style.bg}`}>
      <div className="mt-0.5 flex-shrink-0">{style.icon}</div>
      <div>
        <h4 className="text-sm font-bold tracking-wide">Automated Decision Policy: {decision}</h4>
        {summary && <p className="text-xs mt-1 text-slate-300 leading-relaxed opacity-90">{summary}</p>}
      </div>
    </div>
  )
}
