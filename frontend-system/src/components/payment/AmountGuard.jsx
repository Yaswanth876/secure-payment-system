import { useState } from 'react'
import Button from '../ui/Button.jsx'
import StatusIndicator from '../ui/StatusIndicator.jsx'
import { formatIndianAmount, getAmountState } from './amountUtils.js'

export default function AmountGuard({ amount, previousAmount, recipientName, onEdit, onContinue }) {
  const state = getAmountState(amount)
  const [acknowledged, setAcknowledged] = useState(false)
  const comparison = previousAmount && Number(amount) > Number(previousAmount) ? `This payment is ${Math.round(Number(amount) / Number(previousAmount))}× larger than your previous payment to ${recipientName}.` : ''
  const messages = { normal: 'Ready to review', warning: 'This is a larger-than-usual payment. Please verify the amount.', 'high-impact': 'This is a high-impact payment. Please take a moment to verify the amount.', error: 'Please enter a valid amount.' }
  return <section className={`amount-guard amount-guard--${state}`} aria-live="polite"><p className="eyebrow">Verify amount</p><div className="amount-guard__value">₹{formatIndianAmount(amount)}</div><StatusIndicator status={state === 'normal' ? 'success' : state === 'error' ? 'danger' : 'warning'}>{messages[state]}</StatusIndicator><p className="amount-guard__message">{state === 'error' ? messages.error : 'Please verify that this is the amount you intend to send.'}</p>{comparison && <p className="amount-guard__comparison">{comparison}</p>}<label className="amount-guard__ack"><input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} disabled={state === 'error'} /><span>I confirm that ₹{formatIndianAmount(amount)} is correct</span></label><div className="amount-guard__actions"><Button variant="outline" onClick={onEdit}>Edit amount</Button><Button onClick={onContinue} disabled={state === 'error' || !acknowledged}>Continue</Button></div></section>
}
