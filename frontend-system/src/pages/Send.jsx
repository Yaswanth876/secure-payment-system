import { useEffect, useMemo, useState } from 'react'
import AppShell from '../components/layout/AppShell.jsx'
import { AmountGuard, AmountInput, CoolingOff, PrePaymentReceipt, RecipientIdentityCard, RecipientList, RecipientSearch, SlideToConfirm } from '../components/payment/index.js'
import Button from '../components/ui/Button.jsx'
import { PaymentStatus } from '../components/transaction/index.js'
import { mockRecipients } from '../data/mockData.js'

export default function Send() {
	const [search, setSearch] = useState('')
	const [recipient, setRecipient] = useState(null)
	const [amount, setAmount] = useState('')
	const [step, setStep] = useState('recipient')
	const [amountError, setAmountError] = useState('')
	const [intent, setIntent] = useState(null)
	const [sourceNote, setSourceNote] = useState(false)
	const [status, setStatus] = useState('PROCESSING')
	const matches = useMemo(() => mockRecipients.filter((item) => `${item.name} ${item.upiId} ${item.phone || ''}`.toLowerCase().includes(search.toLowerCase())), [search])
	const selectRecipient = (nextRecipient) => { setRecipient(nextRecipient); setStep('amount'); setAmountError('') }
	const continueToGuard = () => { if (!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0) { setAmountError('Enter an amount greater than zero.'); return } setAmountError(''); setStep('guard') }
	const continueToReceipt = () => { setIntent({ recipientId: recipient.id, recipient, amount }); setStep('receipt') }
	const editRecipient = () => { setStep('recipient'); setIntent(null) }
	const confirmCooling = () => setStep('slider')
	const showProcessing = () => setStep('processing')
	useEffect(() => { if (step !== 'processing') return undefined; const timer = window.setTimeout(() => { setStatus('PENDING'); setStep('status') }, 900); return () => window.clearTimeout(timer) }, [step])
	return <AppShell><div className="content-wrap send-page">
		<div className="send-page__heading"><p className="eyebrow">Payment setup</p><h1>Send money</h1><p>Take a moment to check the person and amount.</p></div>
		{step === 'recipient' && <section className="send-step"><h2>Who do you want to pay?</h2><RecipientSearch value={search} onChange={setSearch} /><div className="section-heading send-section-heading"><h3>{search ? 'Search results' : 'Recent and saved'}</h3></div><RecipientList recipients={matches} onSelect={selectRecipient} /><button type="button" className="upi-link" onClick={() => setSearch('')}>Or enter a UPI ID</button></section>}
		{step === 'amount' && recipient && <section className="send-step"><button className="back-button" type="button" onClick={() => setStep('recipient')}>&lt;- Back to people</button><RecipientIdentityCard recipient={recipient} onEdit={() => setStep('recipient')} /><div className="amount-section"><h2>How much?</h2><p>Paying {recipient.name}</p><AmountInput value={amount} onChange={(value) => { setAmount(value); setAmountError('') }} error={amountError} /><Button fullWidth onClick={continueToGuard}>Continue</Button></div></section>}
		{step === 'guard' && recipient && <section className="send-step"><button className="back-button" type="button" onClick={() => setStep('amount')}>&lt;- Edit payment</button><RecipientIdentityCard recipient={recipient} onEdit={editRecipient} /><AmountGuard amount={amount} onEdit={() => setStep('amount')} onContinue={continueToReceipt} /></section>}
		{step === 'receipt' && intent && <section className="send-step"><button className="back-button" type="button" onClick={() => setStep('guard')}>&lt;- Back to amount</button><PrePaymentReceipt intent={intent} onEditRecipient={editRecipient} onEditAmount={() => setStep('amount')} onEditSource={() => setSourceNote(true)} onContinue={() => setStep('cooling')} />{sourceNote && <p className="prototype-note">Source account switching is informational in this prototype.</p>}</section>}
		{step === 'cooling' && intent && <section className="send-step"><CoolingOff intent={intent} reason={intent.recipient.isNewRecipient ? 'new_recipient' : Number(intent.amount) >= 10000 ? 'high_amount' : 'unusual_context'} onBack={() => setStep('receipt')} onContinue={confirmCooling} /></section>}
		{step === 'slider' && intent && <section className="send-step"><div className="slider-heading"><p className="eyebrow">One last check</p><h2>Confirm deliberately</h2><p>Slide to confirm the person and amount.</p></div><SlideToConfirm intent={intent} onConfirm={showProcessing} /></section>}
		{step === 'processing' && intent && <section className="send-step"><div className="processing-state" aria-live="polite"><span className="loader" aria-label="Confirming payment" /><p className="eyebrow">Confirming payment...</p><strong>₹{new Intl.NumberFormat('en-IN').format(Number(intent.amount))}</strong><span>{intent.recipient.name}</span><small>No payment has been processed yet.</small></div></section>}
		{step === 'status' && intent && <section className="send-step"><PaymentStatus status={status} intent={intent} transactionId="TXN001" continuityLocked={status === 'PENDING'} onDone={() => setStep('recipient')} onRetry={() => setStep('receipt')} onCheckStatus={() => setStatus('PENDING')} onViewPrevious={() => setStatus('PENDING')} /></section>}
	</div></AppShell>
}
