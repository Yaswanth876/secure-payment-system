PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  upi_id TEXT NOT NULL UNIQUE,
  phone TEXT UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  bank_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  masked_account_number TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS recipients (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  upi_id TEXT NOT NULL,
  bank_name TEXT,
  masked_account_number TEXT,
  photo TEXT,
  is_new INTEGER NOT NULL DEFAULT 0 CHECK (is_new IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, upi_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  sender_user_id INTEGER NOT NULL,
  sender_account_id INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL CHECK (status IN ('CREATED', 'AUTHORIZED', 'PROCESSING', 'PENDING', 'SUCCESS', 'FAILED', 'UNKNOWN')),
  safety_status TEXT NOT NULL DEFAULT 'NORMAL' CHECK (safety_status IN ('NORMAL', 'COOLING_OFF', 'HELD', 'LOCKED')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (sender_account_id) REFERENCES accounts(id) ON DELETE RESTRICT,
  FOREIGN KEY (recipient_id) REFERENCES recipients(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS safety_events (
  id INTEGER PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('AMOUNT_WARNING', 'NEW_RECIPIENT', 'COOLING_OFF_STARTED', 'COOLING_OFF_COMPLETED', 'SAFETY_HOLD', 'SAFETY_HOLD_RELEASED', 'CONTINUITY_LOCK', 'USER_CONFIRMED', 'PAYMENT_AUTHORIZED', 'STATUS_CHANGED')),
  message TEXT NOT NULL,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS trusted_contacts (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_recipients_user_id ON recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_recipients_upi_id ON recipients(upi_id);
CREATE INDEX IF NOT EXISTS idx_transactions_sender_user_id ON transactions(sender_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_recipient_id ON transactions(recipient_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_continuity ON transactions(sender_user_id, recipient_id, amount, status);
CREATE INDEX IF NOT EXISTS idx_safety_events_transaction_id ON safety_events(transaction_id);