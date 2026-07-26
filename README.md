# 🔔 Real-Time Event-Driven Notification System

A production-ready notification system built with **Node.js, Redis Pub/Sub, Socket.io, MongoDB, and React**. Supports real-time in-app delivery via WebSockets and email delivery via SMTP, with multi-user targeting, admin broadcasting, and an event simulator.

**Live Demo:** [real-time-event-driven-notification.vercel.app](https://real-time-event-driven-notification.vercel.app)


---

## 🏗️ Architecture

```
Client (React + Socket.io)
        │
        │  HTTP (REST API)
        ▼
Express API Server
        │
        ├── Persist notification to MongoDB (persist-first strategy)
        │
        └── Publish event to Redis Pub/Sub
                        │
                        │ Subscribe
                        ▼
                Consumer Worker
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
         Socket.io            Nodemailer
      (Real-time in-app)      (Email SMTP)
              │
              ▼
    React Client (Bell UI)
    - Badge increments
    - Toast notification
    - Dropdown panel
```

### Key Design Decisions

- **Persist-first strategy** — Notification is saved to MongoDB before publishing to Redis. If the consumer crashes, no notification is lost.
- **Redis Pub/Sub** — Decouples producers from consumers. Adding a new delivery channel (e.g. push notifications) requires zero changes to producer code.
- **Socket.io Rooms** — Each user joins a private room identified by their `userId`. Real-time events are scoped per user — no cross-user leakage.
- **Compound MongoDB indexes** — `userId + createdAt` for feed queries, `userId + isRead` for unread count queries.

---

## ✨ Features

- 🔐 **JWT Authentication** — Register, login, protected routes
- 📤 **Event Publishing** — Trigger `order`, `payment`, `promo`, `system` events
- 👥 **Multi-user Targeting** — Send notifications to any specific user
- 📢 **Admin Broadcast** — Notify all registered users simultaneously
- ⚡ **Real-time Delivery** — Socket.io WebSocket push, bell badge updates instantly
- 📧 **Email Delivery** — Styled HTML emails via Nodemailer + Gmail SMTP
- 🤖 **Event Simulator** — Auto-fires random events every 8 seconds for live demo
- ✅ **Read/Unread Tracking** — Per-notification state, mark all as read
- 🛡️ **Rate Limiting** — 100 req/15min general, 10 req/15min for auth routes

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Socket.io-client, Axios, React-Hot-Toast |
| Backend | Node.js, Express.js |
| Message Broker | Redis Pub/Sub (ioredis) |
| Real-time | Socket.io |
| Database | MongoDB + Mongoose |
| Email | Nodemailer + Gmail SMTP |
| Auth | JWT + bcryptjs |
| Deployment | Render (backend), Vercel (frontend) |

---

## 📁 Project Structure

```
notification-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connection
│   │   │   └── redis.js           # Redis publisher + subscriber clients
│   │   ├── models/
│   │   │   ├── User.js            # User schema with bcrypt pre-save hook
│   │   │   └── Notification.js    # Notification schema with indexes
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── notification.routes.js
│   │   │   └── admin.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── notification.controller.js
│   │   │   └── admin.controller.js
│   │   ├── services/
│   │   │   ├── producer.service.js   # Publishes events to Redis
│   │   │   ├── consumer.service.js   # Subscribes and fans out delivery
│   │   │   └── email.service.js      # Nodemailer + HTML templates
│   │   ├── middleware/
│   │   │   └── auth.middleware.js    # JWT protect middleware
│   │   └── socket/
│   │       └── socket.js             # Socket.io init + room management
│   └── server.js
│
└── frontend/
    └── src/
        ├── api/
        │   └── axios.js              # Axios instance with JWT interceptor
        ├── context/
        │   └── AuthContext.jsx       # Global auth state
        ├── hooks/
        │   └── useSocket.js          # Socket.io connection + room join
        ├── components/
        │   ├── NotificationBell.jsx  # Bell icon, badge, dropdown panel
        │   └── NotificationItem.jsx  # Individual notification card
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            └── Dashboard.jsx         # Publish form, simulator, broadcast
```

---

## 🚀 Local Setup

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Redis (local via Memurai on Windows, or Redis Cloud)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/Real-Time-Event-Driven-Notification-System.git
cd Real-Time-Event-Driven-Notification-System
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/notification-system
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> For `EMAIL_PASS`, generate a Gmail App Password from Google Account → Security → 2-Step Verification → App Passwords.

Start the backend:
```bash
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `.env.development`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

Open `http://localhost:5173`

---

## 🔌 API Reference

### Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | ❌ |
| POST | `/api/auth/login` | Login and get JWT | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |
| GET | `/api/auth/users` | Get all other users | ✅ |

### Notifications

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/notifications/publish` | Publish a notification event | ✅ |
| GET | `/api/notifications` | Get all notifications for user | ✅ |
| GET | `/api/notifications/unread-count` | Get unread count | ✅ |
| PATCH | `/api/notifications/:id/read` | Mark one as read | ✅ |
| PATCH | `/api/notifications/mark-all-read` | Mark all as read | ✅ |

### Admin

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/admin/broadcast` | Broadcast to all users | ✅ |
| POST | `/api/admin/simulate/start` | Start event simulator | ✅ |
| POST | `/api/admin/simulate/stop` | Stop event simulator | ✅ |

---

## 🌊 Event Flow

### Publishing a notification

```
POST /api/notifications/publish
{
  "type": "order",
  "title": "Order Confirmed",
  "message": "Your order #1234 has been placed",
  "channels": ["in-app", "email"],
  "targetUserId": "64f3a..." // optional, defaults to self
}
```

### What happens internally

1. Controller calls `publishEvent()` in producer service
2. Producer persists notification to MongoDB (persist-first)
3. Producer publishes JSON payload to Redis `notifications` channel
4. Consumer receives the event via `subscriber.on('message')`
5. If `in-app` channel → `sendToUser()` emits to user's Socket.io room
6. If `email` channel → `sendEmail()` sends styled HTML email
7. React client receives socket event → bell badge increments → toast appears

---

## 🔴 Real-time Demo

To see real-time delivery across users:

1. Open two browser tabs (use incognito for the second)
2. Register two different accounts
3. Login as User A in Tab 1, User B in Tab 2
4. In Tab 1, publish a notification targeting User B
5. Watch Tab 2's bell update instantly without refresh
6. Hit **Start Simulator** — random events fire every 8 seconds across all users

---

## ☁️ Deployment

### Backend — Render

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `node server.js` |

Environment variables: `MONGO_URI`, `REDIS_URL`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`

### Frontend — Vercel

| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Framework | Vite |

Environment variables: `VITE_API_URL`, `VITE_SOCKET_URL`

---

## 📈 Scalability Considerations

| Concern | Current | Production Scale |
|---|---|---|
| Message broker | Redis Pub/Sub | Kafka (consumer groups, replay) |
| WebSocket scaling | Single instance | Redis adapter for Socket.io |
| Email delivery | Nodemailer | SendGrid / AWS SES |
| DB scaling | Single MongoDB | Sharded by userId |
| Failed deliveries | No retry | Dead letter queue + exponential backoff |

---
