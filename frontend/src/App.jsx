import { useEffect, useState } from 'react';
import { authorizePayment, getPaymentStatus, getProfile, getRecipient, getRecipients, getTransaction, getTransactions, previewPayment, searchRecipients } from './api/client.js';
import ErrorState from './components/ErrorState.jsx';
import LoadingState from './components/LoadingState.jsx';
import { Button } from './components/ui/button.jsx';
import ActivityPage from './pages/ActivityPage.jsx';
import DetailPage from './pages/DetailPage.jsx';
import HomePage from './pages/HomePage.jsx';
import PayPage from './pages/PayPage.jsx';

const USER_ID = 1;

function viewFromPath(pathname) {
  if (pathname === '/activity') return 'activity';
  if (pathname === '/pay' || pathname.startsWith('/pay/')) return 'pay';
  if (pathname.startsWith('/transactions/')) return 'detail';
  return 'home';
}

function App() {
  const [profile, setProfile] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [view, setView] = useState(() => viewFromPath(window.location.pathname));
  const [flow, setFlow] = useState('recipient');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [recipientError, setRecipientError] = useState('');
  const [amount, setAmount] = useState('');
  const [preview, setPreview] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [detail, setDetail] = useState(null);
  const [lockData, setLockData] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  function navigate(path) {
    window.history.pushState({}, '', path);
    setView(viewFromPath(path));
  }

  async function loadDetail(transactionId) {
    setActionLoading(true); setError('');
    try { setDetail(await getTransaction(transactionId)); }
    catch (requestError) { setError(requestError.message); }
    finally { setActionLoading(false); }
  }

  async function loadHome() {
    setLoading(true); setError('');
    try { const [nextProfile, nextRecipients, nextTransactions] = await Promise.all([getProfile(USER_ID), getRecipients(USER_ID), getTransactions(USER_ID)]); setProfile(nextProfile); setRecipients(nextRecipients); setTransactions(nextTransactions); }
    catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  }

  useEffect(() => { loadHome(); }, []);
  useEffect(() => {
    const handlePopState = () => {
      const match = window.location.pathname.match(/^\/transactions\/([^/]+)$/);
      setView(viewFromPath(window.location.pathname));
      if (match) loadDetail(decodeURIComponent(match[1]));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  useEffect(() => {
    const match = window.location.pathname.match(/^\/transactions\/([^/]+)$/);
    if (match) loadDetail(decodeURIComponent(match[1]));
  }, []);
  useEffect(() => {
    const timer = setTimeout(async () => {
      try { setRecipients(query.trim() ? await searchRecipients(query) : await getRecipients(USER_ID)); } catch (requestError) { setError(requestError.message); }
    }, query.trim() ? 250 : 0);
    return () => clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    if (view !== 'pay' || flow !== 'result' || !transaction || !['PROCESSING', 'PENDING', 'UNKNOWN'].includes(transaction.status)) return undefined;
    const timer = setInterval(async () => {
      try { setTransaction(await getPaymentStatus(transaction.transactionId)); } catch (requestError) { setError(requestError.message); }
    }, 5000);
    return () => clearInterval(timer);
  }, [view, flow, transaction]);

  function startPayment() { navigate('/pay'); setFlow('recipient'); setSelectedRecipient(null); setAmount(''); setQuery(''); setPreview(null); setTransaction(null); setLockData(null); setError(''); }
  async function selectRecipient(recipient) {
    setRecipientLoading(true); setRecipientError(''); setError('');
    try { setSelectedRecipient(await getRecipient(recipient.recipientId)); setFlow('amount'); }
    catch (requestError) { setRecipientError(requestError.code === 'RECIPIENT_NOT_FOUND' ? 'Recipient not found.' : 'Unable to load recipient details.'); }
    finally { setRecipientLoading(false); }
  }
  async function makePreview() {
    const rupees = Number(amount);
    if (!Number.isSafeInteger(rupees) || rupees <= 0) { setError('Enter a whole amount greater than ₹0.'); return; }
    setActionLoading(true); setError('');
    try { const nextPreview = await previewPayment({ senderUserId: USER_ID, senderAccountId: profile.accounts[0].id, recipientId: selectedRecipient.recipientId, amount: rupees * 100 }); setPreview(nextPreview); setFlow('review'); }
    catch (requestError) { setError(requestError.message); } finally { setActionLoading(false); }
  }
  async function confirmPayment() {
    if (actionLoading || !preview) return;
    if (flow === 'amount-confirmation') { setError(''); setFlow('pin'); return; }
    setActionLoading(true); setFlow('processing'); setError('');
    try { await authorizePayment(preview.transactionId, { confirmation: { recipientConfirmed: true, amountConfirmed: true } }); setTransaction(await getPaymentStatus(preview.transactionId)); setFlow('result'); }
    catch (requestError) { if (requestError.code === 'CONTINUITY_LOCK') { setLockData({ ...requestError.data, message: requestError.message }); setFlow('locked'); } else { setError(requestError.message); setFlow('pin'); } }
    finally { setActionLoading(false); }
  }
  async function openDetail(transactionId) { await loadDetail(transactionId); navigate(`/transactions/${transactionId}`); }
  async function refreshStatus() { if (!transaction) return; setActionLoading(true); try { setTransaction(await getPaymentStatus(transaction.transactionId)); } catch (requestError) { setError(requestError.message); } finally { setActionLoading(false); } }

  if (loading && !profile) return <div className="app-loading"><LoadingState label="Loading Mirage Layer" /></div>;
  if (error && !profile) return <div className="app-loading"><ErrorState message={error} onRetry={loadHome} /></div>;

  return <div className="app-shell">
    <header className="topbar"><Button variant="unstyled" className="brand" onClick={() => { navigate('/'); loadHome(); }}>Mirage Layer</Button></header>
    <main className="main-content">
      {view === 'home' && <HomePage profile={profile} transactions={transactions} onPay={startPayment} onActivity={() => navigate('/activity')} onOpen={openDetail} />}
      {view === 'activity' && <ActivityPage transactions={transactions} onBack={() => navigate('/')} onOpen={openDetail} />}
      {view === 'detail' && <DetailPage detail={detail} loading={actionLoading} onBack={() => navigate('/activity')} />}
      {view === 'pay' && <PayPage flow={flow} recipients={recipients} query={query} setQuery={setQuery} selectedRecipient={selectedRecipient} recipientLoading={recipientLoading} recipientError={recipientError} amount={amount} setAmount={setAmount} preview={preview} transaction={transaction} lockData={lockData} error={error} loading={actionLoading} onSelect={selectRecipient} onAmount={makePreview} onConfirm={confirmPayment} onSend={() => setFlow('amount-confirmation')} onBack={() => flow === 'recipient' ? navigate('/') : setFlow(flow === 'result' || flow === 'locked' ? 'recipient' : flow === 'review' || flow === 'review-confirmed' ? 'amount' : flow === 'amount-confirmation' ? 'review' : flow === 'pin' ? 'amount-confirmation' : 'recipient')} onDone={() => transaction?.status === 'FAILED' ? startPayment() : (navigate('/'), loadHome())} onViewPrevious={() => lockData?.existingTransactionId && openDetail(lockData.existingTransactionId)} onRefresh={refreshStatus} />}
    </main>
    <nav className="bottom-nav" aria-label="Primary navigation"><Button variant="unstyled" className={view === 'home' ? 'active' : ''} onClick={() => { navigate('/'); loadHome(); }}><span>⌂</span>Home</Button><Button variant="unstyled" className={view === 'activity' ? 'active' : ''} onClick={() => navigate('/activity')}><span>≡</span>Activity</Button><Button variant="unstyled" className={view === 'pay' ? 'active' : ''} onClick={startPayment}><span>＋</span>Pay</Button></nav>
  </div>;
}

export default App;
