# Payment Guardian Backend

This Express backend is the source of truth for the Payment Guardian prototype. It reads and writes the existing SQLite database at `database/payment_guardian.db`, exposes only simulated payment behavior, and stores no credentials, PINs, OTPs, CVVs, or full account numbers.

## Start

From the project root, create the database and seed data if needed:

```bash
npm run db:reset
```

Start the backend:

```bash
npm start --prefix backend
```

The server listens on `http://localhost:5000` by default. Set `PORT` and `PAYMENT_SIMULATED_OUTCOME` in `backend/.env`; valid outcomes are `SUCCESS`, `PENDING`, `FAILED`, and `UNKNOWN`.

## API

All responses use `{ "success": true, "data": {} }` or `{ "success": false, "error": { "code": "...", "message": "..." } }`.

- `GET /api/health`
- `GET /api/users/:userId`
- `GET /api/users/:userId/accounts`
- `GET /api/users/:userId/profile`
- `GET /api/users/:userId/recipients`
- `GET /api/users/:userId/transactions?status=SUCCESS&recipient=1`
- `GET /api/recipients/:recipientId`
- `GET /api/recipients/search?query=Rahul`
- `POST /api/recipients`
- `POST /api/payments/preview`
- `POST /api/payments/:transactionId/authorize`
- `GET /api/payments/:transactionId/status`
- `GET /api/transactions/:transactionId?userId=1`

### Preview

`POST /api/payments/preview` accepts integer paise:

```json
{"senderUserId":1,"senderAccountId":1,"recipientId":1,"amount":50000}
```

It creates a `CREATED` transaction and returns the recipient, amount in paise and rupees, sender account, and deterministic safety results. New recipients and large amount increases create safety events without automatically claiming fraud or rejecting the payment.

### Authorization and outcomes

`POST /api/payments/:transactionId/authorize` requires:

```json
{"confirmation":{"recipientConfirmed":true,"amountConfirmed":true}}
```

Authorization records confirmation events and advances the transaction through `AUTHORIZED` and `PROCESSING` to the configured simulated outcome. Repeated authorization requests return the existing state and do not execute a second payment.

The state machine permits only `CREATED -> AUTHORIZED -> PROCESSING`, then `SUCCESS`, `FAILED`, `PENDING`, or `UNKNOWN` as defined by the migration. Terminal `SUCCESS` and `FAILED` records cannot be changed.

### Continuity Lock

Before authorization, the backend searches for matching sender, recipient, and paise amount in `PROCESSING`, `PENDING`, or `UNKNOWN` states. A match blocks authorization with `CONTINUITY_LOCK`, records a `CONTINUITY_LOCK` safety event, and returns `canRetry: false`. A matching successful payment is also reported as an informative duplicate warning and is not silently authorized. Failed payments do not block a new preview/retry.

## Error codes

Common codes include `USER_NOT_FOUND`, `ACCOUNT_NOT_FOUND`, `RECIPIENT_NOT_FOUND`, `INVALID_AMOUNT`, `TRANSACTION_NOT_FOUND`, `INVALID_STATE_TRANSITION`, `INVALID_CONFIRMATION`, `CONTINUITY_LOCK`, `UNAUTHORIZED_TRANSACTION`, `DUPLICATE_RECIPIENT`, and `INTERNAL_ERROR`.

## Demo scenarios

Seed recipient `1` is Rahul Kumar. Preview `50000` to demonstrate a normal payment, `500000` to produce the deterministic large-increase warning, recipient `2` to demonstrate a new recipient, and `500000` again to encounter the seeded `TXN-DEMO-001` continuity lock. Set `PAYMENT_SIMULATED_OUTCOME` to demonstrate each simulated terminal or unresolved outcome.