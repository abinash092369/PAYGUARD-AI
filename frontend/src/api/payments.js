import axiosClient from './axiosClient'

/**
 * Creates a Razorpay Test Mode order in paise via backend API.
 * @param {number} amount In INR rupees (e.g. 500)
 * @param {string} currency Defaults to "INR"
 */
export const createPaymentOrder = async (amount, currency = 'INR') => {
  const response = await axiosClient.post('/api/payments/create-order', {
    amount,
    currency,
  })
  return response.data
}

/**
 * Verifies Razorpay payment signature server-side and executes PayGuard AI risk engine.
 */
export const verifyPayment = async (
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  telemetry_override = null
) => {
  const response = await axiosClient.post('/api/payments/verify', {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    telemetry_override,
  })
  return response.data
}

/**
 * Fetches recent Razorpay test mode payment history.
 */
export const getPayments = async (page = 1, limit = 20) => {
  const response = await axiosClient.get('/api/payments', {
    params: { page, limit },
  })
  return response.data
}
