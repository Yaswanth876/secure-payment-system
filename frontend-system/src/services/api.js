import { mockApi } from './mockApi.js'
import { ApiError, normalizePayment, normalizeRecipient } from './apiUtils.js'

const useMock = import.meta.env.VITE_USE_MOCK_API !== 'false'
const baseUrl = import.meta.env.VITE_API_BASE_URL

async function request(path, options = {}) {
  if (!baseUrl) throw new ApiError('Backend URL is not configured.', 'configuration')
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 8000)
  try {
    const response = await fetch(`${baseUrl}${path}`, { ...options, signal: controller.signal, headers: { 'Content-Type': 'application/json', ...options.headers } })
    if (!response.ok) throw new ApiError('The server could not complete the request.', response.status >= 500 ? 'server' : 'validation')
    return response.json()
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(error.name === 'AbortError' ? 'The request took too long.' : 'We could not reach the server.', 'network')
  } finally { window.clearTimeout(timeout) }
}

const realApi = {
  async getRecipient(id) { return normalizeRecipient(await request(`/api/recipients/${encodeURIComponent(id)}`)) },
  async searchRecipients(query) { return (await request(`/api/recipients?search=${encodeURIComponent(query)}`)).map(normalizeRecipient) },
  async createPayment(payload) { return request('/api/payments', { method: 'POST', body: JSON.stringify(payload) }) },
  async authorizePayment(payload) { return normalizePayment(await request('/api/payments/authorize', { method: 'POST', body: JSON.stringify(payload) })) },
  async getPayment(id) { return normalizePayment(await request(`/api/payments/${encodeURIComponent(id)}`)) },
  async checkContinuity(payload) { return normalizePayment(await request('/api/payments/continuity', { method: 'POST', body: JSON.stringify(payload) })) },
  async getSafetyDecision(payload) { return request('/api/safety/decision', { method: 'POST', body: JSON.stringify(payload) }) },
  async getTrustedContactStatus(id) { return request(`/api/trusted-contact/${encodeURIComponent(id)}`) },
  async requestTrustedContact(payload) { return request('/api/trusted-contact', { method: 'POST', body: JSON.stringify(payload) }) },
}

const service = useMock ? mockApi : realApi
export const getRecipient = (id) => service.getRecipient(id).then(normalizeRecipient)
export const searchRecipients = (query) => service.searchRecipients(query).then((items) => items.map(normalizeRecipient))
export const createPayment = (payload) => service.createPayment(payload)
export const authorizePayment = (payload) => service.authorizePayment(payload).then(normalizePayment)
export const getPayment = (id) => service.getPayment(id).then(normalizePayment)
export const checkContinuity = (payload) => service.checkContinuity(payload).then(normalizePayment)
export const getSafetyDecision = (payload) => service.getSafetyDecision(payload)
export const getTrustedContactStatus = (id) => service.getTrustedContactStatus(id)
export const requestTrustedContact = (payload) => service.requestTrustedContact(payload)
