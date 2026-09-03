import Avatar from '../ui/Avatar.jsx'

export default function RecipientList({ recipients, onSelect }) {
  if (!recipients.length) return <p className="search-empty">No people found. Try another name or UPI ID.</p>
  return <div className="recipient-list" role="list" aria-label="Recipients">{recipients.map((recipient) => <button type="button" className="recipient-row" key={recipient.id} onClick={() => onSelect(recipient)}><Avatar initials={recipient.name.split(' ').map((part) => part[0]).join('').slice(0, 2)} size="sm" /><span className="recipient-row__details"><strong>{recipient.name}</strong><small>{recipient.upiId}</small></span><span className="recipient-row__arrow" aria-hidden="true">-&gt;</span></button>)}</div>
}
