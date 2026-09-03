const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  const payload = await response.json();
  if (!response.ok || payload.success === false) {
    const error = new Error(payload.error?.message || 'The request could not be completed.');
    error.code = payload.error?.code || 'INTERNAL_ERROR';
    error.data = payload.data;
    throw error;
  }
  return payload.data;
}

export const getProfile = userId => apiRequest(`/api/users/${userId}/profile`);
export const getRecipients = userId => apiRequest(`/api/users/${userId}/recipients`);
export const getRecipient = recipientId => apiRequest(`/api/recipients/${recipientId}`);
export const searchRecipients = query => apiRequest(`/api/recipients/search?query=${encodeURIComponent(query)}`);
export const getTransactions = userId => apiRequest(`/api/users/${userId}/transactions`);
export const getTransaction = transactionId => apiRequest(`/api/transactions/${transactionId}`);
export const previewPayment = body => apiRequest('/api/payments/preview', { method: 'POST', body: JSON.stringify(body) });
export const authorizePayment = (transactionId, body) => apiRequest(`/api/payments/${transactionId}/authorize`, { method: 'POST', body: JSON.stringify(body) });
export const getPaymentStatus = transactionId => apiRequest(`/api/payments/${transactionId}/status`);
export const createRecipient = body => apiRequest('/api/recipients', { method: 'POST', body: JSON.stringify(body) });