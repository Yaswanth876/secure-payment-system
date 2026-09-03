const apiOrigin = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';

export function recipientPhoto(recipient) {
  if (recipient.photo) return recipient.photo;
  return recipient.name?.toLowerCase().includes('anita') ? `${apiOrigin}/images/lady.png` : `${apiOrigin}/images/man.png`;
}