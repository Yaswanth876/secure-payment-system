const notImplemented = (name) => {
  throw new Error(`${name} is not implemented until the backend is connected.`)
}

export const getRecipient = () => notImplemented('getRecipient')
export const createPayment = () => notImplemented('createPayment')
export const getPayment = () => notImplemented('getPayment')
export const authorizePayment = () => notImplemented('authorizePayment')
export const checkContinuity = () => notImplemented('checkContinuity')
export const getSafetyDecision = () => notImplemented('getSafetyDecision')
