export class ApiError extends Error {
  constructor(message, kind = 'server') { super(message); this.kind = kind }
}

export function normalizeRecipient(data) {
  if (!data) return null
  return { id: data.id ?? data.recipientId, name: data.name ?? data.receiver_name, photo: data.photo, upiId: data.upiId ?? data.upi_id, bankName: data.bankName ?? data.bank_name, maskedAccount: data.maskedAccount ?? data.masked_account, isNewRecipient: Boolean(data.isNewRecipient ?? data.is_new_recipient) }
}

export function normalizePayment(data) {
  return { ...data, status: String(data.status || 'UNKNOWN').toUpperCase(), transactionId: data.transactionId ?? data.transaction_id, continuityLocked: Boolean(data.continuityLocked ?? data.continuity_locked) }
}
