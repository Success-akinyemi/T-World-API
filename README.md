# T-World Mini API — Learning + Profiles

> **Back-End Development Fellow Technical Assessment**  
> Node.js · Express · TypeScript · MongoDB Atlas · Swagger · JWT Auth

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [API Documentation](#api-documentation)
- [Endpoints Reference](#endpoints-reference)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [CI/CD](#cicd)
- [Testing](#testing)
- [Seeding the Database](#seeding-the-database)
- [curl Examples](#curl-examples)

---

## Overview

A production-ready REST API that powers a mobile learning platform. Users can:

- Register and log in via JWT-based auth
- Browse paginated learning items, filtered by category and difficulty level
- Save and unsave items to a personal reading list
- View their saved items

---

## Tech Stack

| Layer         | Technology                              |
|---------------|-----------------------------------------|
| Runtime       | Node.js 20.x                            |
| Framework     | Express 4.x                             |
| Language      | TypeScript 5.x                          |
| Database      | MongoDB Atlas via Mongoose 8.x          |
| Auth          | JSON Web Tokens (JWT) + bcryptjs        |
| Validation    | express-validator                       |
| Documentation | Swagger UI (swagger-jsdoc)              |
| Logging       | Winston + Morgan                        |
| Security      | Helmet, CORS, express-rate-limit        |
| Testing       | Jest + Supertest                        |
| CI            | GitHub Actions                          |

---

## Project Structure

```
src/
├── config/
│   ├── index.ts          # Env var loading & validation
│   └── swagger.ts        # OpenAPI / Swagger spec
├── controllers/
│   ├── auth.controller.ts
│   └── items.controller.ts
├── db/
│   ├── connection.ts     # Mongoose connect / disconnect
│   └── models/
│       ├── User.ts
│       ├── Item.ts
│       └── SavedItem.ts
├── middlewares/
│   ├── auth.middleware.ts    # JWT guard (protect)
│   ├── error.middleware.ts   # Centralised error handler + 404
│   └── validate.middleware.ts
├── routes/
│   ├── auth.routes.ts
│   ├── items.routes.ts
│   └── me.routes.ts
├── services/
│   ├── auth.service.ts   # Business logic: register / login
│   └── items.service.ts  # Business logic: CRUD + save
├── types/
│   └── index.ts          # Shared TypeScript interfaces
├── utils/
│   ├── AppError.ts       # Custom operational error class
│   ├── logger.ts         # Winston logger
│   ├── response.ts       # Standardised API response helpers
│   └── seed.ts           # DB seed script
├── validators/
│   ├── auth.validator.ts
│   └── items.validator.ts
├── app.ts                # Express app setup (middleware, routes)
└── server.ts             # HTTP server entrypoint
tests/
├── auth.test.ts
└── items.test.ts
.github/
└── workflows/
    └── ci.yml
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (free tier works)

### Installation

```bash
git clone https://github.com/your-username/tworld-api.git
cd tworld-api
npm install
```

### Environment Variables

Copy `.env.example` and fill in your values:

```bash
cp .env.example .env
```

| Variable              | Description                              | Default     |
|-----------------------|------------------------------------------|-------------|
| `NODE_ENV`            | `development` / `production` / `test`    | development |
| `PORT`                | HTTP port                                | 5000        |
| `MONGODB_URI`         | MongoDB Atlas connection string          | **required**|
| `JWT_SECRET`          | Secret key for signing JWTs             | **required**|
| `JWT_EXPIRES_IN`      | JWT TTL (e.g. `7d`, `24h`)              | 7d          |
| `RATE_LIMIT_WINDOW_MS`| Rate-limit window in milliseconds        | 900000 (15m)|
| `RATE_LIMIT_MAX`      | Max requests per window per IP           | 100         |

### Running Locally

```bash
# Development (auto-reload)
npm run dev

# Build TypeScript → dist/
npm run build

# Production (after build)
npm start
```

---

## API Documentation

Interactive Swagger UI is available at:

```
http://localhost:5000/api/docs
```

Raw OpenAPI JSON:

```
http://localhost:5000/api/docs.json
```

---

## Endpoints Reference

| Method   | Endpoint              | Auth Required | Description                         |
|----------|-----------------------|:---:|-----------------------------------------|
| POST     | `/api/auth/register`  | ✗   | Create a new account                    |
| POST     | `/api/auth/login`     | ✗   | Login, receive JWT                      |
| GET      | `/api/items`          | ✗   | List items (pagination + filters)       |
| GET      | `/api/items/:id`      | ✗   | Get a single item                       |
| POST     | `/api/items/:id/save` | ✓   | Save an item to personal list           |
| DELETE   | `/api/items/:id/save` | ✓   | Remove item from saved list             |
| GET      | `/api/me/saved`       | ✓   | Get current user's saved items          |
| GET      | `/health`             | ✗   | Health check                            |

### Query Parameters for `GET /api/items`

| Param      | Type    | Description                                        |
|------------|---------|----------------------------------------------------|
| `page`     | integer | Page number (default: 1)                           |
| `limit`    | integer | Items per page, max 100 (default: 10)              |
| `category` | string  | `course` · `article` · `video` · `podcast` · `book`|
| `level`    | string  | `beginner` · `intermediate` · `advanced`           |
| `search`   | string  | Full-text search on title and description          |

---

## Database Schema

### `users`

```
{
  _id:        ObjectId  (PK)
  name:       String    required
  email:      String    required, unique   ← indexed
  password:   String    bcrypt-hashed, select: false
  createdAt:  Date
  updatedAt:  Date
}
```

### `items`

```
{
  _id:         ObjectId  (PK)
  title:       String    required
  description: String    required
  category:    String    enum, required    ← indexed
  tags:        [String]                   ← indexed
  imageUrl:    String    optional
  author:      String    required
  duration:    Number    minutes, optional
  level:       String    enum, required
  createdAt:   Date
  updatedAt:   Date
}
```

**Additional indexes:** `{ title: "text", description: "text" }` for full-text search.

### `saved_items`

```
{
  _id:     ObjectId  (PK)
  user:    ObjectId  → users._id
  item:    ObjectId  → items._id
  savedAt: Date      default: now
}
```

**Indexes:**
- `{ user: 1, item: 1 }` — unique compound (prevents duplicates)
- `{ user: 1, savedAt: -1 }` — fast retrieval sorted by recency

---

## Authentication

This API uses **JWT (JSON Web Token)** authentication.

1. Register or login to receive a `token`
2. Attach the token to protected requests:
   ```
   Authorization: Bearer <your_token>
   ```

Tokens expire after the period set in `JWT_EXPIRES_IN` (default: 7 days).

Passwords are hashed with **bcrypt** (salt rounds: 12) and are **never** returned in any API response.

---

## CI/CD

GitHub Actions runs on every push to `main` / `develop` and on all pull requests:

1. **Lint** – ESLint against all TypeScript source files
2. **Build** – `tsc` type-checks and compiles to `dist/`
3. **Test** – Jest test suite against an in-workflow MongoDB service container

See `.github/workflows/ci.yml` for the full workflow definition.

---

## Testing

```bash
# Run all tests
npm test

# With coverage report
npm test -- --coverage
```

Test files live in `tests/` and use **Supertest** to fire real HTTP requests against the Express app.

---

## Seeding the Database

Populate the `items` collection with 8 sample learning items:

```bash
npm run seed
```

> Requires `MONGODB_URI` to be set in `.env`. **Clears existing items first.**

---

## curl Examples

```bash
BASE=http://localhost:5000/api

# Register
curl -s -X POST $BASE/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"Secret1234"}' | jq .

# Login (capture token)
TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"Secret1234"}' \
  | jq -r '.data.token')

# List items (paginated + filtered)
curl -s "$BASE/items?page=1&limit=5&category=course" | jq .

# Get single item
curl -s "$BASE/items/<ITEM_ID>" | jq .

# Save item
curl -s -X POST "$BASE/items/<ITEM_ID>/save" \
  -H "Authorization: Bearer $TOKEN" | jq .

# View saved items
curl -s "$BASE/me/saved" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Unsave item
curl -s -X DELETE "$BASE/items/<ITEM_ID>/save" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## License

MIT © Tongston
