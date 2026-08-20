import axiosClient from './axiosClient'

/**
 * Fetches paginated alert records with optional filters.
 */
export const getAlerts = async ({
  page = 1,
  limit = 20,
  status = '',
  severity = '',
  risk_level = '',
  search = '',
} = {}) => {
  const params = { page, limit }
  if (status) params.status = status
  if (severity) params.severity = severity
  if (risk_level) params.risk_level = risk_level
  if (search) params.search = search

  const response = await axiosClient.get('/api/alerts', { params })
  return response.data
}

/**
 * Fetches summary statistics for alerts.
 */
export const getAlertStats = async () => {
  const response = await axiosClient.get('/api/alerts/stats')
  return response.data
}

/**
 * Fetches recent alerts stream.
 */
export const getRecentAlerts = async (limit = 10) => {
  const response = await axiosClient.get('/api/alerts/recent', { params: { limit } })
  return response.data
}

/**
 * Fetches alert details by alert ID.
 */
export const getAlertById = async (alertId) => {
  const response = await axiosClient.get(`/api/alerts/${alertId}`)
  return response.data
}

/**
 * Updates status of an alert (OPEN, INVESTIGATING, RESOLVED, DISMISSED).
 */
export const updateAlertStatus = async (alertId, status) => {
  const response = await axiosClient.patch(`/api/alerts/${alertId}`, { status })
  return response.data
}
