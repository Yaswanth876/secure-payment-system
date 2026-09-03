import { Button } from '../components/ui/button.jsx';
import { Card } from '../components/ui/card.jsx';
import TransactionCard from '../components/TransactionCard.jsx';

export default function HomePage({ profile, transactions, onPay, onActivity, onOpen }) {
  return <section className="page reveal"><div className="eyebrow">Payment safety, made clear</div><h1>Good evening,<br /><em>{profile.name}</em></h1><Card className="hero-action"><div><span className="eyebrow">Ready when you are</span><h2>Make a payment</h2><p>Review who, how much, and where it comes from.</p></div><Button onClick={onPay}>Pay <span>→</span></Button></Card><div className="section-heading"><div><span className="eyebrow">Your latest payments</span><h2>Recent activity</h2></div><Button variant="link" onClick={onActivity}>See all <span>→</span></Button></div>{transactions.slice(0, 3).map(transaction => <TransactionCard key={transaction.transactionId} transaction={transaction} onClick={() => onOpen(transaction.transactionId)} />)}</section>;
}
