import React, { useState } from 'react'
import { Cpu, ShieldCheck, Zap, AlertTriangle, RefreshCw } from 'lucide-react'
import { analyzeTransaction } from '../api/risk'
import { RiskScore } from '../components/risk/RiskScore'
import { RiskDecision } from '../components/risk/RiskDecision'
import { RiskFactors } from '../components/risk/RiskFactors'

const PRESET_DEMOS = {
  NORMAL: {
    transaction_id: "TXN_DEMO_NORMAL",
    user_id: "USR_00100",
    merchant_id: "MER_0005",
    amount: 450.0,
    currency: "INR",
    transaction_timestamp: "2026-08-20 14:30:00",
    payment_method: "UPI",
    device_id: "DEV_KNOWN_001",
    ip_address: "103.22.14.5",
    country: "IN",
    merchant_category: "grocery",
    customer_age: 34,
    account_age_days: 420,
    transaction_count_24h: 1,
    transaction_amount_24h: 450.0,
    failed_transactions_24h: 0,
    previous_transaction_amount: 350.0,
    distance_from_previous_transaction: 1.5,
    is_new_device: 0,
    is_new_ip: 0,
    is_international: 0,
    hour_of_day: 14,
    velocity_score: 0.1,
    chargeback_history: 0
  },
  SUSPICIOUS: {
    transaction_id: "TXN_DEMO_SUSPICIOUS",
    user_id: "USR_00450",
    merchant_id: "MER_0022",
    amount: 28500.0,
    currency: "INR",
    transaction_timestamp: "2026-08-20 02:15:00",
    payment_method: "CREDIT_CARD",
    device_id: "DEV_NEW_777",
    ip_address: "198.51.100.22",
    country: "IN",
    merchant_category: "electronics",
    customer_age: 29,
    account_age_days: 120,
    transaction_count_24h: 9,
    transaction_amount_24h: 48000.0,
    failed_transactions_24h: 2,
    previous_transaction_amount: 1500.0,
    distance_from_previous_transaction: 450.0,
    is_new_device: 1,
    is_new_ip: 1,
    is_international: 0,
    hour_of_day: 2,
    velocity_score: 0.72,
    chargeback_history: 0
  },
  CRITICAL: {
    transaction_id: "TXN_DEMO_CRITICAL_ATO",
    user_id: "USR_00999",
    merchant_id: "MER_0099",
    amount: 49500.0,
    currency: "INR",
    transaction_timestamp: "2026-08-20 03:45:00",
    payment_method: "CREDIT_CARD",
    device_id: "DEV_ATO_UNKNOWN",
    ip_address: "198.51.100.99",
    country: "US",
    merchant_category: "crypto",
    customer_age: 22,
    account_age_days: 4,
    transaction_count_24h: 16,
    transaction_amount_24h: 98000.0,
    failed_transactions_24h: 5,
    previous_transaction_amount: 800.0,
    distance_from_previous_transaction: 1850.0,
    is_new_device: 1,
    is_new_ip: 1,
    is_international: 1,
    hour_of_day: 3,
    velocity_score: 0.95,
    chargeback_history: 1
  }
}

