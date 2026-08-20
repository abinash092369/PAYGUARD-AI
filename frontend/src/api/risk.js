import axiosClient from './axiosClient'

/**
 * Analyzes arbitrary transaction telemetry and returns risk score, decision, and risk factors.
 * @param {Object} transactionPayload
 */
export const analyzeTransaction = async (transactionPayload) => {
  const response = await axiosClient.post('/api/risk/analyze', transactionPayload)
  return response.data
}

/**
 * Fetches real-time risk assessment for a specific transaction by transaction ID.
 * @param {string} transactionId
 */
export const getTransactionRisk = async (transactionId) => {
  const response = await axiosClient.get(`/api/transactions/${transactionId}/risk`)
  return response.data
}
