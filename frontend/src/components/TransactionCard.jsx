const statusLabel = status => ({ SUCCESS: 'Successful', FAILED: 'Failed', PENDING: 'Pending', PROCESSING: 'Processing', UNKNOWN: 'Status unclear' }[status] || status);

export default function TransactionCard({ transaction, onClick }) {
  return <button className="transaction-card" onClick={onClick}>
    <span className="avatar small">{transaction.recipient.name?.slice(0, 1).toUpperCase()}</span>
    <span className="transaction-copy"><strong>{transaction.recipient.name}</strong><span>{statusLabel(transaction.status)}</span></span>
    <strong className="transaction-amount">₹{transaction.amount.rupees.toLocaleString('en-IN')}</strong>
  </button>;
}