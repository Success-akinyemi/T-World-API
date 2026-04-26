# T-World Mini API

A REST API for a mobile learning platform, built as part of the Tongston Back-End Development Fellowship technical assessment.

Node.js · Express · TypeScript · MongoDB Atlas

---

## What it does

Users can register, log in, browse learning content, and save items to a personal reading list. That's really it — nothing fancy, but everything works end to end with proper auth, validation, error handling, and tests.

---

## Stack

- **Runtime:** Node.js 20.x
- **Framework:** Express 4.x
- **Language:** TypeScript 5.x
- **Database:** MongoDB Atlas (Mongoose 8.x)
- **Auth:** JWT + bcryptjs
- **Validation:** express-validator
- **Docs:** Swagger UI
- **Logging:** Winston + Morgan
- **Security:** Helmet, CORS, rate limiting
- **Tests:** Jest + Supertest
- **CI:** GitHub Actions

---

## Project layout

```
src/
├── config/
│   ├── index.ts          # env loading & validation
│   └── swagger.ts        # OpenAPI spec
├── controllers/
│   ├── auth.controller.ts
│   └── items.controller.ts
├── db/
│   ├── connection.ts
│   └── models/
│       ├── User.ts
│       ├── Item.ts
│       └── SavedItem.ts
├── middlewares/
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── validate.middleware.ts
├── routes/
│   ├── auth.routes.ts
│   ├── items.routes.ts
│   └── me.routes.ts
├── services/
│   ├── auth.service.ts
│   └── items.service.ts
├── types/
│   └── index.ts
├── utils/
│   ├── AppError.ts
│   ├── logger.ts
│   ├── response.ts
│   └── seed.ts
├── validators/
│   ├── auth.validator.ts
│   └── items.validator.ts
├── app.ts
└── server.ts
tests/
├── auth.test.ts
└── items.test.ts
```

---

## Getting started

You'll need Node 20+, npm 9+, and a MongoDB Atlas cluster (free tier is fine).

```bash
git clone https://github.com/your-username/tworld-api.git
cd tworld-api
npm install
```

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | `development` / `production` / `test` | development |
| `PORT` | HTTP port | 5000 |
| `MONGODB_URI` | Your Atlas connection string | required |
| `JWT_SECRET` | Secret for signing tokens | required |
| `JWT_EXPIRES_IN` | Token TTL — e.g. `7d`, `24h` | 7d |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | 900000 |
| `RATE_LIMIT_MAX` | Max requests per window per IP | 100 |

Then start it up:

```bash
npm run dev      # development with auto-reload
npm run build    # compile to dist/
npm start        # run the compiled output
```

---

## API docs

Swagger UI is at `http://localhost:5000/api/docs` once the server is running. Raw OpenAPI JSON is at `/api/docs.json` if you need it.

---

## Endpoints

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| POST | `/api/auth/register` | — | Create an account |
| POST | `/api/auth/login` | — | Log in, get a JWT |
| GET | `/api/items` | — | List items with pagination + filters |
| GET | `/api/items/:id` | — | Get a single item |
| POST | `/api/items/:id/save` | ✓ | Save to your reading list |
| DELETE | `/api/items/:id/save` | ✓ | Remove from your reading list |
| GET | `/api/me/saved` | ✓ | See everything you've saved |
| GET | `/health` | — | Health check |

### Filtering `GET /api/items`

| Param | Type | Notes |
|---|---|---|
| `page` | integer | defaults to 1 |
| `limit` | integer | defaults to 10, max 100 |
| `category` | string | `course`, `article`, `video`, `podcast`, `book` |
| `level` | string | `beginner`, `intermediate`, `advanced` |
| `search` | string | full-text search on title + description |

---

## Database

Three collections:

**users**
```
_id, name, email (unique, indexed), password (bcrypt, never returned), createdAt, updatedAt
```

**items**
```
_id, title, description, category (indexed), tags (indexed), imageUrl, author, duration, level, createdAt, updatedAt
```
There's also a `{ title: "text", description: "text" }` index for the search param.

**saved_items**
```
_id, user → users._id, item → items._id, savedAt
```
Compound unique index on `{ user, item }` to prevent duplicates. Second index on `{ user, savedAt: -1 }` for efficient sorted retrieval.

---

## Auth

Register or log in to get a JWT, then pass it on protected requests:

```
Authorization: Bearer <token>
```

Tokens last for however long `JWT_EXPIRES_IN` is set to (7 days by default). Passwords are bcrypt-hashed with 12 salt rounds and never come back in any response.

---

## Tests

```bash
npm test
npm test -- --coverage
```

Tests live in `tests/` and use Supertest to make real HTTP requests against the app. There's also a GitHub Actions workflow that lints, builds, and runs the full test suite on every push to `main`/`develop` and on PRs — it spins up a MongoDB service container so no external DB is needed in CI.

---

## Seeding

To load 8 sample items into your database:

```bash
npm run seed
```

Fair warning: it wipes existing items first.

---

## Quick curl examples

```bash
BASE=http://localhost:5000/api

# Register
curl -s -X POST $BASE/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"Secret1234"}' | jq .

# Login and grab the token
TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"Secret1234"}' \
  | jq -r '.data.token')

# Browse items
curl -s "$BASE/items?page=1&limit=5&category=course" | jq .

# Save one
curl -s -X POST "$BASE/items/<ITEM_ID>/save" \
  -H "Authorization: Bearer $TOKEN" | jq .

# See your saved list
curl -s "$BASE/me/saved" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Unsave
curl -s -X DELETE "$BASE/items/<ITEM_ID>/save" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

MIT © Tongston