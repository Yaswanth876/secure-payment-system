import { config } from '../config/config.js';
import { transition } from './PaymentStateMachine.js';

const outcomes = new Set(['SUCCESS', 'PENDING', 'FAILED', 'UNKNOWN']);

export async function simulate(database, transaction) {
  await transition(database, transaction.id, 'AUTHORIZED', 'PROCESSING');
  const outcome = outcomes.has(config.simulatedOutcome) ? config.simulatedOutcome : 'SUCCESS';
  await transition(database, transaction.id, 'PROCESSING', outcome);
  return outcome;
}