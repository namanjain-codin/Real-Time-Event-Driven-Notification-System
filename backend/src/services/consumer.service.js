const { subscriber } = require('../config/redis');
const { sendToUser } = require('../socket/socket');
const { sendEmail, buildEmailTemplate } = require('./email.service');
const User = require('../models/User');

const startConsumer = async () => {
  console.log('Consumer started → listening on Redis channel: notifications');

  // Subscribe to the notifications channel
  await subscriber.subscribe('notifications');

  // This fires every time a message is published to the channel
  subscriber.on('message', async (channel, message) => {
    if (channel !== 'notifications') return;

    try {
      const event = JSON.parse(message);
      console.log(`Event received → type: ${event.type}, userId: ${event.userId}`);

      const { userId, type, title, message: msg, channels, metadata } = event;

      // --- In-app delivery via Socket.io ---
      if (channels.includes('in-app')) {
        sendToUser(userId, 'notification', {
          notificationId: event.notificationId,
          type,
          title,
          message: msg,
          metadata,
          createdAt: new Date()
        });
        console.log(`In-app notification sent → userId: ${userId}`);
      }

      // --- Email delivery via Nodemailer ---
      if (channels.includes('email')) {
        const user = await User.findById(userId).select('email name');
        if (user) {
          const html = buildEmailTemplate(title, msg, type);
          await sendEmail({
            to: user.email,
            subject: title,
            html
          });
        }
      }

    } catch (error) {
      console.error('Consumer error:', error.message);
    }
  });
};

module.exports = { startConsumer };