import { useState } from 'react';
import { Button } from './ui/button.jsx';
import { recipientPhoto } from '../lib/recipientPhoto.js';

const money = value => `₹${Number(value).toLocaleString('en-IN')}`;

export default function AmountConfirmation({ preview, loading, error, onBack, onConfirm }) {
  const [enteredAmount, setEnteredAmount] = useState('');
  const [mismatch, setMismatch] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState('');
  const originalAmount = Number(preview.amount.rupees);

  function checkAmount() {
    const nextAmount = Number(enteredAmount);
    if (!Number.isSafeInteger(nextAmount) || nextAmount <= 0) return;
    if (nextAmount !== originalAmount) {
      setSelectedAmount('');
      setMismatch(true);
      return;
    }
    onConfirm(originalAmount);
  }

  function useSelectedAmount() {
    if (!selectedAmount) return;
    setEnteredAmount(selectedAmount);
    setMismatch(false);
  }

  if (mismatch) return <section className="page reveal amount-confirmation-page">
    <div className="page-header"><Button variant="ghost" className="back-button" onClick={onBack} aria-label="Back to payment receipt">←</Button><h1>Amount mismatch</h1></div>
    <div className="amount-mismatch" role="alert"><span className="eyebrow">Payment blocked</span><h2>Select the actual amount</h2><p>The two entered amounts do not match. Select the amount you intended to send.</p><div className="amount-mismatch-values"><Button variant={selectedAmount === String(originalAmount) ? 'default' : 'outline'} onClick={() => setSelectedAmount(String(originalAmount))}><span>First entered amount</span><strong>₹{originalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></Button><Button variant={selectedAmount === enteredAmount ? 'default' : 'outline'} onClick={() => setSelectedAmount(enteredAmount)}><span>Second entered amount</span><strong>₹{Number(enteredAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></Button></div></div>
    <Button className="wide" onClick={useSelectedAmount} disabled={!selectedAmount}>Use selected amount</Button>
  </section>;

  return <section className="page reveal amount-confirmation-page">
    <div className="page-header"><Button variant="ghost" className="back-button" onClick={onBack} aria-label="Back to payment receipt">←</Button><h1>Confirm amount</h1></div>
    <p className="page-intro">Enter the amount again to help prevent mistakes.</p>
    <div className="receipt-person amount-confirmation-recipient"><span className="avatar">{recipientPhoto(preview.recipient) ? <img src={recipientPhoto(preview.recipient)} alt={`${preview.recipient.name}, the person you're paying`} /> : preview.recipient.name.slice(0, 1).toUpperCase()}</span><div><span className="eyebrow">Person you're paying</span><h2>{preview.recipient.name}</h2><p>{preview.recipient.upiId}</p><p>{preview.recipient.bankName} {preview.recipient.maskedAccountNumber}</p></div></div>
    <label className="amount-field amount-confirmation-field"><span>₹</span><input autoFocus inputMode="numeric" type="number" min="1" step="1" value={enteredAmount} onChange={event => { setEnteredAmount(event.target.value); setMismatch(false); }} placeholder="0" aria-label="Enter amount again in rupees" /></label>
    <p className="field-note">Enter the amount you want to send to {preview.recipient.name}.</p>
    {error && <p className="inline-error" role="alert">{error}</p>}
    {loading ? <div className="inline-loading"><span className="spinner" /> Preparing payment</div> : <Button className="wide" onClick={checkAmount}>Check amount <span>→</span></Button>}
  </section>;
}
