import { useState } from 'react';

export default function RecipientIdentityCard({ recipient }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = recipient.name?.split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase() || '?';
  const hasPhoto = Boolean(recipient.photo) && !imageFailed;

  return <article className="recipient-identity-card" aria-labelledby="recipient-identity-name">
    <div className="identity-photo-wrap">
      {hasPhoto ? <img className="identity-photo" src={recipient.photo} alt={`Photo of ${recipient.name}`} onError={() => setImageFailed(true)} /> : <span className="identity-initials" role="img" aria-label={`${recipient.name} initials`}>{initials}</span>}
    </div>
    <div className="identity-content">
      <span className="eyebrow">Recipient details</span>
      <h2 id="recipient-identity-name">{recipient.name}</h2>
      <p className="identity-upi">{recipient.upiId}</p>
      <div className="identity-bank"><span>{recipient.bankName || 'Bank details unavailable'}</span><strong>{recipient.maskedAccountNumber || 'Account details unavailable'}</strong></div>
      {Boolean(recipient.isNew) && <span className="tag identity-tag">NEW RECIPIENT</span>}
      <p className="identity-note">Use the photo to help recognize the recipient. Check the details carefully.</p>
    </div>
  </article>;
}