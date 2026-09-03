import { useEffect, useState } from 'react';
import { authorizePayment, getPaymentStatus, getProfile, getRecipients, getTransaction, getTransactions, previewPayment, searchRecipients } from './api/client.js';
import ErrorState from './components/ErrorState.jsx';
import LoadingState from './components/LoadingState.jsx';
import RecipientCard from './components/RecipientCard.jsx';
import SafetyTimeline from './components/SafetyTimeline.jsx';
import SlideToConfirm from './components/SlideToConfirm.jsx';
import TransactionCard from './components/TransactionCard.jsx';
import { Button } from './components/ui/button.jsx';
import { Card } from './components/ui/card.jsx';
import { Input } from './components/ui/input.jsx';

const USER_ID = 1;
const money = value => `₹${Number(value).toLocaleString('en-IN')}`;
const statusText = { SUCCESS: 'Payment successful', FAILED: 'Payment failed', PENDING: 'Payment still processing', PROCESSING: 'Payment processing', UNKNOWN: 'Payment status unclear' };

function App() {
  const [profile, setProfile] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [view, setView] = useState('home');
  const [flow, setFlow] = useState('recipient');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [amount, setAmount] = useState('');
  const [preview, setPreview] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [detail, setDetail] = useState(null);
  const [lockData, setLockData] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadHome() {
    setLoading(true); setError('');
    try { const [nextProfile, nextRecipients, nextTransactions] = await Promise.all([getProfile(USER_ID), getRecipients(USER_ID), getTransactions(USER_ID)]); setProfile(nextProfile); setRecipients(nextRecipients); setTransactions(nextTransactions); }
    catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  }

  useEffect(() => { loadHome(); }, []);
  useEffect(() => {
    if (!query.trim()) return;
    const timer = setTimeout(async () => {
      try { setRecipients(await searchRecipients(query)); } catch (requestError) { setError(requestError.message); }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    if (view !== 'pay' || flow !== 'result' || !transaction || !['PROCESSING', 'PENDING', 'UNKNOWN'].includes(transaction.status)) return undefined;
    const timer = setInterval(async () => {
      try { setTransaction(await getPaymentStatus(transaction.transactionId)); } catch (requestError) { setError(requestError.message); }
    }, 5000);
    return () => clearInterval(timer);
  }, [view, flow, transaction]);

  function startPayment() { setView('pay'); setFlow('recipient'); setSelectedRecipient(null); setAmount(''); setQuery(''); setPreview(null); setTransaction(null); setLockData(null); setError(''); }
  function selectRecipient(recipient) { setSelectedRecipient(recipient); setFlow('amount'); setError(''); }
  function goToAmount() { setFlow('amount'); setError(''); }
  async function makePreview() {
    const rupees = Number(amount);
    if (!Number.isSafeInteger(rupees) || rupees <= 0) { setError('Enter a whole amount greater than ₹0.'); return; }
    setActionLoading(true); setError('');
    try { const nextPreview = await previewPayment({ senderUserId: USER_ID, senderAccountId: profile.accounts[0].id, recipientId: selectedRecipient.recipientId, amount: rupees * 100 }); setPreview(nextPreview); setFlow('review'); }
    catch (requestError) { setError(requestError.message); } finally { setActionLoading(false); }
  }
  async function confirmPayment() {
    if (actionLoading || !preview) return;
    setActionLoading(true); setFlow('processing'); setError('');
    try { await authorizePayment(preview.transactionId, { confirmation: { recipientConfirmed: true, amountConfirmed: true } }); setTransaction(await getPaymentStatus(preview.transactionId)); setFlow('result'); }
    catch (requestError) { if (requestError.code === 'CONTINUITY_LOCK') { setLockData({ ...requestError.data, message: requestError.message }); setFlow('locked'); } else { setError(requestError.message); setFlow('review'); } }
    finally { setActionLoading(false); }
  }
  async function openDetail(transactionId) { setActionLoading(true); setError(''); try { setDetail(await getTransaction(transactionId)); setView('detail'); } catch (requestError) { setError(requestError.message); } finally { setActionLoading(false); } }
  async function refreshStatus() { if (!transaction) return; setActionLoading(true); try { setTransaction(await getPaymentStatus(transaction.transactionId)); } catch (requestError) { setError(requestError.message); } finally { setActionLoading(false); } }

  if (loading && !profile) return <div className="app-loading"><LoadingState label="Loading your Payment Guardian" /></div>;
  if (error && !profile) return <div className="app-loading"><ErrorState message={error} onRetry={loadHome} /></div>;

  return <div className="app-shell">
    <header className="topbar"><button className="brand" onClick={() => { setView('home'); loadHome(); }}><span className="brand-mark">P</span><span>Payment Guardian</span></button><span className="connection"><i /> Backend connected</span></header>
    <main className="main-content">
      {view === 'home' && <Home profile={profile} transactions={transactions} onPay={startPayment} onActivity={() => setView('activity')} onOpen={openDetail} />}
      {view === 'activity' && <Activity transactions={transactions} onBack={() => setView('home')} onOpen={openDetail} />}
      {view === 'detail' && <Detail detail={detail} loading={actionLoading} onBack={() => setView('activity')} />}
      {view === 'pay' && <PayFlow flow={flow} profile={profile} recipients={recipients} query={query} setQuery={setQuery} selectedRecipient={selectedRecipient} amount={amount} setAmount={setAmount} preview={preview} transaction={transaction} lockData={lockData} error={error} loading={actionLoading} onSelect={selectRecipient} onAmount={makePreview} onConfirm={confirmPayment} onBack={() => flow === 'recipient' ? setView('home') : setFlow(flow === 'result' || flow === 'locked' ? 'recipient' : flow === 'review' ? 'amount' : 'recipient')} onDone={() => transaction?.status === 'FAILED' ? startPayment() : (setView('home'), loadHome())} onViewPrevious={() => lockData?.existingTransactionId && openDetail(lockData.existingTransactionId)} onRefresh={refreshStatus} />}
    </main>
    <nav className="bottom-nav" aria-label="Primary navigation"><button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}><span>⌂</span>Home</button><button className={view === 'activity' ? 'active' : ''} onClick={() => setView('activity')}><span>≡</span>Activity</button><button className="nav-pay" onClick={startPayment}><span>＋</span>Pay</button></nav>
  </div>;
}

function Home({ profile, transactions, onPay, onActivity, onOpen }) { return <section className="page reveal"><div className="eyebrow">Payment safety, made clear</div><h1>Good evening,<br /><em>{profile.name}</em></h1><Card className="hero-action"><div><span className="eyebrow">Ready when you are</span><h2>Make a payment</h2><p>Review who, how much, and where it comes from.</p></div><Button onClick={onPay}>Pay <span>→</span></Button></Card><div className="section-heading"><div><span className="eyebrow">Your latest payments</span><h2>Recent activity</h2></div><Button variant="link" onClick={onActivity}>See all <span>→</span></Button></div>{transactions.slice(0, 3).map(transaction => <TransactionCard key={transaction.transactionId} transaction={transaction} onClick={() => onOpen(transaction.transactionId)} />)}<div className="principle"><span className="principle-number">01</span><div><strong>Know before you confirm</strong><p>Every payment shows the recipient, exact amount, and account before it moves.</p></div></div></section>; }

function Activity({ transactions, onBack, onOpen }) { return <section className="page reveal"><PageHeader title="Activity" onBack={onBack} /><p className="page-intro">A clear record of your payment status.</p><div className="activity-list">{transactions.map(transaction => <TransactionCard key={transaction.transactionId} transaction={transaction} onClick={() => onOpen(transaction.transactionId)} />)}</div></section>; }

function Detail({ detail, loading, onBack }) { if (loading || !detail) return <section className="page"><LoadingState label="Loading payment details" /></section>; return <section className="page reveal"><PageHeader title="Payment detail" onBack={onBack} /><div className="detail-amount">{money(detail.amount.rupees)}<span>{statusText[detail.status] || detail.status}</span></div><div className="info-block"><span className="eyebrow">Paid to</span><h2>{detail.recipient.name}</h2><p>{detail.recipient.upiId}</p><p>{detail.recipient.bankName} {detail.recipient.maskedAccountNumber}</p></div><div className="detail-grid"><Info label="From" value={`${detail.sender.name} · ${detail.sender.bankName}`} /><Info label="Transaction ID" value={detail.transactionId} /><Info label="Safety status" value={detail.safetyStatus} /><Info label="Updated" value={new Date(detail.updatedAt).toLocaleString()} /></div><div className="section-heading compact"><h2>Safety timeline</h2></div><SafetyTimeline events={detail.events} /></section>; }
function Info({ label, value }) { return <div className="info-cell"><span className="eyebrow">{label}</span><strong>{value}</strong></div>; }
function PageHeader({ title, onBack }) { return <div className="page-header"><Button variant="ghost" className="back-button" onClick={onBack} aria-label="Go back">←</Button><h1>{title}</h1></div>; }

function PayFlow({ flow, profile, recipients, query, setQuery, selectedRecipient, amount, setAmount, preview, transaction, lockData, error, loading, onSelect, onAmount, onConfirm, onBack, onDone, onViewPrevious, onRefresh }) {
  if (flow === 'recipient') return <section className="page reveal"><PageHeader title="Pay" onBack={onBack} /><p className="page-intro">Choose who you are paying.</p><label className="search-box"><span>⌕</span><Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Name or UPI ID" aria-label="Search recipients" /></label>{error && <ErrorState message={error} />}{recipients.map(recipient => <RecipientCard key={recipient.recipientId} recipient={recipient} onClick={() => onSelect(recipient)} />)}</section>;
  if (flow === 'amount') return <section className="page reveal"><PageHeader title="Amount" onBack={onBack} /><div className="pay-target"><span className="avatar">{selectedRecipient.name.slice(0, 1)}</span><div><span className="eyebrow">Paying</span><h2>{selectedRecipient.name}</h2><p>{selectedRecipient.upiId}</p></div></div><label className="amount-field"><span>₹</span><Input autoFocus inputMode="numeric" type="number" min="1" step="1" value={amount} onChange={event => setAmount(event.target.value)} placeholder="0" aria-label="Amount in rupees" /></label><p className="field-note">Enter the whole amount in rupees.</p>{error && <ErrorState message={error} />}{loading ? <LoadingState label="Preparing review" /> : <Button className="wide" onClick={onAmount}>Review payment <span>→</span></Button>}</section>;
  if (flow === 'review') return <Review preview={preview} loading={loading} error={error} onBack={onBack} onConfirm={onConfirm} />;
  if (flow === 'processing') return <StatusScreen status="PROCESSING" transaction={transaction || preview} loading={loading} onRefresh={onRefresh} />;
  if (flow === 'locked') return <LockScreen lockData={lockData} preview={preview} onBack={onBack} onViewPrevious={onViewPrevious} />;
  return <StatusScreen status={transaction?.status} transaction={transaction} onDone={onDone} onRefresh={onRefresh} />;
}

function Review({ preview, loading, error, onBack, onConfirm }) { const safety = preview.safety; return <section className="page reveal"><PageHeader title="Review payment" onBack={onBack} /><p className="page-intro">Check these details before you confirm.</p><div className="receipt"><div className="receipt-section"><span className="eyebrow">Who</span><div className="receipt-person"><span className="avatar">{preview.recipient.name.slice(0, 1)}</span><div><h2>{preview.recipient.name}</h2><p>{preview.recipient.upiId}</p><p>{preview.recipient.bankName} {preview.recipient.maskedAccountNumber}</p></div></div></div><div className="receipt-section amount-receipt"><span className="eyebrow">How much</span><strong>{money(preview.amount.rupees)}</strong></div><div className="receipt-section"><span className="eyebrow">From</span><h3>{preview.sender.name}</h3><p>{preview.sender.bankName} {preview.sender.maskedAccountNumber}</p></div></div>{safety.isNewRecipient && <Notice title="New recipient">Please carefully verify the recipient details.</Notice>}{safety.amountWarning && <Notice title="Amount check">{safety.amountWarning.message}</Notice>}{safety.continuityLock && <Notice title="Payment protection">A previous payment with the same details is unresolved.</Notice>}{error && <ErrorState message={error} />}{loading ? <LoadingState label="Confirming payment" /> : <SlideToConfirm recipientName={preview.recipient.name} amount={money(preview.amount.rupees)} onConfirm={onConfirm} disabled={loading} />}</section>; }
function Notice({ title, children }) { return <div className="notice"><span className="notice-icon">!</span><div><strong>{title}</strong><p>{children}</p></div></div>; }
function StatusScreen({ status, transaction, onDone, onRefresh }) { const unresolved = ['PROCESSING', 'PENDING', 'UNKNOWN'].includes(status); const failed = status === 'FAILED'; return <section className="page centered reveal"><div className={`status-glyph ${unresolved ? 'ring' : ''}`}>{status === 'SUCCESS' ? '✓' : status === 'FAILED' ? '×' : '?'}</div><span className="eyebrow">{status}</span><h1>{statusText[status] || 'Payment processing'}</h1>{transaction && <><div className="result-amount">{money(transaction.amount.rupees)}</div><h2>{transaction.recipient?.name}</h2><p>{transaction.recipient?.upiId}</p></>}{unresolved ? <div className="do-not-pay"><strong>DON'T PAY AGAIN</strong><p>{status === 'UNKNOWN' ? 'UNKNOWN does not mean failed. Wait until the final status is known.' : 'Your previous payment has not been resolved yet.'}</p>{onRefresh && <button className="secondary-button" onClick={onRefresh}>Check status</button>}</div> : failed ? <p>The payment was not completed.</p> : status === 'SUCCESS' ? <p>Transaction confirmed.</p> : null}{status === 'SUCCESS' || failed ? <button className="primary-button wide" onClick={onDone}>{failed ? 'Try again' : 'Done'} <span>→</span></button> : null}</section>; }
function LockScreen({ lockData, preview, onBack, onViewPrevious }) { return <section className="page centered lock-screen reveal"><div className="lock-icon">⌕</div><span className="eyebrow">Duplicate payment protection</span><h1>Payment protected</h1><p className="page-intro">You already have a payment being processed for this recipient.</p><div className="lock-summary"><strong>{money(preview.amount.rupees)}</strong><h2>{preview.recipient.name}</h2><p>{preview.recipient.upiId}</p><div className="lock-status"><span>Previous payment</span><strong>{lockData?.existingStatus || 'UNRESOLVED'}</strong></div></div><div className="do-not-pay"><strong>DON'T PAY TWICE</strong><p>Your previous payment has not been resolved yet.</p></div><button className="secondary-button wide" onClick={onViewPrevious}>View previous payment</button><button className="text-button" onClick={onBack}>Cancel</button></section>; }

export default App;