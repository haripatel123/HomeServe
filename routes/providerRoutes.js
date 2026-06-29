const express = require('express');
const router  = express.Router();
const providerController = require('../controllers/providerController');

router.get('/',                              providerController.dashboard);
router.post('/availability',                 providerController.addAvailability);
router.post('/availability/:id/delete',      providerController.deleteAvailability);

module.exports = router;
