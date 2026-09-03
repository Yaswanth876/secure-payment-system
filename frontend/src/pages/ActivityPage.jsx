import TransactionCard from '../components/TransactionCard.jsx';
import { Button } from '../components/ui/button.jsx';

export default function ActivityPage({ transactions, onBack, onOpen }) {
  return <section className="page reveal"><PageHeader title="Activity" onBack={onBack} /><p className="page-intro">A clear record of your payment status.</p><div className="activity-list">{transactions.map(transaction => <TransactionCard key={transaction.transactionId} transaction={transaction} onClick={() => onOpen(transaction.transactionId)} />)}</div></section>;
}

function PageHeader({ title, onBack }) {
  return <div className="page-header"><Button variant="ghost" className="back-button" onClick={onBack} aria-label="Go back">←</Button><h1>{title}</h1></div>;
}
