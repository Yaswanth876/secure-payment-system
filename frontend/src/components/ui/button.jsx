import { cn } from '../../lib/utils.js';

export function Button({ className, variant = 'default', ...props }) {
  return <button className={cn('ui-button', `ui-button-${variant}`, className)} {...props} />;
}