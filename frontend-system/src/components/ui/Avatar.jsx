export default function Avatar({ initials = 'AS', size = 'md' }) { return <div className={`avatar avatar--${size}`} aria-label={`Profile for ${initials}`}>{initials}</div> }
