import axiosClient from './axiosClient'

export const getFraudRateAnalytics = async (days = 30) => {
  const response = await axiosClient.get('/api/analytics/fraud-rate', { params: { days } })
  return response.data
}

export const getRiskTrendsAnalytics = async () => {
  const response = await axiosClient.get('/api/analytics/risk-trends')
  return response.data
}

export const getRiskSignalsAnalytics = async () => {
  const response = await axiosClient.get('/api/analytics/risk-signals')
  return response.data
}

export const getMerchantRiskAnalytics = async () => {
  const response = await axiosClient.get('/api/analytics/merchant-risk')
  return response.data
}

export const getPaymentMethodRiskAnalytics = async () => {
  const response = await axiosClient.get('/api/analytics/payment-method-risk')
  return response.data
}
