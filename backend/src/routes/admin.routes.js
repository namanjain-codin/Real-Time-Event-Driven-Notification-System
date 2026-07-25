const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { broadcast, startSimulator, stopSimulator } = require('../controllers/admin.controller');

router.use(protect);

router.post('/broadcast', broadcast);
router.post('/simulate/start', startSimulator);
router.post('/simulate/stop', stopSimulator);

module.exports = router;