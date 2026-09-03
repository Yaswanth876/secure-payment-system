import { mockRecipients } from '../data/mockData.js'

const wait = (value, delay = 180) => new Promise((resolve) => window.setTimeout(() => resolve(value), delay))
const scenario = () => import.meta.env.VITE_MOCK_PAYMENT_STATUS || 'SUCCESS'

export const mockApi = {
  async getRecipient(id) { return wait(mockRecipients.find((recipient) => recipient.id === id) || null) },
  async searchRecipients(query = '') { return wait(mockRecipients.filter((recipient) => `${recipient.name} ${recipient.upiId}`.toLowerCase().includes(query.toLowerCase()))) },
  async createPayment(payload) { return wait({ paymentIntentId: `intent_${payload.recipientId}`, ...payload }) },
  async authorizePayment(payload) { return wait({ status: scenario(), transactionId: 'TXN001', continuityLocked: ['PENDING', 'UNKNOWN'].includes(scenario()), ...payload }) },
  async getPayment(id) { return wait({ status: scenario(), transactionId: id, continuityLocked: ['PENDING', 'UNKNOWN'].includes(scenario()) }) },
  async checkContinuity() { return wait({ continuityLocked: ['PENDING', 'UNKNOWN'].includes(scenario()), existingTransactionId: 'TXN001', status: scenario() }) },
  async getSafetyDecision(payload) { return wait({ requiresCoolingOff: payload.recipient?.isNewRecipient || Number(payload.amount) >= 10000, requiresSafetyHold: Number(payload.amount) >= 100000, requiresTrustedContact: false, reason: payload.recipient?.isNewRecipient ? 'new_recipient' : Number(payload.amount) >= 10000 ? 'high_amount' : 'unusual_context' }) },
  async getTrustedContactStatus() { return wait({ requested: false }) },
  async requestTrustedContact(payload) { return wait({ requested: true, ...payload }) },
}
