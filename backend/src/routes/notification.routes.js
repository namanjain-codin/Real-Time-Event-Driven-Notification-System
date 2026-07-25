const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  publish,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} = require('../controllers/notification.controller');

// All routes are protected
router.use(protect);

router.post('/publish', publish);
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markAsRead);
router.patch('/mark-all-read', markAllAsRead);

module.exports = router;