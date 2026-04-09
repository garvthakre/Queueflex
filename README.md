# QUEUEFLEX

[![Category](https://img.shields.io/badge/Category-Web--App-blue)](https://github.com) [![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Flask%20%7C%20Node.js-green)](https://github.com) [![License](https://img.shields.io/badge/License-MIT-orange)](https://github.com)

> Queue management platform with scored reporting, service tracking, and real-time queue monitoring.

*This is a quick overview — architecture details and full walkthroughs are in the [project wiki](#).*

---

## What It Does

- Manage and book services through a clean, modern web interface (Next.js frontend)
- Authenticate users via JWT tokens with role-based access (admin vs. regular user)
- Communicate between microservices using gRPC for fast, reliable token verification
- Generate queue positions and track customer status in real-time
- Support provider-level service creation, editing, and queue management
- Compare queue stats by service type with admin-level analytics
- Run three independent backend services: Auth, Admin, and Queue

---

## Quick Start

```bash
./start_all.sh
```

> **Tip**
> This project uses three microservices. Run `./start_all.sh` from the root to start all of them at once.
> Install frontend separately: `cd frontend/next-frontend && npm install && npm run dev`

---

## Architecture

| Service | Port | Tech | Description |
|---|---|---|---|
| `auth_service` | 3000 (REST), 50051 (gRPC) | Node.js | JWT auth + gRPC token verification |
| `admin_service` | 5000 | Python / Flask | Service CRUD, admin & provider endpoints |
| `queue_service` | 4000 | Python / Flask | Queue CRUD, position tracking |
| `next-frontend` | 3001 | Next.js / TypeScript | Client-facing UI |

---

## Commands

| Command | Description |
|---|---|
| `./start_all.sh` | Start all backend services |
| `./test_api.sh` | Run full API test suite |
| `npm run dev` | Start frontend (port 3001) |
| `node index.js` | Start auth service manually |
| `python main.py` | Start admin or queue service manually |

---

## API Endpoints

### Auth Service (`localhost:3000`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/signup` | Register new user |
| POST | `/login` | Login and receive JWT |

### Admin Service (`localhost:5000`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/services` | User | List active services |
| GET | `/services/:id` | User | Get service by ID |
| POST | `/admin/services` | Admin | Create service |
| PUT | `/admin/services/:id` | Admin | Update service |
| DELETE | `/admin/services/:id` | Admin | Delete service |
| GET | `/admin/queue/all` | Admin | View all queues |
| GET | `/admin/queue/stats` | Admin | Queue analytics |
| GET | `/provider/services` | Provider | Provider's own services |
| PUT | `/provider/queue/:id` | Provider | Update queue item |

### Queue Service (`localhost:4000`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/queue/add` | Join a service queue |
| GET | `/queue/get` | Get user's queues (admin: all) |
| GET | `/queue/get/:id` | Get specific queue item |
| PUT | `/queue/update/:id` | Update queue item |
| DELETE | `/queue/delete/:id` | Leave queue |
| GET | `/services` | List available services |

---

## Project Structure

```
queueflex/
├── backend/
│   └── services/
│       ├── auth_service/       # Node.js — JWT auth + gRPC server
│       ├── admin_service/      # Flask — service & admin management
│       └── queue_service/      # Flask — queue operations
├── frontend/
│   └── next-frontend/          # Next.js TypeScript frontend
├── logs/                       # Service log output
├── start_all.sh                # Start all backend services
└── test_api.sh                 # End-to-end API test suite
```

---

## Role System

| Role | Access |
|---|---|
| **User** | Book services, view own queues, update own queue items |
| **Provider** (is_admin=true) | Create/manage own services, view/update their queues |
| **Admin** (is_admin=true) | Full access: all services, all queues, stats, delete anything |

> **Note**
> Admin and Provider share the same `is_admin` flag in the database. Admins access `/admin/*` routes; providers access `/provider/*` routes. Both are verified via gRPC from the auth service.

---

## Environment Variables

### Auth Service

```env
JWT_SECRET_KEY=your_secret_key
TOKEN_EXPIRATION_HOURS=24
PORT=3000
GRPC_PORT=0.0.0.0:50051
CORS_ORIGIN=http://localhost:3001
```

### Admin / Queue Service

```env
PORT=5000           # or 4000
FLASK_ENV=development
CORS_ORIGIN=http://localhost:3001
```

### Frontend

```env
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_SERVICE_URL=http://localhost:5000
NEXT_PUBLIC_QUEUE_SERVICE_URL=http://localhost:4000
```

---

## Test Coverage

The `test_api.sh` script covers:

- User registration (regular & admin)
- Login and JWT token issuance
- Queue CRUD operations (add, get, update, delete)
- Admin-only endpoint enforcement
- Queue statistics and analytics
- Permission checks (user cannot access admin routes)
- Error handling (missing token, invalid token, missing fields, not found)

---

## Tech Stack

- **Frontend** — Next.js 16, TypeScript, Tailwind CSS, Axios
- **Auth Service** — Node.js, Express, JWT, bcrypt, SQLite, gRPC
- **Admin Service** — Python, Flask, Flask-CORS, SQLite, gRPC client
- **Queue Service** — Python, Flask, Flask-CORS, in-memory queue, gRPC client
- **Inter-service** — Protocol Buffers (proto3), gRPC
