import Button from '../ui/Button.jsx'
import Card from '../ui/Card.jsx'
import RecipientIdentityCard from './RecipientIdentityCard.jsx'
import { formatIndianAmount } from './amountUtils.js'

export default function PrePaymentReceipt({ intent, onEditRecipient, onEditAmount, onEditSource, onContinue, loading = false }) {
  return <section className="receipt"><div className="receipt__heading"><p className="eyebrow">Final review</p><h2>Review payment</h2><p>Make sure these details look right before continuing.</p></div><div className="receipt__amount"><span>How much</span><strong>₹{formatIndianAmount(intent.amount)}</strong></div><RecipientIdentityCard recipient={intent.recipient} onEdit={onEditRecipient} /><Card variant="outlined" className="source-card"><div><p className="source-card__label">Paying from</p><h3>Primary Bank Account</h3><p>Account •••• 7392</p></div><button type="button" className="text-button" onClick={onEditSource}>Edit source account</button></Card><p className="receipt__message">Review carefully before confirming.</p><div className="receipt__actions"><Button variant="outline" onClick={onEditAmount} disabled={loading}>Edit amount</Button><Button loading={loading} onClick={onContinue}>Send</Button></div></section>
}
