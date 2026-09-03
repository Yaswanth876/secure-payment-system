const steps = ['Payment initiated', 'Payment processing', 'Bank confirmation', 'Completed']
export default function TransactionTimeline({ status }) {
  const active = status === 'SUCCESS' ? 4 : status === 'PENDING' || status === 'UNKNOWN' ? 2 : status === 'PROCESSING' ? 1 : 0
  return <ol className="transaction-timeline" aria-label="Transaction progress">{steps.map((label, index) => { const complete = index < active; const current = index === active && status !== 'SUCCESS' && status !== 'FAILED'; return <li className={complete ? 'timeline-step timeline-step--complete' : current ? 'timeline-step timeline-step--current' : 'timeline-step'} key={label}><span className="timeline-step__mark" aria-hidden="true">{complete ? '✓' : current ? '●' : '○'}</span><span>{current ? (status === 'PENDING' || status === 'UNKNOWN' ? 'Waiting for confirmation' : label) : label}</span></li> })}</ol>
}
