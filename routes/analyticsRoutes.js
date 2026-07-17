const express = require('express');
const router  = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { ensureRole } = require('../middleware/auth');

router.get('/', ensureRole('admin'), analyticsController.dashboard);

module.exports = router;

