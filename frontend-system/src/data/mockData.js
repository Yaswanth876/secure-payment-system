export const mockRecipients = [
  { id: 'user_001', name: 'Rahul Kumar', photo: '/mock/rahul.jpg', upiId: 'rahul@upi', bankName: 'Example Bank', maskedAccount: '4821', isNewRecipient: false },
  { id: 'user_002', name: 'Riya Nair', photo: '/mock/riya.jpg', upiId: 'riya.nair@upi', bankName: 'Northstar Bank', maskedAccount: '1938', isNewRecipient: true },
  { id: 'user_003', name: 'Rahul Khanna', photo: '/mock/rahul-khanna.jpg', upiId: 'rahul.khanna@upi', bankName: 'Example Bank', maskedAccount: '7740', isNewRecipient: false },
  { id: 'user_004', name: 'Meera Shah', photo: '/mock/meera.jpg', upiId: 'meera.shah@upi', bankName: 'Unity Cooperative Bank', maskedAccount: '6102', isNewRecipient: false },
]

export const mockTransactions = {
  success: { status: 'SUCCESS', transactionId: 'TXN001', continuityLocked: false },
  failed: { status: 'FAILED', transactionId: 'TXN002', continuityLocked: false },
  pending: { status: 'PENDING', transactionId: 'TXN003', continuityLocked: true },
  unknown: { status: 'UNKNOWN', transactionId: 'TXN004', continuityLocked: true },
  'continuity-locked': { status: 'PENDING', transactionId: 'TXN001', continuityLocked: true },
}
