export default function Alert({ tone = 'info', title, children }) { return <div className={`alert alert--${tone}`} role="status"><strong>{title}</strong>{children && <span>{children}</span>}</div> }
