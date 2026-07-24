# Curator Notes — Backend

The API server for **Curator Notes**, a notes app with AI-assisted writing features (summarize, improve, extract key points). Built with a metered AI credit system, role-based access, and rate limiting — the pieces needed to eventually run this as a paid product, not just a CRUD demo.

Frontend: [curator-notes-frontend](https://curator-notes-frontend.vercel.app) *(link to your frontend repo here)*

---

## Tech Stack

| Layer          | Choice                                   |
| -------------- | ----------------------------------------- |
| Runtime        | Node.js + Express 5                       |
| Database       | PostgreSQL + Prisma ORM                   |
| Auth           | Firebase Authentication (ID token verify) |
| AI             | Google Gemini API (`gemini-2.5-flash`)    |
| Rate limiting  | Upstash Redis (sliding window)            |
| Hosting        | Vercel (serverless functions)             |

---

## Architecture

```
src/
├── routes/        # Express routers — define endpoints + middleware chain
├── controller/    # Request/response handling, orchestrates services
├── services/      # Business logic that talks to Prisma / external APIs
├── middleware/     # Auth verification, DB user hydration, rate limiting
├── lib/           # Thin client wrappers (Prisma, Redis, rate limiter config)
├── utils/         # Pure helper functions (credit math)
└── config/        # Firebase Admin bootstrap
```

Request flow for a protected route looks like:

```
request → verifyFirebaseToken → dbUserFecther → (rate limiter) → controller → service → Prisma
```

Each middleware step attaches more to `req.user`: the Firebase token is verified first, then the corresponding DB row (role, credits) is loaded, so downstream code never has to re-query the user.

---

## Core systems

### Authentication
Firebase issues the ID token on the client; the backend only verifies it (`admin.auth().verifyIdToken`) and never sees credentials directly. A first-time user is upserted into Postgres via `POST /api/auth/sync-user`, which is also where the monthly AI credit reset is checked.

### AI credit metering
Every AI-assisted call goes through **reserve → call → reconcile**, not a flat per-call charge:

1. Estimate tokens from prompt length, convert to a credit estimate, and atomically decrement the user's balance only if they have enough (`prisma.user.updateMany` with a `gte` guard — avoids a race where two requests both pass a balance check before either decrements).
2. Call Gemini with a capped `maxOutputTokens`.
3. Refund the difference between the estimate and the token count Gemini actually reports.
4. If the Gemini call itself fails, the full reservation is refunded — a failed API call never costs the user credits.

Credits reset to a fixed monthly allowance based on `lastCreditReset`, checked lazily on login and on AI use (no cron job needed).

### Rate limiting
Sliding-window limits (Upstash Redis) are applied per concern, not globally:
- AI requests: separate limits for `USER` vs `PREMIUM` roles, `ADMIN` bypasses.
- Login attempts: limited per IP, independent of the AI limiter.

### Roles
A role-based user model (`USER | PREMIUM | ADMIN`) is the seam for a future paid tier — `PREMIUM` currently only affects the AI rate limit, no billing is wired up yet (see Roadmap).

---

## API Reference

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <Firebase ID token>`.

| Method | Route              | Auth | Description                                  |
| ------ | ------------------ | ---- | --------------------------------------------- |
| POST   | `/auth/sync-user`  | ✅   | Create/fetch the account for the logged-in user |
| GET    | `/notes`           | ✅   | List the current user's notes (searchable)    |
| POST   | `/notes`           | ✅   | Create a note                                 |
| GET    | `/notes/:id`       | ✅   | Get one note (owner-only)                     |
| PUT    | `/notes/:id`       | ✅   | Update a note (owner-only)                    |
| DELETE | `/notes/:id`       | ✅   | Delete a note (owner-only)                    |
| POST   | `/gemini/assist`   | ✅   | AI action on note text (summarize/improve/extract), metered by AI credits |

---

## Getting Started

```bash
npm install
cp .env.example .env   # fill in the values below
npx prisma migrate dev
npm run dev
```

### Environment variables

See [`.env.example`](./.env.example). Firebase Admin can be configured either via the three `FIREBASE_*` env vars **or** a `src/config/serviceAccountKey.json` file (env vars take priority if both are present).

### Prisma commands

```bash
npx prisma migrate dev --name your-migration-name   # local schema change
npx prisma generate                                  # regenerate client
npx prisma migrate deploy                            # apply migrations in production
```

---

## Future Goals

Working toward this being a real paid product rather than a portfolio backend:

- [ ] Stripe integration to actually move users into `PREMIUM` (currently the role exists but nothing sets it)
- [ ] Admin endpoints (view users, adjust credits, basic support tooling)
- [ ] Request body validation (zod) at the controller boundary
- [ ] Automated tests around the credit reservation/refund logic
- [ ] Pagination on `GET /notes`
- [ ] Structured logging / error tracking
