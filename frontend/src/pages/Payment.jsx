import React, { useState, useEffect } from 'react'
import { ShieldCheck, CreditCard, Lock, Zap, CheckCircle2, AlertTriangle, Cpu, RefreshCw, ArrowRight } from 'lucide-react'
import { createPaymentOrder, verifyPayment } from '../api/payments'
import { RiskScore } from '../components/risk/RiskScore'
import { RiskDecision } from '../components/risk/RiskDecision'
import { RiskFactors } from '../components/risk/RiskFactors'
import { formatCurrency } from '../utils/formatters'

const PAYMENT_PRESETS = {
  NORMAL: {
    label: "Normal Clean Payment",
    amount: 500,
    override: {
      is_new_device: 0,
      is_new_ip: 0,
      is_international: 0,
      failed_transactions_24h: 0,
      distance_from_previous_transaction: 1.5,
      transaction_count_24h: 1,
      velocity_score: 0.1,
      chargeback_history: 0
    }
  },
  SUSPICIOUS: {
    label: "Suspicious Amount & Velocity",
    amount: 28500,
    override: {
      is_new_device: 1,
      is_new_ip: 1,
      is_international: 0,
      failed_transactions_24h: 2,
      distance_from_previous_transaction: 350.0,
      transaction_count_24h: 8,
      velocity_score: 0.65,
      chargeback_history: 0
    }
  },
  CRITICAL: {
    label: "Critical ATO Threat Vector",
    amount: 49500,
    override: {
      is_new_device: 1,
      is_new_ip: 1,
      is_international: 1,
      failed_transactions_24h: 4,
      distance_from_previous_transaction: 1200.0,
      transaction_count_24h: 15,
      velocity_score: 0.92,
      chargeback_history: 1
    }
  }
}

export function Payment() {
  const [selectedScenario, setSelectedScenario] = useState('NORMAL')
  const [amount, setAmount] = useState(500)
  
  // Workflow States
  const [statusStep, setStatusStep] = useState(null) // 'CREATING', 'CHECKOUT', 'VERIFYING', 'ANALYZING', 'COMPLETE'
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // Dynamically inject Razorpay Checkout script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const handleSelectScenario = (key) => {
    setSelectedScenario(key)
    setAmount(PAYMENT_PRESETS[key].amount)
    setResult(null)
    setError(null)
  }

  const handleStartPayment = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      setResult(null)
      setStatusStep('CREATING')

      // Step 1: Create Razorpay Order via Backend
      const orderRes = await createPaymentOrder(amount, 'INR')
      setStatusStep('CHECKOUT')

      const activePreset = PAYMENT_PRESETS[selectedScenario]

      // Razorpay Checkout Options
      const options = {
        key: orderRes.key_id,
        amount: orderRes.amount_paise,
        currency: orderRes.currency,
        name: 'PayGuard AI Checkout',
        description: 'Test Mode Payment Simulation',
        order_id: orderRes.order_id,
        handler: async function (response) {
          try {
            setStatusStep('VERIFYING')
            // Step 2 & 3: Signature verification and ML Risk Evaluation
            const verifyRes = await verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              activePreset.override
            )
            setResult(verifyRes)
            setStatusStep('COMPLETE')
          } catch (err) {
            setError(err.message || 'Signature verification or risk analysis failed.')
            setStatusStep(null)
          }
        },
        modal: {
          ondismiss: function () {
            setStatusStep(null)
          }
        },
        prefill: {
          name: 'Razorpay AI Tester',
          email: 'tester@payguard.ai',
          contact: '9999999999'
        },
        theme: {
          color: '#06b6d4'
        }
      }

      // If Razorpay SDK loaded, launch official modal; else execute test verification
      if (window.Razorpay) {
        const rzp = new window.Razorpay(options)
        rzp.open()
      } else {
        // Fallback test mode simulation if popup blocked or network offline
        setStatusStep('VERIFYING')
        const verifyRes = await verifyPayment(
          orderRes.order_id,
          `pay_mock_${Date.now()}`,
          'mock_signature_valid',
          activePreset.override
        )
        setResult(verifyRes)
        setStatusStep('COMPLETE')
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate payment order.')
      setStatusStep(null)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 text-left">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-black tracking-tight text-white">Razorpay Test Payment Simulation</h2>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
              RAZORPAY TEST MODE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate real payment authorization, server-side signature verification, and automated PayGuard AI risk engine scoring.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Checkout Configuration Column */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 text-left shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-cyan-400" /> Checkout Parameters
          </h3>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Select Risk Telemetry Scenario:</label>
            <div className="space-y-2">
              {Object.keys(PAYMENT_PRESETS).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectScenario(key)}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    selectedScenario === key
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{PAYMENT_PRESETS[key].label}</span>
                  <span className="font-bold">{formatCurrency(PAYMENT_PRESETS[key].amount)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Form */}
          <form onSubmit={handleStartPayment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Transaction Amount (INR ₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-extrabold text-lg focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={!!statusStep}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-sm tracking-wide shadow-lg flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{statusStep ? 'Processing Payment Flow...' : 'Pay Securely with Razorpay Test Mode'}</span>
            </button>
          </form>

          {/* Status Progress Indicator */}
          {statusStep && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-cyan-400 font-semibold">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>
                  {statusStep === 'CREATING' && 'Creating Razorpay Test Order...'}
                  {statusStep === 'CHECKOUT' && 'Opening Razorpay Secure Checkout...'}
                  {statusStep === 'VERIFYING' && 'Verifying HMAC Signature Server-Side...'}
                  {statusStep === 'COMPLETE' && 'Payment & AI Risk Evaluation Complete.'}
                </span>
              </div>
            </div>
          )}

          {error && <p className="text-xs text-rose-400 text-center">{error}</p>}
          <p className="text-[10px] text-slate-500 text-center">Protected by PayGuard AI • Test Mode Integration Only</p>
        </div>

        {/* Risk Assessment Output Column */}
        <div className="lg:col-span-6 space-y-4">
          {!result ? (
            <div className="h-full bg-slate-900/40 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3">
              <ShieldCheck className="w-12 h-12 text-slate-600" />
              <p className="text-sm font-bold text-slate-300">Razorpay Payment & Risk Output</p>
              <p className="text-xs text-slate-500 max-w-xs">
                Click "Pay Securely" to launch Razorpay test checkout and trigger the PayGuard AI fraud detection engine.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-left">
              {/* Payment Verification Banner */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center space-x-3 text-emerald-400 text-xs">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-bold">Razorpay Test Payment Verified</p>
                  <p className="text-[10px] text-emerald-300/80">Order: {result.order_id} • Payment: {result.payment_id}</p>
                </div>
              </div>

              {/* PayGuard AI Risk Assessment Result */}
              {result.risk_analysis && (
                <>
                  <RiskScore
                    score={result.risk_analysis.risk_score}
                    level={result.risk_analysis.risk_level}
                    decision={result.risk_analysis.decision}
                  />
                  <RiskDecision
                    decision={result.risk_analysis.decision}
                    summary={result.risk_analysis.summary}
                  />
                  <RiskFactors factors={result.risk_analysis.risk_factors} />
                </>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
