export default function Input({ label, helperText, error, id, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return <div className="field">
    {label && <label htmlFor={inputId}>{label}</label>}
    <input id={inputId} aria-invalid={Boolean(error)} aria-describedby={helperText || error ? `${inputId}-message` : undefined} {...props} />
    {(helperText || error) && <span id={`${inputId}-message`} className={error ? 'field__message field__message--error' : 'field__message'}>{error || helperText}</span>}
  </div>
}
