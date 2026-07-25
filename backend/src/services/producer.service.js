const { publisher } = require('../config/redis');
const Notification = require('../models/Notification');

const publishEvent = async (eventType, data) => {
  try {
    // 1. Persist notification to MongoDB first
    const notification = new Notification({
      userId: data.userId,
      type: eventType,
      title: data.title,
      message: data.message,
      channels: data.channels || ['in-app'],
      metadata: data.metadata || {}
    });

    await notification.save();

    // 2. Publish event to Redis channel
    const payload = JSON.stringify({
      notificationId: notification._id,
      userId: data.userId,
      type: eventType,
      title: data.title,
      message: data.message,
      channels: data.channels || ['in-app'],
      metadata: data.metadata || {}
    });

    await publisher.publish('notifications', payload);

    console.log(`Event published → type: ${eventType}, userId: ${data.userId}`);

    return notification;

  } catch (error) {
    console.error('Producer error:', error.message);
    throw error;
  }
};

module.exports = { publishEvent };