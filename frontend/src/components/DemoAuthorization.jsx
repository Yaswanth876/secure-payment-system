import { useState } from 'react';
import { Button } from './ui/button.jsx';
import { recipientPhoto } from '../lib/recipientPhoto.js';

const money = value => `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

export default function DemoAuthorization({ preview, loading, error, onBack, onAuthorize }) {
  const [pin, setPin] = useState('');
  const ready = pin.length >= 4;
  function submit(event) { event.preventDefault(); if (ready && !loading) onAuthorize(); }
  return <section className="page reveal amount-confirmation-page">
    <div className="page-header"><Button variant="ghost" className="back-button" onClick={onBack} aria-label="Back to amount confirmation">←</Button><h1>Confirm payment</h1></div>
    <p className="page-intro">Demo authorization only. Do not enter a real UPI PIN.</p>
    <div className="receipt-person amount-confirmation-recipient"><span className="avatar">{recipientPhoto(preview.recipient) ? <img src={recipientPhoto(preview.recipient)} alt="" /> : preview.recipient.name.slice(0, 1).toUpperCase()}</span><div><span className="eyebrow">Paying</span><h2>{preview.recipient.name}</h2><p>{preview.recipient.upiId}</p><strong>{money(preview.amount.rupees)}</strong></div></div>
    <form onSubmit={submit}><label className="pin-field"><span>PIN</span><input autoFocus type="password" inputMode="numeric" autoComplete="off" maxLength="6" value={pin} onChange={event => setPin(event.target.value.replace(/\D/g, ''))} aria-describedby="pin-help" aria-label="Demo PIN, at least four digits" /></label><p id="pin-help" className="field-note">Use any four to six digits for this simulated step. It is not stored or sent to the backend.</p>{error && <p className="inline-error" role="alert">Payment authorization failed. {error}</p>}{loading ? <div className="inline-loading"><span className="spinner" /> Authorizing payment</div> : <Button className="wide" type="submit" disabled={!ready}>Pay {money(preview.amount.rupees)}</Button>}</form>
  </section>;
}
