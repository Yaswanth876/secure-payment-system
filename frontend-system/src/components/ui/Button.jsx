export default function Button({ children, variant = 'primary', loading = false, fullWidth = false, className = '', ...props }) {
  return <button className={`button button--${variant} ${fullWidth ? 'button--full' : ''} ${className}`} disabled={loading || props.disabled} {...props}>
    {loading ? <span className="button__loader" aria-label="Loading" /> : children}
  </button>
}
