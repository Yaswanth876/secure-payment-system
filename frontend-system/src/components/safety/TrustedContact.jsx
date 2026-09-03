import { useState } from 'react'
import Button from '../ui/Button.jsx'
import Card from '../ui/Card.jsx'
import { formatIndianAmount } from '../payment/amountUtils.js'

export default function TrustedContact({ intent }) {
  const [requested, setRequested] = useState(false)
  return <Card variant="outlined" className="trusted-contact">{requested ? <><p className="trusted-contact__mark">✓</p><h2>Request sent</h2><p>Your trusted contact has been asked to review the payment.</p><strong>You remain the final decision maker.</strong></> : <><p className="eyebrow">Optional support</p><h2>Need another pair of eyes?</h2><p>This payment may benefit from someone you trust reviewing it.</p><p className="trusted-contact__payment">₹{formatIndianAmount(intent.amount)} <span aria-hidden="true">-&gt;</span> {intent.recipient.name}</p><div className="trusted-contact__actions"><Button onClick={() => setRequested(true)}>Ask trusted contact</Button><Button variant="outline">Continue myself</Button></div></>}</Card>
}
