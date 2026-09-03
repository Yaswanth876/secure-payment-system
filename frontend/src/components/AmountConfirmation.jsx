import { useState } from 'react';

const money = value => `₹${Number(value).toLocaleString('en-IN')}`;

export default function AmountConfirmation({ preview, loading, error, onBack, onConfirm }) {
  const [enteredAmount, setEnteredAmount] = useState('');
  const [mismatch, setMismatch] = useState(false);
  const originalAmount = Number(preview.amount.rupees);

  function checkAmount() {
    const nextAmount = Number(enteredAmount);
    if (!Number.isSafeInteger(nextAmount) || nextAmount <= 0) return;
    if (nextAmount !== originalAmount) {
      setMismatch(true);
      return;
    }
    onConfirm(originalAmount);
  }

  if (mismatch) return <section className="page reveal amount-confirmation-page">
    <div className="page-header"><button className="back-button" onClick={onBack} aria-label="Back to payment receipt">Back</button><h1>Amount mismatch</h1></div>
    <div className="amount-mismatch" role="alert"><span className="eyebrow">Payment blocked</span><h2>Please enter the correct amount</h2><p>The payment amount is <strong>₹{originalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>. You entered <strong>₹{Number(enteredAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>.</p><p>Return to the amount confirmation screen and enter the exact payment amount. This entry cannot change the payment amount.</p></div>
    <button className="primary-button wide" onClick={() => setMismatch(false)}>Try again</button>
  </section>;

  return <section className="page reveal amount-confirmation-page">
    <div className="page-header"><button className="back-button" onClick={onBack} aria-label="Back to payment receipt">←</button><h1>Confirm amount</h1></div>
    <p className="page-intro">Enter the amount again to help prevent mistakes.</p>
    <div className="receipt-person amount-confirmation-recipient"><span className="avatar">{preview.recipient.photo ? <img src={preview.recipient.photo} alt={`${preview.recipient.name}, the person you're paying`} /> : preview.recipient.name.slice(0, 1).toUpperCase()}</span><div><span className="eyebrow">Person you're paying</span><h2>{preview.recipient.name}</h2><p>{preview.recipient.upiId}</p><p>{preview.recipient.bankName} {preview.recipient.maskedAccountNumber}</p></div></div>
    <label className="amount-field amount-confirmation-field"><span>₹</span><input autoFocus inputMode="numeric" type="number" min="1" step="1" value={enteredAmount} onChange={event => { setEnteredAmount(event.target.value); setMismatch(false); }} placeholder="0" aria-label="Enter amount again in rupees" /></label>
    <p className="field-note">Enter the amount you want to send to {preview.recipient.name}.</p>
    {error && <p className="inline-error" role="alert">{error}</p>}
    {loading ? <div className="inline-loading"><span className="spinner" /> Preparing payment</div> : <button className="primary-button wide" onClick={checkAmount}>Check amount <span>→</span></button>}
  </section>;
}
