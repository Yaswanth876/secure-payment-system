import SafetyTimeline from '../components/SafetyTimeline.jsx';
import { Button } from '../components/ui/button.jsx';

const money = value => `₹${Number(value).toLocaleString('en-IN')}`;
const statusText = { SUCCESS: 'Payment successful', FAILED: 'Payment failed', PENDING: 'Payment still processing', PROCESSING: 'Payment processing', UNKNOWN: 'Payment status unclear' };

export default function DetailPage({ detail, loading, onBack }) {
  if (loading || !detail) return <section className="page"><div className="loading-state"><span className="spinner" /> Loading payment details</div></section>;
  return <section className="page reveal"><PageHeader title="Payment detail" onBack={onBack} /><div className="detail-amount">{money(detail.amount.rupees)}<span>{statusText[detail.status] || detail.status}</span></div><div className="info-block"><span className="eyebrow">Paid to</span><h2>{detail.recipient.name}</h2><p>{detail.recipient.upiId}</p><p>{detail.recipient.bankName} {detail.recipient.maskedAccountNumber}</p></div><div className="detail-grid"><Info label="From" value={`${detail.sender.name} · ${detail.sender.bankName}`} /><Info label="Transaction ID" value={detail.transactionId} /><Info label="Safety status" value={detail.safetyStatus} /><Info label="Updated" value={new Date(detail.updatedAt).toLocaleString()} /></div><div className="section-heading compact"><h2>Safety timeline</h2></div><SafetyTimeline events={detail.events} /></section>;
}

function Info({ label, value }) {
  return <div className="info-cell"><span className="eyebrow">{label}</span><strong>{value}</strong></div>;
}

function PageHeader({ title, onBack }) {
  return <div className="page-header"><Button variant="ghost" className="back-button" onClick={onBack} aria-label="Go back">←</Button><h1>{title}</h1></div>;
}
