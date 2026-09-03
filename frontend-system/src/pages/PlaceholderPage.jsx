import AppShell from '../components/layout/AppShell.jsx'
import EmptyState from '../components/feedback/EmptyState.jsx'
export default function PlaceholderPage({ title, description }) { return <AppShell><div className="content-wrap page-placeholder"><p className="eyebrow">Payment Guardian</p><h1>{title}</h1><EmptyState title={description} description="This space will be ready in a later module." /></div></AppShell> }
