import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Database,
  Activity,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  Zap,
  TrendingUp,
  Cpu,
  ArrowRight,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  getDashboardStats,
  getRiskDistribution,
  getFraudTrends,
  getTopRiskSignals,
  getRecentTransactions,
} from '../api/dashboard'
import { getRecentAlerts } from '../api/alerts'
import { getHighRiskQueue } from '../api/monitoring'
import { AlertSeverityBadge, AlertStatusBadge } from '../components/alerts/AlertBadges'
import { AlertDetail } from '../components/alerts/AlertDetail'
import { TransactionDetailModal } from '../components/TransactionDetailModal'
import { formatCurrency } from '../utils/formatters'

export function Dashboard() {
  const [stats, setStats] = useState(null)
  const [riskDist, setRiskDist] = useState(null)
  const [trends, setTrends] = useState([])
  const [signals, setSignals] = useState([])
  const [recentTxns, setRecentTxns] = useState([])
  const [recentAlerts, setRecentAlerts] = useState([])
  const [highRiskQueue, setHighRiskQueue] = useState([])
  
  const [selectedTxn, setSelectedTxn] = useState(null)
  const [selectedAlertId, setSelectedAlertId] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [sData, rData, tData, sigData, recData, altData, hrData] = await Promise.all([
        getDashboardStats(),
        getRiskDistribution(),
        getFraudTrends(),
        getTopRiskSignals(),
        getRecentTransactions(10),
        getRecentAlerts(5),
        getHighRiskQueue(1, 5),
      ])
      setStats(sData)
      setRiskDist(rData)
      setTrends(tData)
      setSignals(sigData)
      setRecentTxns(recData)
      setRecentAlerts(altData)
      setHighRiskQueue(hrData.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const pieData = riskDist
    ? [
        { name: 'Low Risk', value: riskDist.low, color: '#10b981' },
        { name: 'Medium Risk', value: riskDist.medium, color: '#f59e0b' },
        { name: 'High Risk', value: riskDist.high, color: '#f97316' },
        { name: 'Critical Risk', value: riskDist.critical, color: '#ef4444' },
      ]
    : []

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 text-left">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Real-Time Fraud Monitoring Console
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Live payment telemetry stream, machine-learning risk scoring, and automated threat response.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-2 transition-all border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/analyze"
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold tracking-wide flex items-center space-x-2 transition-all shadow-lg"
          >
            <Cpu className="w-4 h-4" />
            <span>Analyze Custom Payload</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-left">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
            <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" /> Total Volume
            </p>
            <p className="text-xl font-black text-slate-100">{stats.total_transactions.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">Recorded telemetry</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
            <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-400" /> Fraud Incidents
            </p>
            <p className="text-xl font-black text-rose-400">{stats.fraudulent_transactions.toLocaleString()}</p>
            <p className="text-[10px] text-rose-400/80 font-semibold">{stats.fraud_rate}% fraud rate</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
            <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" /> Legitimate
            </p>
            <p className="text-xl font-black text-emerald-400">{stats.legitimate_transactions.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">Verified clean</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
            <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-400" /> High / Critical Risk
            </p>
            <p className="text-xl font-black text-orange-400">
              {(stats.high_risk_transactions + stats.critical_risk_transactions).toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400">Active threat vectors</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
            <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Total Processing
            </p>
            <p className="text-sm font-black text-slate-200 truncate">{formatCurrency(stats.total_transaction_volume)}</p>
            <p className="text-[10px] text-slate-400">Cumulative value</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
            <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" /> Avg Transaction
            </p>
            <p className="text-sm font-black text-slate-200 truncate">{formatCurrency(stats.average_transaction_amount)}</p>
            <p className="text-[10px] text-slate-400">Mean retail value</p>
          </div>
        </div>
      )}

      {/* Widgets Grid: Active Alerts & High-Risk Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Risk Alerts Widget */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-200">Active Security Alerts</h3>
                <p className="text-[11px] text-slate-400">Top automated alerts requiring analyst review</p>
              </div>
            </div>
            <Link to="/alerts" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1">
              <span>View All Alerts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {recentAlerts.map((alt) => (
              <div
                key={alt.alert_id}
                onClick={() => setSelectedAlertId(alt.alert_id)}
                className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-rose-400 font-mono">{alt.alert_id}</span>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{alt.transaction_id}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{alt.primary_risk_factor}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <AlertSeverityBadge severity={alt.severity} />
                  <AlertStatusBadge status={alt.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High-Risk Queue Widget */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-200">High-Risk Monitoring Queue</h3>
                <p className="text-[11px] text-slate-400">Transactions with elevated threat vectors</p>
              </div>
            </div>
            <Link to="/transactions" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1">
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {highRiskQueue.map((txn) => (
              <div
                key={txn.transaction_id}
                onClick={() => setSelectedTxn(txn)}
                className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-cyan-400">{txn.transaction_id}</p>
                  <p className="text-[10px] text-slate-400">{txn.payment_method} • {txn.merchant_category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-100">{formatCurrency(txn.amount)}</p>
                  <span className="text-[10px] font-bold text-rose-400">FLAGGED</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        
        {/* Fraud Trends Area Chart */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Daily Fraud Velocity Trends</h3>
              <p className="text-[11px] text-slate-400">Aggregated fraud incident rate over trailing dates</p>
            </div>
            <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
              Live Stream
            </span>
          </div>

          <div className="h-64 w-full">
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="fraudulent" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorFraud)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">Loading trend data...</div>
            )}
          </div>
        </div>

        {/* Risk Distribution Donut Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Risk Level Breakdown</h3>
            <p className="text-[11px] text-slate-400">Distribution across 0-100 severity bands</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500">Loading distribution...</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span className="font-bold text-slate-200">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Transaction Detail Modal */}
      {selectedTxn && (
        <TransactionDetailModal
          transaction={selectedTxn}
          onClose={() => setSelectedTxn(null)}
        />
      )}

      {/* Alert Detail Modal */}
      {selectedAlertId && (
        <AlertDetail
          alertId={selectedAlertId}
          onClose={() => setSelectedAlertId(null)}
          onStatusUpdated={() => fetchDashboardData()}
        />
      )}

    </div>
  )
}
