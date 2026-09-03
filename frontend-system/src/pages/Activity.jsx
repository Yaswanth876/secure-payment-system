import { useState } from 'react'
import AppShell from '../components/layout/AppShell.jsx'
import { PaymentStatus } from '../components/transaction/index.js'
import { SafetyHold, TrustedContact } from '../components/safety/index.js'
import { mockRecipients, mockTransactions } from '../data/mockData.js'
import Button from '../components/ui/Button.jsx'

const demoIntent = { recipientId: mockRecipients[0].id, recipient: mockRecipients[0], amount: '50000' }
export default function Activity() {
	const [scenario, setScenario] = useState('pending')
	const transaction = mockTransactions[scenario]
	return <AppShell><div className="content-wrap activity-page"><p className="eyebrow">Prototype scenarios</p><h1>Transaction status</h1><p className="activity-intro">Use these mock outcomes to check how Payment Guardian handles each state.</p><div className="scenario-tabs" role="tablist" aria-label="Transaction scenarios">{Object.keys(mockTransactions).map((name) => <Button key={name} variant={scenario === name ? 'primary' : 'secondary'} onClick={() => setScenario(name)}>{name.replace('-', ' ')}</Button>)}</div><PaymentStatus status={transaction.status} intent={demoIntent} transactionId={transaction.transactionId} continuityLocked={transaction.continuityLocked} onDone={() => setScenario('success')} onRetry={() => setScenario('failed')} onCheckStatus={() => setScenario('pending')} onViewPrevious={() => setScenario('pending')} /><div className="module-demo"><SafetyHold intent={demoIntent} /><TrustedContact intent={demoIntent} /></div></div></AppShell>
}
