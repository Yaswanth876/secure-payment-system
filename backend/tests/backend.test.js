import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import app from '../src/app.js';
import database, { close } from '../src/database/database.js';

let server;
let baseUrl;

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.json();
  return { response, body };
}

before(async () => {
  server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise(resolve => server.close(resolve));
  await close(database);
});

test('health, profile, recipient and search APIs work', async () => {
  const health = await request('/api/health');
  assert.equal(health.response.status, 200);
  assert.equal(health.body.data.database, 'connected');

  const profile = await request('/api/users/1/profile');
  assert.equal(profile.body.data.name, 'Vishwajith');
  assert.equal(profile.body.data.accounts[0].maskedAccountNumber, '••••7812');

  const recipient = await request('/api/recipients/1');
  assert.equal(recipient.body.data.upiId, 'rahul@upi');

  const search = await request('/api/recipients/search?query=Rahul');
  assert.equal(search.body.data.length, 2);
});

test('preview returns paise, rupees and deterministic amount warning', async () => {
  const result = await request('/api/payments/preview', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ senderUserId: 1, senderAccountId: 1, recipientId: 1, amount: 500000 })
  });
  assert.equal(result.response.status, 201);
  assert.equal(result.body.data.amount.paise, 500000);
  assert.equal(result.body.data.amount.rupees, 5000);
  assert.equal(result.body.data.safety.amountWarning.type, 'LARGE_INCREASE');
});

test('new recipient and invalid confirmation are enforced', async () => {
  const created = await request('/api/recipients', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ userId: 1, name: 'Test New', upiId: 'test.new@upi' })
  });
  const preview = await request('/api/payments/preview', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ senderUserId: 1, senderAccountId: 1, recipientId: created.body.data.recipientId, amount: 10000 })
  });
  assert.equal(preview.body.data.safety.isNewRecipient, true);

  const authorization = await request(`/api/payments/${preview.body.data.transactionId}/authorize`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ confirmation: { recipientConfirmed: true, amountConfirmed: false } })
  });
  assert.equal(authorization.response.status, 400);
  assert.equal(authorization.body.error.code, 'INVALID_CONFIRMATION');
});

test('valid authorization succeeds and repeated authorization is idempotent', async () => {
  const preview = await request('/api/payments/preview', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ senderUserId: 1, senderAccountId: 1, recipientId: 3, amount: 10000 })
  });
  const path = `/api/payments/${preview.body.data.transactionId}/authorize`;
  const options = { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ confirmation: { recipientConfirmed: true, amountConfirmed: true } }) };
  const authorization = await request(path, options);
  const repeated = await request(path, options);
  assert.equal(authorization.body.data.status, 'SUCCESS');
  assert.equal(repeated.body.data.alreadyProcessed, true);
});

test('authorization sends the amount selected after a mismatch', async () => {
  const preview = await request('/api/payments/preview', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ senderUserId: 1, senderAccountId: 1, recipientId: 2, amount: 10000 })
  });
  const result = await request(`/api/payments/${preview.body.data.transactionId}/authorize`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ confirmation: { recipientConfirmed: true, amountConfirmed: true }, amount: 12500 })
  });
  assert.equal(result.body.data.amount, 12500);
  assert.equal(result.body.data.status, 'SUCCESS');
});

test('seeded pending transaction blocks an equivalent authorization', async () => {
  const preview = await request('/api/payments/preview', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ senderUserId: 1, senderAccountId: 1, recipientId: 1, amount: 500000 })
  });
  const result = await request(`/api/payments/${preview.body.data.transactionId}/authorize`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ confirmation: { recipientConfirmed: true, amountConfirmed: true } })
  });
  assert.equal(result.response.status, 409);
  assert.equal(result.body.error.code, 'CONTINUITY_LOCK');
  assert.equal(result.body.data.canRetry, false);
});