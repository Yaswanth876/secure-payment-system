export default function RecipientCard({ recipient, selected = false, onClick }) {
  return <button className={`recipient-card ${selected ? 'selected' : ''}`} onClick={onClick} aria-pressed={selected}>
    <span className="avatar">{recipient.photo ? <img src={recipient.photo} alt={`${recipient.name}, the person you're paying`} onError={event => { event.currentTarget.hidden = true; }} /> : recipient.name?.slice(0, 1).toUpperCase()}</span>
    <span className="recipient-copy"><strong>{recipient.name}</strong><span>{recipient.upiId}</span><small>{recipient.bankName || 'Bank details unavailable'} {recipient.maskedAccountNumber || ''}</small></span>
    {recipient.isNew && <span className="tag">NEW RECIPIENT</span>}
  </button>;
}