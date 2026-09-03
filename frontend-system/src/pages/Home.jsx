import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell.jsx'
import { Avatar, BottomSheet, Button, Card, Divider, Modal, StatusIndicator } from '../components/ui/index.js'
import EmptyState from '../components/feedback/EmptyState.jsx'
import Alert from '../components/feedback/Alert.jsx'

export default function Home() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  return <AppShell><div className="content-wrap">
    <section className="welcome"><div><p className="eyebrow">Thursday, 3 September</p><h1>Good morning, Ananya</h1><p className="welcome__copy">Your money, with a moment to check.</p></div><Avatar initials="AS" /></section>
    <section className="hero-panel"><div><span className="hero-panel__eyebrow">Payment Guardian</span><h2>Move money with confidence.</h2><p>Every payment gets a clear, calm review before it leaves your account.</p></div><div className="hero-panel__seal" aria-hidden="true">PG</div></section>
    <section className="section-block"><div className="section-heading"><h2>What would you like to do?</h2></div><Link className="send-action" to="/send"><span className="send-action__icon" aria-hidden="true">+</span><span><strong>Send money</strong><small>Start a new payment</small></span><span className="send-action__arrow" aria-hidden="true">-&gt;</span></Link></section>
    <section className="section-block"><div className="section-heading"><h2>Recent activity</h2><Link to="/activity">See all</Link></div><Card variant="outlined"><EmptyState title="No payments yet" description="Your completed payments will appear here." /></Card></section>
    <Alert tone="info" title="A safer way to pay">Take a breath. Check the person and amount before you confirm.</Alert>
    <section className="quick-links"><Button variant="secondary" onClick={() => setSheetOpen(true)}>Open sheet</Button><Button variant="ghost" onClick={() => setModalOpen(true)}>About safety</Button></section>
    <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Quick actions"><p className="sheet-copy">Helpful actions will appear here as new features are added.</p><Button fullWidth onClick={() => setSheetOpen(false)}>Done</Button></BottomSheet>
    <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Payment Guardian"><p className="sheet-copy">A clear review step helps you catch mistakes before money moves.</p><Divider /><StatusIndicator status="success">Protection is on</StatusIndicator><Button fullWidth onClick={() => setModalOpen(false)}>Got it</Button></Modal>
  </div></AppShell>
}
