const Notification = require('../models/Notification');
const { publishEvent } = require('../services/producer.service');

// @POST /api/notifications/publish
// Manually trigger a notification event (simulates an order, payment, etc.)
const publish = async (req, res) => {
  try {
    const { type, title, message, channels, metadata, targetUserId } = req.body;

    // If targetUserId provided, send to that user. Otherwise send to self.
    const recipientId = targetUserId || req.user._id;

    const notification = await publishEvent(type, {
      userId: recipientId,
      title,
      message,
      channels: channels || ['in-app'],
      metadata: metadata || {}
    });

    res.status(201).json({
      message: 'Event published successfully',
      notification
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @GET /api/notifications
// Get all notifications for the logged-in user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })  // newest first
      .limit(50);

    res.json({ notifications });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @GET /api/notifications/unread-count
// Get count of unread notifications
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });

    res.json({ unreadCount: count });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @PATCH /api/notifications/:id/read
// Mark a single notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },  // ensure user owns it
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Marked as read', notification });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @PATCH /api/notifications/mark-all-read
// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  publish,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};