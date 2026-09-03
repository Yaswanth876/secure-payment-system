import { useState } from 'react'
import Button from '../ui/Button.jsx'
import { formatIndianAmount } from './amountUtils.js'
import RecipientIdentityCard from './RecipientIdentityCard.jsx'

export default function AmountConfirmation({ intent, onMatch, onMismatchChoice, onBack }) {
  const [enteredAmount, setEnteredAmount] = useState('')
  const [error, setError] = useState('')
  const [mismatch, setMismatch] = useState(false)
  const submit = () => {
    const value = Number(enteredAmount)
    if (!enteredAmount || !Number.isFinite(value) || value <= 0) { setError('Enter an amount greater than zero.'); return }
    setError('')
    if (value !== Number(intent.amount)) { setMismatch(true); return }
    onMatch()
  }
  return <section className="amount-confirmation" aria-live="polite"><button type="button" className="back-button" onClick={onBack}>&lt;- Back to review</button><p className="eyebrow">Confirm amount</p><h2>Enter the amount again</h2><RecipientIdentityCard recipient={intent.recipient} onEdit={onBack} /><p className="amount-confirmation__help">Type the amount you want to send to {intent.recipient.name}.</p><label htmlFor="amount-again">Amount</label><div className="amount-confirmation__input"><span aria-hidden="true">₹</span><input id="amount-again" type="text" inputMode="decimal" autoComplete="off" placeholder="0" value={enteredAmount} onChange={(event) => { setEnteredAmount(event.target.value); setError(''); setMismatch(false) }} /></div>{error && <p className="field__message field__message--error" role="alert">{error}</p>}{mismatch && <div className="amount-mismatch" role="alert"><p className="eyebrow">Amounts do not match</p><h3>Which amount do you want to pay?</h3><p>Check both amounts carefully before choosing.</p><div className="amount-mismatch__values"><button type="button" onClick={() => onMismatchChoice(intent.amount)}><span>Receipt amount</span><strong>₹{formatIndianAmount(intent.amount)}</strong></button><button type="button" onClick={() => onMismatchChoice(enteredAmount)}><span>Amount entered again</span><strong>₹{formatIndianAmount(enteredAmount)}</strong></button></div></div>}<Button fullWidth onClick={submit}>Check amount</Button></section>
}
