import React, { useState, useEffect } from 'react'
import { CreditCard, RefreshCw, CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { getPayments } from '../api/payments'
import { formatCurrency } from '../utils/formatters'

export function Payments() {
  const [payments, setPayments] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [loading, setLoading] = useState(true)

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const data = await getPayments(page, limit)
      setPayments(data.data || [])
      setTotal(data.total || 0)
      setTotalPages(data.total_pages || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [page])

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-cyan-400" /> Razorpay Test Payment Records
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Audit log of test mode payment orders, Razorpay payment IDs, and linked PayGuard AI transaction IDs.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-2 transition-all border border-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Payment Records Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Payment ID</th>
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Linked Transaction ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
                    <span>Loading payment history...</span>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    No Razorpay test mode payment records recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/50 transition-all">
                    <td className="py-3 px-3 font-bold text-cyan-400">{p.payment_id || 'N/A'}</td>
                    <td className="py-3 px-3 font-mono text-slate-300 text-[11px]">{p.order_id}</td>
                    <td className="py-3 px-3 font-bold text-slate-100">{formatCurrency(p.amount, p.currency)}</td>
                    <td className="py-3 px-3">
                      {p.verified ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          VERIFIED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          {p.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-300">{p.transaction_id || 'Pending Risk Analysis'}</td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">{new Date(p.created_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
          <span>Page {page} of {totalPages || 1}</span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((pr) => Math.max(1, pr - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((pr) => Math.min(totalPages, pr + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
