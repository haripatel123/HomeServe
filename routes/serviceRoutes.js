const express = require('express');
const router  = express.Router();
const serviceController = require('../controllers/serviceController');

router.get('/:id', serviceController.detail);

module.exports = router;
