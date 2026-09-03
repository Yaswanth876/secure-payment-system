# Payment Guardian Database

## Database Purpose

This SQLite database stores the prototype's payment participants, masked funding accounts, saved recipients, transaction records, safety event history, and optional trusted contacts. It stores no passwords, PINs, CVVs, authentication secrets, or full bank account numbers. Amounts are integer paise (`₹500` is stored as `50000`) to avoid floating-point arithmetic.

## Tables

- `users`: payment users and their UPI identifiers.
- `accounts`: masked bank accounts belonging to users.
- `recipients`: saved recipient recognition records belonging to a user. `photo` is only a local path/reference, never identity proof.
- `transactions`: payment records and their current status and safety status.
- `safety_events`: append-only explanations of safety-related transaction events.
- `trusted_contacts`: optional assistance contacts; they are not payment authorizers.

## Relationships

```text
USER
 ├── ACCOUNT
 ├── RECIPIENT
 ├── TRUSTED_CONTACT
 └── TRANSACTION
       ├── RECIPIENT
       ├── ACCOUNT
       └── SAFETY_EVENT
```

Core user, account, recipient, and transaction records use restrictive deletes. Safety events are deleted with their owning transaction because they have no meaning without it.

## Transaction States

```text
CREATED, AUTHORIZED, PROCESSING, PENDING, SUCCESS, FAILED, UNKNOWN
```

The schema stores these values but does not implement state-transition logic.

## Safety States

```text
NORMAL, COOLING_OFF, HELD, LOCKED
```

## Setup

From the project root:

```bash
npm run db:migrate
npm run db:seed
```

For a clean, deterministic database, use:

```bash
npm run db:reset
```

This removes `database/payment_guardian.db`, recreates it from the migration, and loads the demo seed data. Run the database validation suite with:

```bash
npm run db:test
```