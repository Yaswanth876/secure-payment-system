import { useEffect, useRef } from 'react'

export default function BottomSheet({ open, onClose, title, children }) {
  const closeButtonRef = useRef(null)
  useEffect(() => {
    if (!open) return undefined
    closeButtonRef.current?.focus()
    const onKeyDown = (event) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])
  if (!open) return null
  return <div className="overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <div className="sheet__handle" aria-hidden="true" />
      <div className="sheet__header"><h2 id="sheet-title">{title}</h2><button ref={closeButtonRef} className="close-button" onClick={onClose} aria-label="Close">x</button></div>
      <div className="sheet__content">{children}</div>
    </div>
  </div>
}
