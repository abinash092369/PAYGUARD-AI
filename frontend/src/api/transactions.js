import axiosClient from './axiosClient'

/**
 * Fetches paginated transaction records.
 * @param {number} page
 * @param {number} limit
 */
export const getTransactions = async (page = 1, limit = 20) => {
  const response = await axiosClient.get('/api/transactions', {
    params: { page, limit },
  })
  return response.data
}

/**
 * Fetches transaction statistics summary.
 */
export const getTransactionStats = async () => {
  const response = await axiosClient.get('/api/transactions/stats')
  return response.data
}

/**
 * Fetches a single transaction details by ID.
 * @param {string} transactionId
 */
export const getTransactionById = async (transactionId) => {
  const response = await axiosClient.get(`/api/transactions/${transactionId}`)
  return response.data
}
