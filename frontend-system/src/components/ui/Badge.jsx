export default function Badge({ children, tone = 'info' }) { return <span className={`badge badge--${tone}`}>{children}</span> }
