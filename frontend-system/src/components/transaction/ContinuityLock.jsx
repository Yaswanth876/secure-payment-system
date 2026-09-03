import Button from '../ui/Button.jsx'
import Card from '../ui/Card.jsx'
import StatusIndicator from '../ui/StatusIndicator.jsx'
import { formatIndianAmount } from '../payment/amountUtils.js'

export default function ContinuityLock({ intent, existingTransactionId, status, onViewPrevious, onCheckStatus }) {
  const unknown = status === 'UNKNOWN'
  return <Card variant="outlined" className="continuity-lock"><StatusIndicator status={unknown ? 'warning' : 'pending'}>{unknown ? 'Status unavailable' : 'Payment pending'}</StatusIndicator><h2>{unknown ? 'Payment status unavailable' : 'Payment pending'}</h2><p className="continuity-lock__amount">₹{formatIndianAmount(intent.amount)} <span aria-hidden="true">-&gt;</span> {intent.recipient.name}</p><p>{unknown ? "We couldn't confirm the payment yet. Please check the transaction status before trying again." : 'Your previous payment is still being confirmed. Making another payment now could result in paying twice.'}</p><p className="continuity-lock__id">Existing transaction: <strong>{existingTransactionId}</strong></p><div className="continuity-lock__actions"><Button variant="outline" onClick={onViewPrevious}>View previous payment</Button><Button onClick={onCheckStatus}>Check status</Button></div></Card>
}
