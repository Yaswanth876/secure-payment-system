import { useRef, useState } from 'react'
import { formatIndianAmount } from './amountUtils.js'

export default function SlideToConfirm({ intent, onConfirm, disabled = false }) {
  const trackRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [state, setState] = useState(disabled ? 'DISABLED' : 'IDLE')
  const confirmedRef = useRef(false)
  const updateProgress = (clientX) => { const track = trackRef.current; if (!track || confirmedRef.current) return; const rect = track.getBoundingClientRect(); const next = Math.max(0, Math.min(1, (clientX - rect.left - 28) / (rect.width - 56))); setProgress(next); return next }
  const finish = (next) => { if (next >= .88 && !confirmedRef.current) { confirmedRef.current = true; setProgress(1); setState('COMPLETED'); window.setTimeout(() => onConfirm({ recipientId: intent.recipientId, amount: intent.amount }), 260) } else if (!confirmedRef.current) { setProgress(0); setState('IDLE') } }
  const onPointerDown = (event) => { if (disabled || confirmedRef.current) return; event.currentTarget.setPointerCapture(event.pointerId); setState('DRAGGING'); updateProgress(event.clientX) }
  const onPointerMove = (event) => { if (state === 'DRAGGING') updateProgress(event.clientX) }
  const onPointerUp = (event) => { if (state !== 'DRAGGING') return; finish(updateProgress(event.clientX) || progress) }
  const onKeyDown = (event) => { if (disabled || confirmedRef.current) return; if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); setState('DRAGGING'); const next = Math.max(0, Math.min(1, progress + (event.key === 'ArrowRight' ? .1 : -.1))); setProgress(next); if (next >= 1) finish(next) } if (event.key === 'Home') { event.preventDefault(); setProgress(0); setState('IDLE') } if (event.key === 'End') { event.preventDefault(); finish(1) } }
  return <div className={`slide-confirm slide-confirm--${state.toLowerCase()}`}><div ref={trackRef} className="slide-confirm__track"><div className="slide-confirm__progress" style={{ width: `${Math.max(0, progress * 100)}%` }} /><button type="button" className="slide-confirm__thumb" aria-label={`Slide to send ₹${formatIndianAmount(intent.amount)} to ${intent.recipient.name}`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(progress * 100)} role="slider" disabled={disabled || state === 'COMPLETED'} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onKeyDown={onKeyDown}>{state === 'COMPLETED' ? '✓' : '→'}</button><span className="slide-confirm__label">{state === 'COMPLETED' ? 'Confirmed' : `Slide to send ₹${formatIndianAmount(intent.amount)} to ${intent.recipient.name}`}</span></div></div>
}
