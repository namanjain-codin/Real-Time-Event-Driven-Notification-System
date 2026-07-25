const Redis = require('ioredis');

const publisher = new Redis(process.env.REDIS_URL);
const subscriber = new Redis(process.env.REDIS_URL);

publisher.on('connect', () => console.log('Redis publisher connected'));
subscriber.on('connect', () => console.log('Redis subscriber connected'));

publisher.on('error', (err) => console.error('Redis publisher error:', err.message));
subscriber.on('error', (err) => console.error('Redis subscriber error:', err.message));

module.exports = { publisher, subscriber };