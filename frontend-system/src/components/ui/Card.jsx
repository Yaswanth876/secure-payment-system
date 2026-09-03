export default function Card({ children, variant = 'normal', className = '', ...props }) {
  return <section className={`card card--${variant} ${className}`} {...props}>{children}</section>
}
