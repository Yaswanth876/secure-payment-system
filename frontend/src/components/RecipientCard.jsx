export default function RecipientCard({ recipient, selected = false, onClick }) {
  return <button className={`recipient-card ${selected ? 'selected' : ''}`} onClick={onClick} aria-pressed={selected}>
    <span className="avatar">{recipient.name?.slice(0, 1).toUpperCase()}</span>
    <span className="recipient-copy"><strong>{recipient.name}</strong><span>{recipient.upiId}</span><small>{recipient.bankName || 'Bank details unavailable'} {recipient.maskedAccountNumber || ''}</small></span>
    {recipient.isNew && <span className="tag">NEW RECIPIENT</span>}
  </button>;
}