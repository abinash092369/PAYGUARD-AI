import axiosClient from './axiosClient'

export const getMonitoringSummary = async () => {
  const response = await axiosClient.get('/api/monitoring/summary')
  return response.data
}

export const getHighRiskQueue = async (page = 1, limit = 20) => {
  const response = await axiosClient.get('/api/monitoring/high-risk', { params: { page, limit } })
  return response.data
}

export const getCriticalQueue = async (page = 1, limit = 20) => {
  const response = await axiosClient.get('/api/monitoring/critical', { params: { page, limit } })
  return response.data
}
