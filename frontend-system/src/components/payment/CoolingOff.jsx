import { useEffect, useState } from 'react'
import Button from '../ui/Button.jsx'
import Card from '../ui/Card.jsx'
import { formatIndianAmount } from './amountUtils.js'

export default function CoolingOff({ intent, reason = 'new_recipient', seconds = 3, onBack, onContinue }) {
  const [remaining, setRemaining] = useState(seconds)
  useEffect(() => { if (remaining <= 0) return undefined; const timer = window.setTimeout(() => setRemaining((value) => value - 1), 1000); return () => window.clearTimeout(timer) }, [remaining])
  const reasonText = { new_recipient: 'This is a new recipient. Please verify who you are paying.', high_amount: 'This is a high-value payment. Please verify the amount.', unusual_context: 'Please take a moment to check this payment.' }
  return <section className="cooling-off" aria-labelledby="cooling-title"><p className="eyebrow">A quick safety pause</p><h2 id="cooling-title">Take a moment</h2><p className="cooling-off__lead">You're about to send</p><Card variant="outlined" className="cooling-off__summary"><strong>₹{formatIndianAmount(intent.amount)}</strong><span>to</span><b>{intent.recipient.name}</b><small>{intent.recipient.upiId}</small></Card><p className="cooling-off__reason" aria-live="polite">{reasonText[reason]}</p><div className="cooling-off__actions"><button type="button" className="back-button" onClick={onBack}>&lt;- Go back</button><Button fullWidth disabled={remaining > 0} onClick={onContinue}>{remaining > 0 ? `Continue in ${remaining}` : 'Continue'}</Button></div></section>
}
