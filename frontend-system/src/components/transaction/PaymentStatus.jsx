import Button from '../ui/Button.jsx'
import StatusIndicator from '../ui/StatusIndicator.jsx'
import { formatIndianAmount } from '../payment/amountUtils.js'
import ContinuityLock from './ContinuityLock.jsx'
import TransactionTimeline from './TransactionTimeline.jsx'

const copy = { PROCESSING: ['Payment is being confirmed', 'Your payment is being checked.'], SUCCESS: ['Payment successful', 'Your payment was completed.'], FAILED: ['Payment failed', 'Your payment was not completed.'], PENDING: ['Payment still being confirmed', 'Your payment is still being processed. Please do not make another payment yet.'], UNKNOWN: ['Payment status unavailable', "We couldn't confirm the payment yet."] }
export default function PaymentStatus({ status, intent, transactionId = 'TXN001', continuityLocked = false, onDone, onRetry, onCheckStatus, onViewPrevious }) {
  if (continuityLocked || status === 'PENDING' || status === 'UNKNOWN') return <section className="status-page"><p className="eyebrow">Transaction status</p><TransactionTimeline status={status} /><ContinuityLock intent={intent} status={status} existingTransactionId={transactionId} onViewPrevious={onViewPrevious} onCheckStatus={onCheckStatus} /></section>
  const [title, message] = copy[status]
  return <section className={`status-page status-page--${status.toLowerCase()}`} aria-live="polite"><p className="status-page__mark" aria-hidden="true">{status === 'SUCCESS' ? '✓' : status === 'FAILED' ? '!' : '...'}</p><StatusIndicator status={status === 'SUCCESS' ? 'success' : status === 'FAILED' ? 'danger' : 'pending'}>{status}</StatusIndicator><h2>{title}</h2><div className="status-page__amount">₹{formatIndianAmount(intent.amount)}</div><p className="status-page__recipient">{status === 'SUCCESS' ? 'Sent to' : ''}<strong>{intent.recipient.name}</strong><span>{intent.recipient.upiId}</span></p>{status === 'SUCCESS' && <p className="status-page__transaction">Transaction ID <strong>{transactionId}</strong></p>}<p className="status-page__message">{message}</p><TransactionTimeline status={status} />{status === 'FAILED' ? <Button fullWidth onClick={onRetry}>Try again</Button> : <Button fullWidth onClick={onDone}>Done</Button>}</section>
}
