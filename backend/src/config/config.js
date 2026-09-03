import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 5000,
  simulatedOutcome: process.env.PAYMENT_SIMULATED_OUTCOME || 'SUCCESS'
};