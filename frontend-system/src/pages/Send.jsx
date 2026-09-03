import { useEffect, useRef, useState } from 'react'
import AppShell from '../components/layout/AppShell.jsx'
import { AmountConfirmation, AmountGuard, AmountInput, CoolingOff, PrePaymentReceipt, RecipientIdentityCard, RecipientList, RecipientSearch, SlideToConfirm } from '../components/payment/index.js'
import Button from '../components/ui/Button.jsx'
import { PaymentStatus } from '../components/transaction/index.js'
import { SafetyHold } from '../components/safety/index.js'
import Alert from '../components/feedback/Alert.jsx'
import LoadingState from '../components/feedback/LoadingState.jsx'
import { mockRecipients } from '../data/mockData.js'
import { authorizePayment, createPayment, getPayment, getSafetyDecision, searchRecipients } from '../services/api.js'

export default function Send() {
	const [search, setSearch] = useState('')
	const [recipient, setRecipient] = useState(null)
	const [amount, setAmount] = useState('')
	const [step, setStep] = useState('recipient')
	const [amountError, setAmountError] = useState('')
	const [intent, setIntent] = useState(null)
	const [sourceNote, setSourceNote] = useState(false)
	const [status, setStatus] = useState('PROCESSING')
	const [transactionId, setTransactionId] = useState('TXN001')
	const [paymentResult, setPaymentResult] = useState(null)
	const [isPreparing, setIsPreparing] = useState(false)
	const [apiError, setApiError] = useState('')
	const [recipients, setRecipients] = useState(mockRecipients)
	const [searching, setSearching] = useState(false)
	const authorizationInFlight = useRef(false)
	const matches = recipients
	useEffect(() => { let active = true; searchRecipients(search).then((items) => { if (active) setRecipients(items) }).catch(() => { if (active) setApiError("We couldn't search for people. Please try again.") }).finally(() => { if (active) setSearching(false) }); return () => { active = false } }, [search])
	const selectRecipient = (nextRecipient) => { setRecipient(nextRecipient); setStep('amount'); setAmountError('') }
	const continueToGuard = () => { if (!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0) { setAmountError('Enter an amount greater than zero.'); return } setAmountError(''); setStep('guard') }
	const continueToReceipt = async () => { setIsPreparing(true); setApiError(''); try { const created = await createPayment({ recipientId: recipient.id, amount }); setIntent({ recipientId: recipient.id, recipient, amount, paymentIntentId: created.paymentIntentId }); setStep('receipt') } catch { setApiError("We couldn't prepare the payment. Please try again.") } finally { setIsPreparing(false) } }
	const editRecipient = () => { setStep('recipient'); setIntent(null) }
	const continueFromReceipt = () => { if (!isPreparing) setStep('amount-confirmation') }
	const continueAfterAmountConfirmation = async (confirmedAmount) => { if (!intent || isPreparing) return; setIsPreparing(true); setApiError(''); const nextIntent = { ...intent, amount: String(confirmedAmount) }; try { const nextDecision = await getSafetyDecision({ recipientId: nextIntent.recipientId, amount: nextIntent.amount, recipient: nextIntent.recipient }); setIntent(nextIntent); setStep(nextDecision.requiresSafetyHold ? 'hold' : nextDecision.requiresCoolingOff ? 'cooling' : 'slider') } catch { setApiError("We couldn't check the payment safety details. Please try again.") } finally { setIsPreparing(false) } }
	const confirmCooling = () => setStep('slider')
	const showProcessing = async () => { if (!intent || authorizationInFlight.current) return; authorizationInFlight.current = true; setApiError(''); setStep('processing'); try { const result = await authorizePayment({ recipientId: intent.recipientId, amount: intent.amount, paymentIntentId: intent.paymentIntentId }); setPaymentResult(result); setStatus(result.status); setTransactionId(result.transactionId || 'TXN001'); setStep('status') } catch { setApiError("We couldn't confirm the payment yet. Please check the transaction status before trying again."); authorizationInFlight.current = false; setStep('slider') } }
	useEffect(() => { if (step !== 'status' || !paymentResult || ['SUCCESS', 'FAILED'].includes(paymentResult.status)) return undefined; const timer = window.setInterval(async () => { try { const next = await getPayment(paymentResult.transactionId); setPaymentResult(next); setStatus(next.status); setTransactionId(next.transactionId || paymentResult.transactionId) } catch { setApiError("We couldn't check the payment status yet.") } }, 5000); return () => window.clearInterval(timer) }, [step, paymentResult])
	return <AppShell><div className="content-wrap send-page">
		<div className="send-page__heading"><p className="eyebrow">Payment setup</p><h1>Send money</h1><p>Take a moment to check the person and amount.</p></div>
		{apiError && <Alert tone="danger" title="Something went wrong">{apiError}</Alert>}
		{step === 'recipient' && <section className="send-step"><h2>Who do you want to pay?</h2><RecipientSearch value={search} onChange={(value) => { setSearching(true); setSearch(value) }} />{searching && <div className="inline-loading"><LoadingState /> Searching...</div>}<div className="section-heading send-section-heading"><h3>{search ? 'Search results' : 'Recent and saved'}</h3></div><RecipientList recipients={matches} onSelect={selectRecipient} /><button type="button" className="upi-link" onClick={() => setSearch('')}>Or enter a UPI ID</button></section>}
		{step === 'amount' && recipient && <section className="send-step"><button className="back-button" type="button" onClick={() => setStep('recipient')}>&lt;- Back to people</button><RecipientIdentityCard recipient={recipient} onEdit={() => setStep('recipient')} /><div className="amount-section"><h2>How much?</h2><p>Paying {recipient.name}</p><AmountInput value={amount} onChange={(value) => { setAmount(value); setAmountError('') }} error={amountError} /><Button fullWidth onClick={continueToGuard}>Continue</Button></div></section>}
		{step === 'guard' && recipient && <section className="send-step"><button className="back-button" type="button" onClick={() => setStep('amount')}>&lt;- Edit payment</button><RecipientIdentityCard recipient={recipient} onEdit={editRecipient} /><AmountGuard amount={amount} previousAmount={recipient.previousPaymentAmount} recipientName={recipient.name} onEdit={() => setStep('amount')} onContinue={continueToReceipt} /></section>}
		{step === 'receipt' && intent && <section className="send-step"><button className="back-button" type="button" onClick={() => setStep('guard')}>&lt;- Back to amount</button><PrePaymentReceipt intent={intent} loading={isPreparing} onEditRecipient={editRecipient} onEditAmount={() => setStep('amount')} onEditSource={() => setSourceNote(true)} onContinue={continueFromReceipt} />{isPreparing && <div className="inline-loading"><LoadingState /> Preparing payment...</div>}{sourceNote && <p className="prototype-note">Source account switching is informational in this prototype.</p>}</section>}
		{step === 'amount-confirmation' && intent && <section className="send-step"><AmountConfirmation intent={intent} onBack={() => setStep('receipt')} onMatch={() => continueAfterAmountConfirmation(intent.amount)} onMismatchChoice={continueAfterAmountConfirmation} /></section>}
		{step === 'cooling' && intent && <section className="send-step"><CoolingOff intent={intent} reason={intent.recipient.isNewRecipient ? 'new_recipient' : Number(intent.amount) >= 10000 ? 'high_amount' : 'unusual_context'} onBack={() => setStep('receipt')} onContinue={confirmCooling} /></section>}
		{step === 'hold' && intent && <section className="send-step"><SafetyHold intent={intent} onVerified={() => setStep('slider')} /></section>}
		{step === 'slider' && intent && <section className="send-step"><div className="slider-heading"><p className="eyebrow">One last check</p><h2>Confirm deliberately</h2><p>Slide to confirm the person and amount.</p></div><SlideToConfirm intent={intent} onConfirm={showProcessing} /></section>}
		{step === 'processing' && intent && <section className="send-step"><div className="processing-state" aria-live="polite"><span className="loader" aria-label="Confirming payment" /><p className="eyebrow">Confirming payment...</p><strong>₹{new Intl.NumberFormat('en-IN').format(Number(intent.amount))}</strong><span>{intent.recipient.name}</span><small>No payment has been processed yet.</small></div></section>}
		{step === 'status' && intent && <section className="send-step"><PaymentStatus status={status} intent={intent} transactionId={transactionId} continuityLocked={paymentResult?.continuityLocked || status === 'PENDING' || status === 'UNKNOWN'} onDone={() => setStep('recipient')} onRetry={() => { authorizationInFlight.current = false; setStep('slider') }} onCheckStatus={() => setStatus('PENDING')} onViewPrevious={() => setStatus('PENDING')} /></section>}
	</div></AppShell>
}
