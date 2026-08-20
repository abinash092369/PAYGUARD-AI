import React, { useState, useEffect } from 'react'
import { Search, Filter, ChevronLeft, ChevronRight, RefreshCw, Cpu, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { getTransactions } from '../api/transactions'
import { TransactionDetailModal } from '../components/TransactionDetailModal'
import { formatCurrency } from '../utils/formatters'

export function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  // Filters State
  const [search, setSearch] = useState('')
  const [fraudFilter, setFraudFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')

  const [selectedTxn, setSelectedTxn] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTransactionsData = async () => {
    try {
      setLoading(true)
      const data = await getTransactions({
        page,
        limit,
        search,
        fraud_label: fraudFilter !== '' ? parseInt(fraudFilter) : null,
        merchant_category: categoryFilter,
        payment_method: methodFilter,
      })
      setTransactions(data.data || [])
      setTotal(data.total || 0)
      setTotalPages(data.total_pages || 0)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactionsData()
  }, [page, fraudFilter, categoryFilter, methodFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchTransactionsData()
  }

  const renderRiskBadge = (txn) => {
    if (txn.fraud_label === 1) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/30">
          CRITICAL FRAUD
        </span>
      )
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        LEGITIMATE
      </span>
    )
  }

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">Transaction Telemetry Explorer</h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse, search, and filter telemetry transaction records with server-side pagination.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-xs font-semibold text-slate-400 bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-800">
            <span>Total Records: <strong className="text-cyan-400">{total.toLocaleString()}</strong></span>
          </div>

          <button
            onClick={fetchTransactionsData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-2 transition-all border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Transaction ID, User ID, Merchant ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>

          {/* Fraud Status Filter */}
          <select
            value={fraudFilter}
            onChange={(e) => { setFraudFilter(e.target.value); setPage(1); }}
            className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Fraud Statuses</option>
            <option value="0">Legitimate Only (0)</option>
            <option value="1">Fraudulent Only (1)</option>
          </select>

          {/* Merchant Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Categories</option>
            <option value="ecommerce">Ecommerce</option>
            <option value="travel">Travel</option>
            <option value="gaming">Gaming</option>
            <option value="electronics">Electronics</option>
            <option value="grocery">Grocery</option>
            <option value="services">Services</option>
            <option value="crypto">Crypto</option>
          </select>

          {/* Payment Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
            className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Payment Rails</option>
            <option value="UPI">UPI</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="DEBIT_CARD">Debit Card</option>
            <option value="NET_BANKING">Net Banking</option>
            <option value="WALLET">Wallet</option>
          </select>

        </form>
      </div>

      {/* Transactions Table & Mobile Card View */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        
        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Transaction ID</th>
                <th className="py-2.5 px-3">User ID</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Payment Rail</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Risk Assessment</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
                    <span>Loading transaction records...</span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    No matching transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr
                    key={txn.transaction_id}
                    onClick={() => setSelectedTxn(txn)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-all"
                  >
                    <td className="py-3 px-3 font-bold text-cyan-400 font-mono">{txn.transaction_id}</td>
                    <td className="py-3 px-3 text-slate-300 font-mono">{txn.user_id}</td>
                    <td className="py-3 px-3 font-bold text-slate-100">{formatCurrency(txn.amount)}</td>
                    <td className="py-3 px-3 text-slate-300">{txn.payment_method}</td>
                    <td className="py-3 px-3 text-slate-400 capitalize">{txn.merchant_category}</td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">{txn.transaction_timestamp}</td>
                    <td className="py-3 px-3">{renderRiskBadge(txn)}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-xs text-cyan-400 font-semibold hover:underline">Inspect →</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards View */}
        <div className="sm:hidden space-y-3">
          {loading ? (
            <div className="py-8 text-center text-slate-500">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
              <span>Loading transaction records...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              No matching transactions found.
            </div>
          ) : (
            transactions.map((txn) => (
              <div
                key={txn.transaction_id}
                onClick={() => setSelectedTxn(txn)}
                className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2 cursor-pointer hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-400">{txn.transaction_id}</span>
                  {renderRiskBadge(txn)}
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">User / Amount:</span>
                  <span className="font-bold text-white">{txn.user_id} • {formatCurrency(txn.amount)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Rail / Sector:</span>
                  <span className="text-slate-300">{txn.payment_method} • {txn.merchant_category}</span>
                </div>
                <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-900 flex justify-between items-center">
                  <span>{txn.transaction_timestamp}</span>
                  <span className="text-cyan-400 font-bold">Tap to Inspect →</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
          <span>Page {page} of {totalPages || 1}</span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
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

    </div>
  )
}
