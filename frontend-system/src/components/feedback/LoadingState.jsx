export default function LoadingState({ variant = 'spinner' }) { return variant === 'skeleton' ? <div className="skeleton" aria-label="Loading" /> : <span className="loader" aria-label="Loading" /> }
