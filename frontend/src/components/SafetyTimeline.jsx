export default function SafetyTimeline({ events = [] }) {
  return <div className="timeline">{events.map(event => <div className="timeline-item" key={event.id}><span className="timeline-dot" /><div><strong>{event.eventType.replaceAll('_', ' ')}</strong><p>{event.message}</p><small>{new Date(event.createdAt).toLocaleString()}</small></div></div>)}</div>;
}