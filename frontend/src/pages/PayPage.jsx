import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import AmountConfirmation from '../components/AmountConfirmation.jsx';
import DemoAuthorization from '../components/DemoAuthorization.jsx';
import RecipientCard from '../components/RecipientCard.jsx';
import RecipientIdentityCard from '../components/RecipientIdentityCard.jsx';
import PrePaymentReceipt from '../components/PrePaymentReceipt.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';

export default function PayPage({ flow, recipients, query, setQuery, selectedRecipient, recipientLoading, recipientError, amount, setAmount, preview, transaction, lockData, error, loading, onSelect, onAmount, onConfirm, onSend, onBack, onDone, onViewPrevious, onRefresh }) {
  if (flow === 'recipient') return <section className="page reveal"><PageHeader title="Pay" onBack={onBack} /><p className="page-intro">Choose who you are paying.</p><label className="search-box"><span>⌕</span><Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Name or UPI ID" aria-label="Search recipients" /></label>{error && <ErrorState message={error} />}{recipients.map(recipient => <RecipientCard key={recipient.recipientId} recipient={recipient} onClick={() => onSelect(recipient)} />)}</section>;
  if (recipientLoading) return <section className="page reveal"><PageHeader title="Recipient" onBack={onBack} /><LoadingState label="Loading recipient details" /></section>;
  if (recipientError) return <section className="page reveal"><PageHeader title="Recipient" onBack={onBack} /><ErrorState message={recipientError} /><Button className="wide" onClick={onBack}>Back to recipients</Button></section>;
  if (flow === 'amount') return <section className="page reveal"><PageHeader title="Amount" onBack={onBack} /><RecipientIdentityCard recipient={selectedRecipient} /><label className="amount-field"><span>₹</span><Input autoFocus inputMode="numeric" type="number" min="1" step="1" value={amount} onChange={event => setAmount(event.target.value)} placeholder="0" aria-label="Amount in rupees" /></label><p className="field-note">Enter the whole amount in rupees.</p>{error && <ErrorState message={error} />}{loading ? <LoadingState label="Preparing review" /> : <Button className="wide" onClick={onAmount}>Review payment <span>→</span></Button>}</section>;
  if (flow === 'review') return <PrePaymentReceipt preview={preview} loading={loading} error={error} onBack={onBack} onContinue={onSend} onViewPrevious={onViewPrevious} />;
  if (flow === 'amount-confirmation') return <AmountConfirmation preview={preview} loading={loading} error={error} onBack={onBack} onConfirm={onConfirm} />;
  if (flow === 'pin') return <DemoAuthorization preview={preview} loading={loading} error={error} onBack={onBack} onAuthorize={onConfirm} />;
  if (flow === 'processing') return <StatusScreen status="PROCESSING" transaction={transaction || preview} loading={loading} onRefresh={onRefresh} />;
  if (flow === 'locked') return <LockScreen lockData={lockData} preview={preview} onBack={onBack} onViewPrevious={onViewPrevious} />;
  return <StatusScreen status={transaction?.status} transaction={transaction} onDone={onDone} onRefresh={onRefresh} />;
}

function PageHeader({ title, onBack }) {
  return <div className="page-header"><Button variant="ghost" className="back-button" onClick={onBack} aria-label="Go back">←</Button><h1>{title}</h1></div>;
}

function StatusScreen({ status, transaction, onDone, onRefresh }) {
  const unresolved = ['PROCESSING', 'PENDING', 'UNKNOWN'].includes(status);
  const failed = status === 'FAILED';
  const statusText = { SUCCESS: 'Payment successful', FAILED: 'Payment failed', PENDING: 'Payment still processing', PROCESSING: 'Payment processing', UNKNOWN: 'Payment status unclear' };
  const money = value => `₹${Number(value).toLocaleString('en-IN')}`;
  return <section className="page centered reveal"><div className={`status-glyph ${unresolved ? 'ring' : ''}`}>{status === 'SUCCESS' ? '✓' : status === 'FAILED' ? '×' : '?'}</div><span className="eyebrow">{status}</span><h1>{statusText[status] || 'Payment processing'}</h1>{transaction && <><div className="result-amount">{money(transaction.amount.rupees)}</div><h2>{transaction.recipient?.name}</h2><p>{transaction.recipient?.upiId}</p></>}{unresolved ? <div className="do-not-pay"><strong>DON'T PAY AGAIN</strong><p>{status === 'UNKNOWN' ? 'UNKNOWN does not mean failed. Wait until the final status is known.' : 'Your previous payment has not been resolved yet.'}</p>{onRefresh && <Button variant="outline" onClick={onRefresh}>Check status</Button>}</div> : failed ? <p>The payment was not completed.</p> : status === 'SUCCESS' ? <p>Transaction confirmed.</p> : null}{status === 'SUCCESS' || failed ? <Button className="wide" onClick={onDone}>{failed ? 'Try again' : 'Done'} <span>→</span></Button> : null}</section>;
}

function LockScreen({ lockData, preview, onBack, onViewPrevious }) {
  const money = value => `₹${Number(value).toLocaleString('en-IN')}`;
  return <section className="page centered lock-screen reveal"><div className="lock-icon">⌕</div><span className="eyebrow">Duplicate payment protection</span><h1>Payment protected</h1><p className="page-intro">You already have a payment being processed for this recipient.</p><div className="lock-summary"><strong>{money(preview.amount.rupees)}</strong><h2>{preview.recipient.name}</h2><p>{preview.recipient.upiId}</p><div className="lock-status"><span>Previous payment</span><strong>{lockData?.existingStatus || 'UNRESOLVED'}</strong></div></div><div className="do-not-pay"><strong>DON'T PAY TWICE</strong><p>Your previous payment has not been resolved yet.</p></div><Button variant="outline" className="wide" onClick={onViewPrevious}>View previous payment</Button><Button variant="link" onClick={onBack}>Cancel</Button></section>;
}
