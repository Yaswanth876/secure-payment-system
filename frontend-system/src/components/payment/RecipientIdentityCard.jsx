import Avatar from '../ui/Avatar.jsx'
import Badge from '../ui/Badge.jsx'
import Card from '../ui/Card.jsx'

export default function RecipientIdentityCard({ recipient, onEdit }) {
  const initials = recipient.name.split(' ').map((part) => part[0]).join('').slice(0, 2)
  return <Card variant="outlined" className="identity-card"><div className="identity-card__top"><div className="identity-card__photo"><img src={recipient.photo} alt={`${recipient.name}, the person you're paying`} onError={(event) => { event.currentTarget.hidden = true }} /><Avatar initials={initials} size="md" /></div><div><p className="eyebrow">Person you're paying</p><h2>{recipient.name}</h2><p className="identity-card__upi">{recipient.upiId}</p></div></div><div className="identity-card__details"><div><span>Bank</span><strong>{recipient.bankName}</strong></div><div><span>Account</span><strong>Account •••• {recipient.maskedAccount}</strong></div></div>{recipient.isNewRecipient && <Badge tone="warning">New recipient</Badge>}<p className="identity-card__note">Photo and details are here to help you recognize the person. Please check them before continuing.</p><button type="button" className="text-button" onClick={onEdit}>Edit recipient</button></Card>
}
