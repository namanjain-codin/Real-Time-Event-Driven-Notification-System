require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');

const connectDB = require('./src/config/db');
const { publisher, subscriber } = require('./src/config/redis');
const { initSocket } = require('./src/socket/socket');
const { startConsumer } = require('./src/services/consumer.service');

const adminRoutes = require('./src/routes/admin.routes');
const authRoutes = require('./src/routes/auth.routes');
const notificationRoutes = require('./src/routes/notification.routes');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => res.json({ status: 'Server running' }));

initSocket(server);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startConsumer();
  });
});