const express = require('express');
const router  = express.Router();
const providerController = require('../controllers/providerController');
const { ensureRole } = require('../middleware/auth');

router.get('/',                              ensureRole('provider', 'admin'), providerController.dashboard);
router.post('/availability',                 ensureRole('provider', 'admin'), providerController.addAvailability);
router.post('/availability/:id/delete',      ensureRole('provider', 'admin'), providerController.deleteAvailability);

module.exports = router;

