import RecipientIdentityCard from './RecipientIdentityCard.jsx';
import { Button } from './ui/button.jsx';

const money = value => `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

export default function PrePaymentReceipt({ preview, loading, error, onBack, onContinue, onViewPrevious }) {
  const { recipient, sender, amount, safety } = preview;
  const isBlocked = Boolean(safety.continuityLock);
  const hasWarning = Boolean(safety.isNewRecipient || safety.amountWarning || safety.previousSuccessfulPayment || isBlocked);

  return <section className="page reveal pre-payment-receipt">
    <div className="page-header"><Button variant="ghost" className="back-button" onClick={onBack} aria-label="Edit payment">←</Button><h1>Payment review</h1></div>
    <p className="page-intro">Check who, how much, and where the money comes from.</p>
    <div className="receipt-block">
      <section className="receipt-section receipt-who"><span className="eyebrow">Who</span><RecipientIdentityCard recipient={{ ...recipient, isNew: safety.isNewRecipient }} /></section>
      <section className="receipt-section receipt-amount"><span className="eyebrow">How much</span><strong>{money(amount.rupees)}</strong><span className="receipt-paisee">{amount.paise.toLocaleString('en-IN')} paise</span></section>
      <section className="receipt-section receipt-from"><span className="eyebrow">From where</span><h2>{sender.name}</h2><p>{sender.upiId}</p><p>{sender.bankName} <strong>{sender.maskedAccountNumber}</strong></p></section>
    </div>
    <section className="receipt-safety" aria-live="polite"><span className="eyebrow">Safety check</span>{safety.isNewRecipient && <SafetyItem title="New recipient">Please carefully verify the recipient details.</SafetyItem>}{safety.amountWarning && <SafetyItem title="Amount check">{safety.amountWarning.message}</SafetyItem>}{safety.previousSuccessfulPayment && <SafetyItem title="Previous payment found">A previous payment with these details was successful. Review carefully before confirming again.</SafetyItem>}{isBlocked && <SafetyItem title="Payment already unresolved">A previous payment with this recipient and amount is still unresolved. Do not pay again until its status is known.</SafetyItem>}{!hasWarning && <SafetyItem title="No additional safety warnings">The available payment checks found nothing else to review.</SafetyItem>}</section>
    {error && <div className="receipt-error"><span>{error}</span></div>}
    {isBlocked ? <div className="receipt-blocked-actions"><strong>Authorization is unavailable for this payment.</strong><Button className="wide" variant="outline" onClick={onViewPrevious}>View previous payment</Button><Button variant="link" onClick={onBack}>Edit payment</Button></div> : loading ? <div className="inline-loading"><span className="spinner" /> Preparing authorization</div> : <Button className="wide" onClick={onContinue}>Continue to confirmation <span>→</span></Button>}
  </section>;
}

function SafetyItem({ title, children }) {
  return <div className="receipt-safety-item"><span className="safety-mark" aria-hidden="true">{title === 'No additional safety warnings' ? '✓' : '!'}</span><div><strong>{title}</strong><p>{children}</p></div></div>;
}