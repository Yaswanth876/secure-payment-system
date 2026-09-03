import { Button } from './ui/button.jsx';

export default function ErrorState({ message = "We couldn't load this information.", onRetry }) {
  return <div className="error-state" role="alert"><strong>Something went wrong.</strong><span>{message}</span>{onRetry && <Button variant="link" onClick={onRetry}>Try again</Button>}</div>;
}