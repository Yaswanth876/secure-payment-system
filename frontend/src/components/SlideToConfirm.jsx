import { useState } from 'react';

export default function SlideToConfirm({ recipientName, amount, disabled, onConfirm }) {
  const [value, setValue] = useState(0);
  const complete = value >= 98;
  function handleChange(event) {
    const nextValue = Number(event.target.value);
    setValue(nextValue);
    if (nextValue >= 98 && !disabled) onConfirm();
  }
  return <div className={`slide-confirm ${complete ? 'complete' : ''}`} style={{ '--slide-progress': `${value}%` }}>
    <span className="slide-label">{complete ? 'Confirmed' : `Slide to pay ${recipientName} · ${amount}`}</span>
    <input aria-label={`Slide to confirm payment of ${amount} to ${recipientName}`} type="range" min="0" max="100" value={value} onChange={handleChange} disabled={disabled || complete} />
    <span className="slide-thumb" aria-hidden="true" />
    <span className="slide-arrow" aria-hidden="true">→</span>
  </div>;
}