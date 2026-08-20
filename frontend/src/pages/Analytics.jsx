import React, { useState, useEffect } from 'react'
import { BarChart2, ShieldAlert, Cpu, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts'
import {
  getFraudRateAnalytics,
  getRiskSignalsAnalytics,
  getMerchantRiskAnalytics,
  getPaymentMethodRiskAnalytics,
} from '../api/analytics'

export function Analytics() {
  const [days, setDays] = useState(30)
  const [fraudRateData, setFraudRateData] = useState([])
  const [signals, setSignals] = useState([])
  const [merchantData, setMerchantData] = useState([])
  const [paymentData, setPaymentData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const [frData, sigData, mData, pData] = await Promise.all([
        getFraudRateAnalytics(days),
        getRiskSignalsAnalytics(),
        getMerchantRiskAnalytics(),
        getPaymentMethodRiskAnalytics(),
      ])
      setFraudRateData(frData)
      setSignals(sigData)
      setMerchantData(mData)
      setPaymentData(pData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [days])

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 text-left">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-cyan-400" /> Deep Risk Analytics & Threat Vector Breakdown
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Structural insights into feature importance, risk factor severities, merchant risks, and payment rail distributions.
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="flex items-center space-x-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
          <span className="text-xs text-slate-400 font-semibold px-2">Window:</span>
          {[7, 30, 90, 365].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                days === d
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {d === 365 ? 'All' : `${d}d`}
            </button>
          ))}
        </div>
      </div>

      {/* Fraud Rate Trend Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Historical Fraud Incident Rate (%)</h3>
            <p className="text-[11px] text-slate-400">Trailing percentage of fraudulent transactions over time</p>
          </div>
        </div>

        <div className="h-60 w-full">
          {fraudRateData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fraudRateData}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="fraud_rate" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">Loading trend analytics...</div>
          )}
        </div>
      </div>

      {/* Recharts Grid: Merchant Risk & Payment Rail Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
        
        {/* Merchant Category Risk Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Merchant Category Fraud Rates (%)</h3>
            <p className="text-[11px] text-slate-400">Risk incidence rate grouped by retail merchant sector</p>
          </div>

          <div className="h-56 w-full">
            {merchantData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={merchantData} layout="vertical">
                  <XAxis type="number" unit="%" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis dataKey="merchant_category" type="category" tick={{ fill: '#94a3b8', fontSize: 10 }} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="fraud_rate" fill="#f97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">Loading merchant risk...</div>
            )}
          </div>
        </div>

        {/* Payment Method Risk Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Payment Rail Fraud Rates (%)</h3>
            <p className="text-[11px] text-slate-400">Risk incidence rate grouped by payment rail (UPI, Card, Net Banking)</p>
          </div>

          <div className="h-56 w-full">
            {paymentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentData}>
                  <XAxis dataKey="payment_method" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis unit="%" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="fraud_rate" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">Loading payment risk...</div>
            )}
          </div>
        </div>

      </div>

      {/* Threat Vectors Detailed Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 text-left">
        <div>
          <h3 className="text-sm font-bold text-slate-200">Threat Vector Frequency Distribution</h3>
          <p className="text-[11px] text-slate-400">Grounded feature anomaly occurrence percentages</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {signals.map((sig, idx) => (
            <div key={idx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 font-mono">{sig.code}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                  {sig.count.toLocaleString()} occurrences ({sig.percentage}%)
                </span>
              </div>
              <p className="text-xs font-bold text-slate-200">{sig.name}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
