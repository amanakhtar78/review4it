# Cinefolio - Next.js Movie Database & Admin Panel

This is a Next.js application designed as a comprehensive movie database, complete with a powerful admin panel for content management. The backend is built on an MVC-like architecture using Next.js API Routes, with MongoDB as the database and Mongoose for data modeling.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Database**: MongoDB
- **ODM**: Mongoose
- **Styling**: Tailwind CSS, ShadCN UI
- **Authentication**: JWT (JSON Web Tokens) with `jose`
- **AI**: Genkit

---

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- MongoDB instance (local or cloud-based like MongoDB Atlas)

### 1. Environment Setup

Create a `.env.local` file in the root of your project and add the following environment variables:

```bash
# Your MongoDB connection string
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority"

# A strong, secret key for signing JWTs (at least 32 characters long)
JWT_SECRET="your-super-secret-and-long-jwt-key-here"

# Optional: Set the log level (e.g., 'info', 'debug')
LOG_LEVEL="info"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

---

## Project Structure

The project is organized into two main parts using Next.js Route Groups:

- `src/app/(main)`: Contains all public-facing pages of the movie website. It uses `src/app/(main)/layout.tsx` as its root layout.
- `src/app/(admin)`: Contains all pages for the protected admin panel. It uses `src/app/(admin)/layout.tsx` as its root layout, ensuring complete separation from the main site.
- `src/app/api`: Houses all the backend API endpoints, which function as controllers.
- `src/lib/models`: Contains all Mongoose schemas, which define the structure of the database collections.
- `src/lib/db.ts`: Manages the MongoDB database connection.
- `src/middleware.ts`: Secures the API endpoints by verifying JWTs.

---

## Authentication

Authentication is handled via JWTs. Admin users must first log in to receive a bearer token, which they must then include in the `Authorization` header for all subsequent API requests.

### Login

- **Endpoint**: `POST /api/auth/login`
- **Description**: Authenticates an admin user based on email and password.
- **Request Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "password"
  }
  ```
- **Response**: On success, returns a JWT token.
  ```json
  {
    "success": true,
    "token": "ey..."
  }
  ```

### Making Authenticated Requests

All API endpoints (except `/api/auth/login`) are protected. You must include the JWT in the `Authorization` header of your requests:

`Authorization: Bearer <your_jwt_token>`

---

## API Endpoint Documentation

All endpoints are protected and require a valid Bearer Token.

### Movies (`/api/movies`)

- **`GET /api/movies`**: Fetches a list of all movies.
- **`POST /api/movies`**: Creates a new movie.
- **`GET /api/movies/{id}`**: Fetches a single movie by its MongoDB `_id`.
- **`PUT /api/movies/{id}`**: Updates a movie by its MongoDB `_id`.
- **`DELETE /api/movies/{id}`**: Deletes a movie by its MongoDB `_id`.

### Admins (`/api/admins`)

- **`GET /api/admins`**: Fetches a list of all admin users (passwords are omitted).
- **`POST /api/admins`**: Creates a new admin user. The password will be automatically hashed.
- **`GET /api/admins/{id}`**: Fetches a single admin by their MongoDB `_id`.
- **`PUT /api/admins/{id}`**: Updates an admin's details.
- **`DELETE /api/admins/{id}`**: Deletes an admin user.

### Users (`/api/users`)

- **`GET /api/users`**: Fetches a list of all regular users.
- **`POST /api/users`**: Creates a new user.
- **`GET /api/users/{id}`**: Fetches a single user by their MongoDB `_id`.
- **`PUT /api/users/{id}`**: Updates a user's details.
- **`DELETE /api/users/{id}`**: Deletes a user.

### Cast Master (`/api/cast`)

- **`GET /api/cast`**: Fetches all records from the cast master list.
- **`POST /api/cast`**: Creates a new cast master record.
- **`GET /api/cast/{id}`**: Fetches a single cast master record by its custom `castId`.
- **`PUT /api/cast/{id}`**: Updates a cast master record by its custom `castId`.
- **`DELETE /api/cast/{id}`**: Deletes a cast master record by its custom `castId`.

### Top Actor Earnings (`/api/actors/earnings`)

- **`GET /api/actors/earnings`**: Fetches all actor earning records.
- **`POST /api/actors/earnings`**: Creates a new actor earning record.
- **`GET /api/actors/earnings/{id}`**: Fetches a single record by its MongoDB `_id`.
- **`PUT /api/actors/earnings/{id}`**: Updates an actor earning record.
- **`DELETE /api/actors/earnings/{id}`**: Deletes an actor earning record.

### Earnings by Country (`/api/earnings/country`)

- **`GET /api/earnings/country`**: Fetches all country-wise earning records.
- **`POST /api/earnings/country`**: Creates a new country-wise earning record.
- **`GET /api/earnings/country/{id}`**: Fetches a single record by its MongoDB `_id`.
- **`PUT /api/earnings/country/{id}`**: Updates a country-wise earning record.
- **`DELETE /api/earnings/country/{id}`**: Deletes a country-wise earning record.
