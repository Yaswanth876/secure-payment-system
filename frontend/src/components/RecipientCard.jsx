import { useState } from 'react';
import { Button } from './ui/button.jsx';
import { recipientPhoto } from '../lib/recipientPhoto.js';

export default function RecipientCard({ recipient, selected = false, onClick }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = recipient.name?.split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase() || '?';
  const photo = recipientPhoto(recipient);
  const hasPhoto = Boolean(photo) && !imageFailed;

  return <Button variant="unstyled" className={`recipient-card ${selected ? 'selected' : ''}`} onClick={onClick} aria-pressed={selected}>
    <span className="avatar">{hasPhoto ? <img src={photo} alt={`Photo of ${recipient.name}`} onError={() => setImageFailed(true)} /> : <span role="img" aria-label={`${recipient.name} initials`}>{initials}</span>}</span>
    <span className="recipient-copy"><strong>{recipient.name}</strong><span>{recipient.upiId}</span><small>{recipient.bankName || 'Bank details unavailable'} {recipient.maskedAccountNumber || ''}</small></span>
    {recipient.isNew && <span className="tag">NEW RECIPIENT</span>}
  </Button>;
}