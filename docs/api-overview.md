# Review4it API Overview

This document explains how the API works, how authentication/authorization is handled, key endpoints, and examples for common flows like login.

## Tech Stack and Structure

- **Runtime**: Next.js App Router (API routes under `src/app/api/*`)
- **Database**: MongoDB via Mongoose
- **DB Connector**: `src/lib/db.ts` (connection re-use and logging)
- **Models**: `src/lib/models/*`
- **Logging**: `src/lib/logger.ts` (winston)
- **Client-side API helper**: `src/lib/api.ts` (adds `Authorization: Bearer <token>` automatically when present)

Base URL for all examples below assumes you’re running the Next.js app locally and using relative client calls. Server routes are under `/api/...`.

---

## Authentication and Authorization

### Tokens and storage

- On successful login, the server returns a **JWT**.
- The client stores it in `localStorage` as `authToken`.
- The helper in `src/lib/api.ts` automatically sends `Authorization: Bearer <token>` for all requests when the token exists.

### Admin login

- Route: `POST /api/auth/login`
- Body: `{ email: string, password: string }`
- Response: `{ success: true, token: string }`
- Token claims include: `{ userId, username, email, rights, isAdmin: true }`
- Expiration: 1 hour

Example (curl):

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secret"}'
```

Response:

```json
{ "success": true, "token": "<JWT>" }
```

### User login

- Route: `POST /api/auth/user-login`
- Body: `{ email: string, password: string }`
- On first login of the day, awards 5 XP (login streak).
- Response: `{ success: true, token: string, loginStreakAwarded: boolean }`
- Token claims include: `{ userId, username, email, isAdmin: false }`
- Expiration: 24 hours

Example (curl):

```bash
curl -X POST http://localhost:3000/api/auth/user-login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret"}'
```

Response:

```json
{ "success": true, "token": "<JWT>", "loginStreakAwarded": true }
```

### Client usage for login

Front-end calls (via `src/lib/api.ts`):

```ts
import { authApi } from "@/lib/api";

const { token } = await authApi.userLogin({ email, password });
localStorage.setItem("authToken", token);
// All subsequent api calls will include Authorization header
```

### Important: Authorization enforcement

- Current middleware at `src/middleware.ts` is permissive and allows all API requests to pass through (no token verification on the server).
- The client includes the token in `Authorization` header, but routes do not currently validate it.

If you want server-side enforcement, add validation (example outline):

```ts
// Example only (not present in repo):
import { jwtVerify } from "jose";

