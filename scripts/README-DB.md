# Postgres Database (Neon)

## Behavior

- Without `DATABASE_URL`: products are read/written from `data/products.json` (current local fallback behavior).
- With `DATABASE_URL` (or `POSTGRES_URL`): products are stored in Postgres. The table is created automatically on first use.

## Configure Neon with Vercel

1. Deploy the project to Vercel (from GitHub).
2. In your Vercel project: Storage (or Integrations) -> Marketplace -> find Neon -> Add.
3. Create a Neon database (or connect an existing one). Vercel will inject `POSTGRES_URL` or `DATABASE_URL`.
4. In Settings -> Environment Variables, confirm `DATABASE_URL` (or `POSTGRES_URL`) is set.
5. Optional: run `scripts/init-db.sql` once in the Neon SQL Editor to create table and indexes manually (otherwise it is auto-created).

## Local Setup

1. Create a database on [console.neon.tech](https://console.neon.tech).
2. Copy the connection URL (`postgresql://...?sslmode=require`).
3. In `luxe-store/`, create `.env.local` and add:

```bash
DATABASE_URL=postgresql://user:password@host.neon.tech/neondb?sslmode=require
```

4. Restart `npm run dev`. Products will be read/written in Neon.

## Initial Seed (Import JSON Products)

To import products from `data/products.json` into Postgres:

```bash
cd luxe-store
DATABASE_URL=\"postgresql://...\" node scripts/seed-postgres.mjs
```

If you use `.env.local`, you can run:

```bash
node -r dotenv/config scripts/seed-postgres.mjs
```