export function Analyze() {
  const [formData, setFormData] = useState(PRESET_DEMOS.NORMAL)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value,
    }))
  }

  const handleApplyPreset = (presetKey) => {
    setFormData(PRESET_DEMOS[presetKey])
    setResult(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      const res = await analyzeTransaction(formData)
      if (res && res.data) {
        setResult(res.data)
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze transaction risk')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-400" /> Manual Risk Analyzer Console
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Input custom payment telemetry parameters and execute real-time ML model inference and explainability.
          </p>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">Demo Presets:</span>
          <button
            onClick={() => handleApplyPreset('NORMAL')}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all"
          >
            Normal Clean
          </button>
          <button
            onClick={() => handleApplyPreset('SUSPICIOUS')}
            className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all"
          >
            Suspicious Spikes
          </button>
          <button
            onClick={() => handleApplyPreset('CRITICAL')}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all"
          >
            Critical ATO Vector
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Form Column */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 text-left">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3">
            Payment Telemetry Payload Inputs
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Transaction ID</label>
                <input
                  type="text"
                  name="transaction_id"
                  value={formData.transaction_id}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Amount (INR)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Payment Method</label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="UPI">UPI</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                  <option value="NET_BANKING">Net Banking</option>
                  <option value="WALLET">Wallet</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Category</label>
                <select
                  name="merchant_category"
                  value={formData.merchant_category}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="ecommerce">Ecommerce</option>
                  <option value="travel">Travel</option>
                  <option value="gaming">Gaming</option>
                  <option value="electronics">Electronics</option>
                  <option value="grocery">Grocery</option>
                  <option value="crypto">Crypto</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Hour of Day (0-23)</label>
                <input
                  type="number"
                  name="hour_of_day"
                  value={formData.hour_of_day}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Is New Device?</label>
                <select
                  name="is_new_device"
                  value={formData.is_new_device}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value={0}>No (0)</option>
                  <option value={1}>Yes (1)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Is New IP?</label>
                <select
                  name="is_new_ip"
                  value={formData.is_new_ip}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value={0}>No (0)</option>
                  <option value={1}>Yes (1)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Is International?</label>
                <select
                  name="is_international"
                  value={formData.is_international}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value={0}>No (0)</option>
                  <option value={1}>Yes (1)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">24h Count</label>
                <input
                  type="number"
                  name="transaction_count_24h"
                  value={formData.transaction_count_24h}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">24h Failed Attempts</label>
                <input
                  type="number"
                  name="failed_transactions_24h"
                  value={formData.failed_transactions_24h}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Distance (km)</label>
                <input
                  type="number"
                  name="distance_from_previous_transaction"
                  value={formData.distance_from_previous_transaction}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Velocity Score (0-1)</label>
                <input
                  type="number"
                  step="0.05"
                  name="velocity_score"
                  value={formData.velocity_score}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Chargeback History</label>
                <select
                  name="chargeback_history"
                  value={formData.chargeback_history}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value={0}>None (0)</option>
                  <option value={1}>Recorded (1)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Account Age (Days)</label>
                <input
                  type="number"
                  name="account_age_days"
                  value={formData.account_age_days}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm tracking-wide shadow-lg flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>{loading ? 'Executing Model Inference...' : 'Execute PayGuard AI Risk Assessment'}</span>
              </button>
            </div>
          </form>

          {error && <p className="text-xs text-rose-400 text-center">{error}</p>}
        </div>

        {/* Results Output Column */}
        <div className="lg:col-span-5 space-y-4">
          {!result ? (
            <div className="h-full bg-slate-900/40 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3">
              <ShieldCheck className="w-12 h-12 text-slate-600" />
              <p className="text-sm font-bold text-slate-300">Ready for Risk Analysis</p>
              <p className="text-xs text-slate-500 max-w-xs">
                Fill in the payload inputs on the left or select a demo preset button to evaluate real-time ML risk output.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <RiskScore score={result.risk_score} level={result.risk_level} decision={result.decision} />
              <RiskDecision decision={result.decision} summary={result.summary} />
              <RiskFactors factors={result.risk_factors} />

              {/* Model Metadata Box */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs space-y-1 text-left">
                <p className="font-bold text-slate-300">ML Engine Metadata</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                  <div>Model Name: <span className="text-slate-200">{result.model.name}</span></div>
                  <div>Model Version: <span className="text-slate-200">{result.model.version}</span></div>
                  <div>Fraud Prob: <span className="text-cyan-400 font-bold">{result.fraud_probability_percent}%</span></div>
                  <div>Score: <span className="text-slate-200 font-bold">{result.risk_score}/100</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
