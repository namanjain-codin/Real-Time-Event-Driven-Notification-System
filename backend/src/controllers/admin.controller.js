const User = require('../models/User');
const { publishEvent } = require('../services/producer.service');

let simulatorInterval = null;

// Broadcast to ALL users
const broadcast = async (req, res) => {
  try {
    const { type, title, message, channels } = req.body;

    const users = await User.find({}).select('_id');

    const promises = users.map(user =>
      publishEvent(type, {
        userId: user._id,
        title,
        message,
        channels: channels || ['in-app'],
        metadata: { broadcast: true }
      })
    );

    await Promise.all(promises);

    res.json({ message: `Broadcast sent to ${users.length} users` });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Simulator — fires random events every few seconds
const simulatedEvents = [
  { type: 'order', title: 'Order Placed', message: 'Your order #{{id}} has been placed successfully' },
  { type: 'payment', title: 'Payment Received', message: 'Payment of ₹{{amount}} received for order #{{id}}' },
  { type: 'promo', title: 'Flash Sale!', message: 'Get {{discount}}% off on all electronics. Limited time!' },
  { type: 'system', title: 'System Update', message: 'Scheduled maintenance on {{date}}. Expect brief downtime.' }
];

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const startSimulator = async (req, res) => {
  if (simulatorInterval) {
    return res.json({ message: 'Simulator already running' });
  }

  console.log('Event simulator started');

  simulatorInterval = setInterval(async () => {
    try {
      const users = await User.find({}).select('_id');
      if (users.length === 0) return;

      // Pick random user and random event
      const randomUser = users[randomBetween(0, users.length - 1)];
      const randomEvent = simulatedEvents[randomBetween(0, simulatedEvents.length - 1)];

      const id = randomBetween(1000, 9999);
      const amount = randomBetween(199, 4999);
      const discount = randomBetween(10, 50);
      const date = new Date(Date.now() + 86400000).toLocaleDateString();

      const message = randomEvent.message
        .replace('{{id}}', id)
        .replace('{{amount}}', amount)
        .replace('{{discount}}', discount)
        .replace('{{date}}', date);

      await publishEvent(randomEvent.type, {
        userId: randomUser._id,
        title: randomEvent.title,
        message,
        channels: ['in-app'],
        metadata: { simulated: true }
      });

      console.log(`Simulated event → ${randomEvent.type} for userId: ${randomUser._id}`);

    } catch (err) {
      console.error('Simulator error:', err.message);
    }
  }, 8000); // fires every 8 seconds

  res.json({ message: 'Simulator started — events firing every 8 seconds' });
};

const stopSimulator = (req, res) => {
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
    simulatorInterval = null;
    console.log('Event simulator stopped');
    res.json({ message: 'Simulator stopped' });
  } else {
    res.json({ message: 'Simulator was not running' });
  }
};

module.exports = { broadcast, startSimulator, stopSimulator };