async function verifyAuth(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice("Bearer ".length);
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const { payload } = await jwtVerify(token, secret);
  return payload; // contains claims like isAdmin
}
```

Then enforce per-route or via middleware.

---

## Error handling contract

- On success: `{ success: true, data: <payload> }` or `{ success: true, token: "..." }`
- On error: `{ success: false, error: string }` with appropriate HTTP status code
- The client helper throws `Error(errorMessage)` on non-2xx responses.

---

## Users

### Register user

- Route: `POST /api/users`
- Body: `{ username, email, password, ... }`
- Response: `{ success: true, data: <userWithoutPassword> }`

### Get all users

- Route: `GET /api/users`
- Response: `{ success: true, data: User[] }` (password excluded)

### Get user by id

- Route: `GET /api/users/:id`
- Response: `{ success: true, data: User }`

### Update user

- Route: `PUT /api/users/:id`
- Body: partial user fields
- Response: `{ success: true, data: User }`

### Delete user

- Route: `DELETE /api/users/:id`
- Response: `{ success: true }`

### Leaderboard

- Route: `GET /api/users/leaderboard`
- Response: `{ success: true, data: Array<...> }`

### User actions (like/save/dislike)

- Add action: `POST /api/users/actions`
  - Body: `{ userId, movieId, actionType: "like" | "save" | "dislike" }`
  - Transactionally updates user’s list and increments movie counters.
  - Response: `{ success: true, data: UpdatedMovie }`
- Remove action: `POST /api/users/actions/remove`
  - Body: same as above
  - Removes from user’s list and decrements counters (not below zero).
  - Response: `{ success: true, data: UpdatedMovie }`

---

## Quizzes

### Today’s quizzes

- Route: `GET /api/quizzes/today`
- Response: `{ success: true, data: IQuiz[] }`

### Submit answers

- Route: `POST /api/quizzes/submit`
- Body: `{ userId: string, quizId: string, answers: (number | null)[] }`
- Scoring:
  - Each correct answer: +10 XP
  - Completion bonus (if all answered): +5 XP
  - Points awarded only once per day per user; re-attempts return 0 XP.
- Response:

```json
{
  "success": true,
  "message": "Submission processed.",
  "data": {
    "pointsAwarded": 25,
    "score": 2,
    "totalQuestions": 2,
    "correctAnswers": [1, 0]
  }
}
```

---

## Movies and Series

### Movie series

- List: `GET /api/movieseries`
- Get one: `GET /api/movieseries/:id`
- Search: `GET /api/movieseries/search?query=...`
- Upcoming: `GET /api/movieseries/upcoming`
- In Theaters: `GET /api/movieseries/in-theaters`
- Yearly Summary: `GET /api/movieseries/yearly-summary`
- Create/Update/Delete: `POST | PUT | DELETE /api/movieseries[/id]`

### Movies

- List: `GET /api/movies`
- Get one: `GET /api/movies/:id`
- Create/Update/Delete: `POST | PUT | DELETE /api/movies[/id]`

---

## Earnings

### Country-wise earnings

- List all: `GET /api/earnings/country`
- By movie: `GET /api/earnings/country/movie/:movieId`
- Create: `POST /api/earnings/country`
- Update: `PUT /api/earnings/country/:id`
- Delete: `DELETE /api/earnings/country/:id`

---

## Actors and Cast

### Top actors’ earnings

- List all: `GET /api/actors/earnings`
- By movie: `GET /api/actors/earnings/movie/:movieId`
- Create/Update/Delete: `POST | PUT | DELETE /api/actors/earnings[/id]`

### Cast master

- List: `GET /api/cast`
- Create/Update/Delete: `POST | PUT | DELETE /api/cast[/id]`

---

## Admins

- List: `GET /api/admins`
- Create/Update/Delete: `POST | PUT | DELETE /api/admins[/id]`

---

## Login flow step-by-step (User)

1. Front-end collects `email` and `password`.
2. Calls `POST /api/auth/user-login`.
3. On success, server returns `{ success: true, token, loginStreakAwarded }`.
4. Client saves `token` to `localStorage.authToken`.
5. All future API calls automatically include `Authorization: Bearer <token>` via `src/lib/api.ts`.
6. UI gates certain actions based on login state (client-side). Server-side authorization is currently not enforced but can be enabled as described above.

## Login flow step-by-step (Admin)

1. Front-end collects admin credentials.
2. Calls `POST /api/auth/login`.
3. On success, server returns `{ success: true, token }` with `isAdmin: true` claim.
4. Client stores token; subsequent calls include Authorization header.

---

## Database Connection

- `src/lib/db.ts`:
  - Uses a global cached connection in dev to avoid reconnects on every hot reload.
  - Logs connection lifecycle and errors.
  - Reads `MONGODB_URI` from environment.

---

## Logging

- `src/lib/logger.ts`:
  - Uses `winston` with timestamped, colorized console output.
  - Used across API routes for info/warn/error messages.

---

## Notes and recommendations

- **Security**: Consider enabling server-side JWT verification (middleware or per-route) before deploying.
- **Secrets**: Ensure `JWT_SECRET` and `MONGODB_URI` are set in `.env.local`.
- **Error surfaces**: The client helper throws on non-OK responses; handle with try/catch in UI.
