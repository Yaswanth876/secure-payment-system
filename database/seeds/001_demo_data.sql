PRAGMA foreign_keys = ON;

INSERT INTO users (id, name, upi_id, phone) VALUES
  (1, 'Vishwajith', 'user@upi', '+919999999999');

INSERT INTO accounts (id, user_id, bank_name, account_type, masked_account_number) VALUES
  (1, 1, 'State Bank of India', 'Savings', '••••7812');

INSERT INTO recipients (id, user_id, name, upi_id, bank_name, masked_account_number, is_new) VALUES
  (1, 1, 'Rahul Kumar', 'rahul@upi', 'State Bank of India', '••••4521', 0),
  (2, 1, 'Rahul Krishnan', 'rahul.k@upi', 'HDFC Bank', '••••9032', 1),
  (3, 1, 'Anita Sharma', 'anita@upi', 'ICICI Bank', '••••1198', 0);

INSERT INTO transactions (id, sender_user_id, sender_account_id, recipient_id, amount, status, safety_status, created_at, updated_at) VALUES
  ('TXN-HISTORY-001', 1, 1, 1, 50000, 'SUCCESS', 'NORMAL', '2026-08-25 10:00:00', '2026-08-25 10:01:00'),
  ('TXN-HISTORY-002', 1, 1, 1, 75000, 'SUCCESS', 'NORMAL', '2026-08-27 12:30:00', '2026-08-27 12:31:00'),
  ('TXN-HISTORY-003', 1, 1, 3, 200000, 'SUCCESS', 'NORMAL', '2026-08-29 15:45:00', '2026-08-29 15:46:00'),
  ('TXN-DEMO-001', 1, 1, 1, 500000, 'PENDING', 'NORMAL', '2026-09-01 09:00:00', '2026-09-01 09:00:10'),
  ('TXN-DEMO-002', 1, 1, 2, 125000, 'FAILED', 'NORMAL', '2026-09-01 11:00:00', '2026-09-01 11:00:20'),
  ('TXN-DEMO-003', 1, 1, 3, 90000, 'UNKNOWN', 'NORMAL', '2026-09-02 14:00:00', '2026-09-02 14:01:00');

INSERT INTO safety_events (transaction_id, event_type, message, metadata) VALUES
  ('TXN-DEMO-001', 'STATUS_CHANGED', 'Payment is awaiting confirmation.', '{"status":"PENDING"}');

INSERT INTO trusted_contacts (id, user_id, name, phone, relationship, enabled) VALUES
  (1, 1, 'Meera Vishwajith', '+919888888888', 'Family', 1);