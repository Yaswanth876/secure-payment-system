export function formatIndianAmount(value) {
  const number = Number(value)
  return Number.isFinite(number) ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(number) : '0'
}

export function getAmountState(value) {
  const amount = Number(value)
  if (!value || !Number.isFinite(amount) || amount <= 0) return 'error'
  if (amount >= 100000) return 'high-impact'
  if (amount >= 10000) return 'warning'
  return 'normal'
}
