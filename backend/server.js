require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const rateLimit = require('express-rate-limit');

const connectDB = require('./src/config/db');
const { publisher, subscriber } = require('./src/config/redis');
const { initSocket } = require('./src/socket/socket');
const { startConsumer } = require('./src/services/consumer.service');

const adminRoutes = require('./src/routes/admin.routes');
const authRoutes = require('./src/routes/auth.routes');
const notificationRoutes = require('./src/routes/notification.routes');

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://real-time-event-driven-notification-system-crv8mt24a.vercel.app',
    'https://real-time-event-driven-notification-system.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => res.json({ status: 'Server running' }));

initSocket(server);

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { message: 'Too many requests, please try again later' }
});

// Stricter limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many auth attempts, please try again later' }
});

app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startConsumer();
  });
});