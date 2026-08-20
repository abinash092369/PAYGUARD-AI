import axiosClient from './axiosClient'

/**
 * Fetches paginated transaction records with optional search and filtering parameters.
 */
export const getTransactions = async ({
  page = 1,
  limit = 20,
  search = '',
  fraud_label = null,
  merchant_category = '',
  payment_method = '',
} = {}) => {
  const params = { page, limit }
  if (search) params.search = search
  if (fraud_label !== null && fraud_label !== '') params.fraud_label = fraud_label
  if (merchant_category) params.merchant_category = merchant_category
  if (payment_method) params.payment_method = payment_method

  const response = await axiosClient.get('/api/transactions', { params })
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
 */
export const getTransactionById = async (transactionId) => {
  const response = await axiosClient.get(`/api/transactions/${transactionId}`)
  return response.data
}
