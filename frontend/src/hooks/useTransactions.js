import { useState, useEffect } from 'react'
import { getTransactions, getTransactionStats } from '../api/transactions'

export const useTransactions = (page = 1, limit = 20) => {
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setLoading(true)
        const [txData, statsData] = await Promise.all([
          getTransactions(page, limit),
          getTransactionStats(),
        ])
        if (isMounted) {
          setTransactions(txData)
          setStats(statsData)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch transaction data')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [page, limit])

  return { transactions, stats, loading, error }
}
