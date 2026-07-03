const express = require('express');
const router  = express.Router();
const homeController = require('../controllers/homeController');

router.get('/', homeController.index);

// Navbar redesign options showcase playground
router.get('/navbar-demo', (req, res) => {
    res.render('navbar-demo', {
        title: 'Navbar Redesign Sandbox',
        currentUrl: '/navbar-demo',
        currentCustomer: 1,
        currentProvider: 1
    });
});

module.exports = router;
