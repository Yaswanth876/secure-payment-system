const labels = { success: 'Success', warning: 'Warning', danger: 'Attention', pending: 'Pending', neutral: 'Neutral', info: 'Information' }
export default function StatusIndicator({ status = 'info', children }) { return <span className={`status status--${status}`}><span className="status__dot" aria-hidden="true" />{children || labels[status]}</span> }
