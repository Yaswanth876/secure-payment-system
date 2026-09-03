import { useState } from 'react'
import Button from '../ui/Button.jsx'
import Card from '../ui/Card.jsx'
import StatusIndicator from '../ui/StatusIndicator.jsx'
import { formatIndianAmount } from '../payment/amountUtils.js'

export default function SafetyHold({ intent, initialState = 'HOLD_REQUIRED' }) {
  const [state, setState] = useState(initialState)
  const messages = { HOLD_REQUIRED: ['Additional verification required', 'This payment has been paused while the required verification is completed.'], HOLD_ACTIVE: ['Safety Hold active', 'This demo payment is temporarily held for verification.'], HOLD_VERIFIED: ['Verification complete', 'The demo safety check is complete.'], HOLD_CANCELLED: ['Safety Hold cancelled', 'This demo payment was cancelled before processing.'] }
  const [title, message] = messages[state]
  return <Card variant="outlined" className={`safety-hold safety-hold--${state.toLowerCase()}`}><p className="eyebrow">Demo safety workflow</p><StatusIndicator status={state === 'HOLD_VERIFIED' ? 'success' : state === 'HOLD_CANCELLED' ? 'neutral' : 'warning'}>{state.replace('_', ' ')}</StatusIndicator><h2>{title}</h2><p>{message}</p><div className="safety-hold__summary"><strong>₹{formatIndianAmount(intent.amount)}</strong><span>{intent.recipient.name}</span></div>{state === 'HOLD_REQUIRED' && <Button fullWidth onClick={() => setState('HOLD_ACTIVE')}>Verify</Button>}{state === 'HOLD_ACTIVE' && <div className="safety-hold__actions"><Button onClick={() => setState('HOLD_VERIFIED')}>Complete demo verification</Button><Button variant="outline" onClick={() => setState('HOLD_CANCELLED')}>Cancel</Button></div>}</Card>
}
