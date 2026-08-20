/**
 * Formats a number into INR currency format.
 */
export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Returns CSS classes for risk label badges.
 */
export const getRiskBadgeColor = (fraudLabel) => {
  return fraudLabel === 1
    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
}
