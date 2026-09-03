import { formatIndianAmount } from './amountUtils.js'

export default function PaymentIntentSummary({ intent, compact = false }) {
  return <div className={`intent-summary ${compact ? 'intent-summary--compact' : ''}`}><div><span>To</span><strong>{intent.recipient.name}</strong><small>{intent.recipient.upiId}</small></div><div><span>Amount</span><strong>₹{formatIndianAmount(intent.amount)}</strong></div></div>
}
