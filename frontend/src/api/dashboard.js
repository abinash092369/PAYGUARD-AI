import axiosClient from './axiosClient'

/**
 * Fetches high-level aggregated dashboard statistics.
 */
export const getDashboardStats = async () => {
  const response = await axiosClient.get('/api/dashboard/stats')
  return response.data
}

/**
 * Fetches risk distribution counts (LOW, MEDIUM, HIGH, CRITICAL).
 */
export const getRiskDistribution = async () => {
  const response = await axiosClient.get('/api/dashboard/risk-distribution')
  return response.data
}

/**
 * Fetches aggregated fraud trends over time for charts.
 */
export const getFraudTrends = async () => {
  const response = await axiosClient.get('/api/dashboard/fraud-trends')
  return response.data
}

/**
 * Fetches top risk signals frequency.
 */
export const getTopRiskSignals = async () => {
  const response = await axiosClient.get('/api/dashboard/risk-signals')
  return response.data
}

/**
 * Fetches recent transactions for the monitoring table.
 */
export const getRecentTransactions = async (limit = 10) => {
  const response = await axiosClient.get('/api/dashboard/recent-transactions', {
    params: { limit },
  })
  return response.data
}
