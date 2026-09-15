Caramello — Backend + Prisma integration

Quick start

1. Change into the backend directory

```bash
cd backend
```

2. Install dependencies

```bash
npm install
```

3. Generate Prisma client and migrate (creates SQLite `dev.db`)

```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

4. Start server

```bash
npm start
```

The Express server serves the frontend files and exposes API endpoints under `/api/products`.

Frontend integration

- Admin panel (`admin.js`) now syncs product changes to the server (best-effort).
- Public site (`script.js`) will attempt to fetch live products from the server on load and fall back to localStorage.

If you want real-time updates across clients, deploy the server and open both admin and public pages from `http://localhost:3000`.
