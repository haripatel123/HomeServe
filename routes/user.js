const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { forwardAuthenticated, ensureAuthenticated } = require('../middleware/auth');

// Registration routes
router.get('/register', forwardAuthenticated, userController.showRegisterForm);
router.post('/register', userController.register);

// Login routes
router.get('/login', forwardAuthenticated, userController.showLoginForm);
router.post('/login', userController.login);

// Logout route
router.get('/logout', userController.logout);

// Profile & Address settings
router.get('/profile', ensureAuthenticated, userController.showProfile);
router.post('/profile/update', ensureAuthenticated, userController.updateProfile);
router.post('/profile/address', ensureAuthenticated, userController.addAddress);
router.post('/profile/address/:id/default', ensureAuthenticated, userController.setDefaultAddress);
router.post('/profile/address/:id/delete', ensureAuthenticated, userController.deleteAddress);

module.exports = router;