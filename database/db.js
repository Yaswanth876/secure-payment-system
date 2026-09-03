import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sqlite3 from 'sqlite3';

const databaseDirectory = path.dirname(fileURLToPath(import.meta.url));
const databasePath = path.join(databaseDirectory, 'payment_guardian.db');
const migrationPath = path.join(databaseDirectory, 'migrations', '001_initial_schema.sql');
const seedPath = path.join(databaseDirectory, 'seeds', '001_demo_data.sql');

function openDatabase() {
  const database = new sqlite3.Database(databasePath);
  database.exec('PRAGMA foreign_keys = ON;');
  return database;
}

function run(database, sql, parameters = []) {
  return new Promise((resolve, reject) => {
    database.run(sql, parameters, function handleResult(error) {
      if (error) reject(error);
      else resolve(this);
    });
  });
}

function all(database, sql, parameters = []) {
  return new Promise((resolve, reject) => {
    database.all(sql, parameters, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });
}

function exec(database, sql) {
  return new Promise((resolve, reject) => {
    database.exec(sql, error => (error ? reject(error) : resolve()));
  });
}

function close(database) {
  return new Promise((resolve, reject) => {
    database.close(error => (error ? reject(error) : resolve()));
  });
}

async function applyMigration(database) {
  await exec(database, await fs.readFile(migrationPath, 'utf8'));
}

async function seedDatabase(database) {
  await exec(database, await fs.readFile(seedPath, 'utf8'));
}

async function setupDatabase() {
  const database = openDatabase();
  await applyMigration(database);
  await seedDatabase(database);
  await close(database);
}

async function resetDatabase() {
  await fs.rm(databasePath, { force: true });
  await setupDatabase();
}

async function expectFailure(database, sql, parameters = []) {
  try {
    await run(database, sql, parameters);
  } catch {
    return;
  }
  throw new Error('Expected database operation to fail');
}

async function testDatabase() {
  const database = openDatabase();
  const tables = await all(database, "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
  if (tables.length !== 6) throw new Error('Expected six required tables');

  const foreignKeys = await all(database, 'PRAGMA foreign_keys');
  if (foreignKeys[0].foreign_keys !== 1) throw new Error('Foreign keys are not enabled');

  await run(database, "INSERT INTO users (name, upi_id) VALUES ('Test User', 'test@upi')");
  const user = await all(database, "SELECT name FROM users WHERE upi_id = 'test@upi'");
  if (user[0].name !== 'Test User') throw new Error('User insert/retrieve failed');
  await run(database, "INSERT INTO accounts (user_id, bank_name, account_type, masked_account_number) VALUES (1, 'Test Bank', 'Savings', '••••0001')");
  await run(database, "INSERT INTO trusted_contacts (user_id, name, phone, relationship) VALUES (1, 'Test Contact', '+910000000001', 'Friend')");
  await expectFailure(database, "INSERT INTO accounts (user_id, bank_name, account_type, masked_account_number) VALUES (999, 'Test Bank', 'Savings', '••••0002')");

  await expectFailure(database, "INSERT INTO recipients (user_id, name, upi_id) VALUES (1, 'Duplicate', 'rahul@upi')");
  await expectFailure(database, "INSERT INTO transactions (id, sender_user_id, sender_account_id, recipient_id, amount, status) VALUES ('BAD-RECIPIENT', 1, 1, 999, 1, 'CREATED')");
  await expectFailure(database, "INSERT INTO transactions (id, sender_user_id, sender_account_id, recipient_id, amount, status) VALUES ('BAD-AMOUNT', 1, 1, 1, 0, 'CREATED')");
  await expectFailure(database, "INSERT INTO transactions (id, sender_user_id, sender_account_id, recipient_id, amount, status) VALUES ('BAD-STATUS', 1, 1, 1, 1, 'INVALID')");
  await expectFailure(database, "INSERT INTO safety_events (transaction_id, event_type, message) VALUES ('MISSING', 'STATUS_CHANGED', 'Invalid')");

  for (const status of ['CREATED', 'AUTHORIZED', 'PROCESSING']) {
    await run(database, `INSERT INTO transactions (id, sender_user_id, sender_account_id, recipient_id, amount, status) VALUES ('TEST-${status}', 1, 1, 1, 1, '${status}')`);
  }

  const statuses = await all(database, 'SELECT DISTINCT status FROM transactions ORDER BY status');
  const requiredStatuses = ['AUTHORIZED', 'CREATED', 'FAILED', 'PENDING', 'PROCESSING', 'SUCCESS', 'UNKNOWN'];
  if (!requiredStatuses.every(status => statuses.some(row => row.status === status))) throw new Error('Transaction state coverage failed');

  const unresolved = await all(database, "SELECT id FROM transactions INDEXED BY idx_transactions_continuity WHERE sender_user_id = 1 AND recipient_id = 1 AND amount = 500000 AND status IN ('PROCESSING', 'PENDING', 'UNKNOWN')");
  if (unresolved.length !== 1 || unresolved[0].id !== 'TXN-DEMO-001') throw new Error('Continuity query failed');

  const history = await all(database, "SELECT amount FROM transactions WHERE sender_user_id = 1 AND recipient_id = 1 AND status = 'SUCCESS' ORDER BY created_at");
  if (history.length !== 2 || history[0].amount !== 50000 || history[1].amount !== 75000) throw new Error('Amount history query failed');

  await close(database);
  console.log('Database tests passed.');
}

const command = process.argv[2] || 'setup';
if (command === 'migrate') await (async () => { const database = openDatabase(); await applyMigration(database); await close(database); })();
else if (command === 'seed') await (async () => { const database = openDatabase(); await seedDatabase(database); await close(database); })();
else if (command === 'setup') await setupDatabase();
else if (command === 'reset') await resetDatabase();
else if (command === 'test') await testDatabase();
else throw new Error(`Unknown database command: ${command}`);