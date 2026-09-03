const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export async function checkBackendHealth() {
  const response = await fetch(`${apiBaseUrl}/api/health`);

  if (!response.ok) {
    throw new Error('Backend health check failed');
  }

  return response.json();
}