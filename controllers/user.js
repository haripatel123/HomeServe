const bcrypt = require('bcrypt');
const passport = require('passport');
const pool = require('../config/db');
const bookingModel = require('../models/bookingModel');


module.exports = {
  showRegisterForm: (req, res) => {
    res.render('register', { title: 'Register — HomeServe' });
  },

  showLoginForm: (req, res) => {
    res.render('login', { title: 'Login — HomeServe' });
  },

  register: async (req, res) => {
    const { name, email, password, phone, role, bio, experience_yrs } = req.body;
    const selectedRole = (role === 'provider') ? 'provider' : 'customer';
    let errors = [];

    // Common validations
    if (!name || !email || !password || !phone) {
      errors.push({ msg: 'Please fill in all required fields' });
    }

    if (password && password.length < 6) {
      errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      errors.push({ msg: 'Phone number must be exactly 10 digits' });
    }

    // Provider-specific validations
    if (selectedRole === 'provider') {
      if (experience_yrs && (isNaN(experience_yrs) || parseInt(experience_yrs) < 0)) {
        errors.push({ msg: 'Experience years must be a positive number' });
      }
    }

    if (errors.length > 0) {
      return res.render('register', { errors, name, email, phone, role: selectedRole, bio, experience_yrs });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if email is already taken in the Account table
      const accountCheck = await client.query('SELECT * FROM Account WHERE email = $1', [email]);
      if (accountCheck.rows.length > 0) {
        errors.push({ msg: 'Email already registered' });
        await client.query('ROLLBACK');
        return res.render('register', { errors, name, email, phone, role: selectedRole, bio, experience_yrs });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      if (selectedRole === 'provider') {
        // Insert into Provider table
        const providerResult = await client.query(
          'INSERT INTO Provider (name, email, phone, bio, experience_yrs) VALUES ($1, $2, $3, $4, $5) RETURNING provider_id',
          [name, email, phone, bio || null, parseInt(experience_yrs) || 0]
        );
        const providerId = providerResult.rows[0].provider_id;

        // Insert into Account with provider_id
        await client.query(
          'INSERT INTO Account (email, password_hash, role, provider_id) VALUES ($1, $2, $3, $4)',
          [email, hashedPassword, 'provider', providerId]
        );
      } else {
        // Insert into Customer table
        const customerResult = await client.query(
          'INSERT INTO Customer (name, email, phone) VALUES ($1, $2, $3) RETURNING customer_id',
          [name, email, phone]
        );
        const customerId = customerResult.rows[0].customer_id;

        // Insert into Account with customer_id
        await client.query(
          'INSERT INTO Account (email, password_hash, role, customer_id) VALUES ($1, $2, $3, $4)',
          [email, hashedPassword, 'customer', customerId]
        );
      }

      await client.query('COMMIT');

      req.flash('success_msg', 'You are now registered and can log in');
      res.redirect('/login');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
      errors.push({ msg: 'Server error during registration' });
      res.render('register', { errors, name, email, phone, role: selectedRole, bio, experience_yrs });
    } finally {
      client.release();
    }
  },

  login: (req, res, next) => {
    const { email, password } = req.body;

    let errors = [];
    if (!email || !password) {
      errors.push({ msg: 'Please enter email and password' });
    }

    if (errors.length > 0) {
      return res.render('login', { errors });
    }

    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);

      if (!user) {
        req.flash('error', info.message || 'Login failed');
        return res.redirect('/login');
      }

      req.logIn(user, (err) => {
        if (err) return next(err);

        // Role-based redirect after login
        switch (user.role) {
          case 'provider':
            return res.redirect('/provider');
          case 'admin':
            return res.redirect('/analytics');
          default:
            return res.redirect('/');
        }
      });
    })(req, res, next);
  },

  logout: (req, res, next) => {
    req.logout((err) => {
      if (err) { return next(err); }
      req.flash('success_msg', 'You have been logged out');
      res.redirect('/');
    });
  },

  showProfile: async (req, res, next) => {
    try {
      let addresses = [];
      let providerDetails = null;

      if (req.user.role === 'customer') {
        addresses = await bookingModel.getCustomerAddresses(req.user.customer_id);
      } else if (req.user.role === 'provider') {
        const result = await pool.query(
          'SELECT bio, experience_yrs FROM Provider WHERE provider_id = $1',
          [req.user.provider_id]
        );
        providerDetails = result.rows[0] || null;
      }

      res.render('profile', {
        title: 'Profile Settings — HomeServe',
        addresses,
        providerDetails,
        errors: [],
        formData: {}
      });
    } catch (err) {
      next(err);
    }
  },

  updateProfile: async (req, res, next) => {
    const { name, phone, bio, experience_yrs } = req.body;
    let errors = [];

    if (!name || !phone) {
      errors.push({ msg: 'Name and phone are required fields' });
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      errors.push({ msg: 'Phone number must be exactly 10 digits' });
    }

    if (req.user.role === 'provider' && experience_yrs && (isNaN(experience_yrs) || parseInt(experience_yrs) < 0)) {
      errors.push({ msg: 'Experience years must be a positive number' });
    }

    if (errors.length > 0) {
      let addresses = [];
      let providerDetails = { bio, experience_yrs };
      if (req.user.role === 'customer') {
        addresses = await bookingModel.getCustomerAddresses(req.user.customer_id);
      }
      return res.render('profile', {
        title: 'Profile Settings — HomeServe',
        addresses,
        providerDetails,
        errors,
        formData: req.body
      });
    }

    try {
      const id = req.user.role === 'provider' ? req.user.provider_id : req.user.customer_id;
      await bookingModel.updateUserProfile(req.user.role, id, name, phone, bio, experience_yrs);
      req.flash('success_msg', 'Profile updated successfully');
      res.redirect('/profile');
    } catch (err) {
      next(err);
    }
  },

  addAddress: async (req, res, next) => {
    const { line1, line2, city, state, pincode, is_default, address_type } = req.body;
    let errors = [];

    if (!line1 || !city || !state || !pincode) {
      errors.push({ msg: 'Please fill in all required address fields' });
    }

    if (pincode && !/^\d{6}$/.test(pincode)) {
      errors.push({ msg: 'Pincode must be exactly 6 digits' });
    }

    if (errors.length > 0) {
      let addresses = await bookingModel.getCustomerAddresses(req.user.customer_id);
      return res.render('profile', {
        title: 'Profile Settings — HomeServe',
        addresses,
        providerDetails: null,
        errors,
        formData: req.body
      });
    }

    try {
      await bookingModel.addCustomerAddress(req.user.customer_id, {
        line1,
        line2,
        city,
        state,
        pincode,
        isDefault: is_default === 'on' || is_default === 'true',
        addressType: address_type || 'Home'
      });
      req.flash('success_msg', 'Address added successfully');
      res.redirect('/profile');
    } catch (err) {
      next(err);
    }
  },

  deleteAddress: async (req, res, next) => {
    try {
      const addressId = parseInt(req.params.id);
      await bookingModel.deleteCustomerAddress(addressId, req.user.customer_id);
      req.flash('success_msg', 'Address deleted successfully');
      res.redirect('/profile');
    } catch (err) {
      next(err);
    }
  },

  setDefaultAddress: async (req, res, next) => {
    try {
      const addressId = parseInt(req.params.id);
      await bookingModel.setDefaultCustomerAddress(addressId, req.user.customer_id);
      req.flash('success_msg', 'Default address updated');
      res.redirect('/profile');
    } catch (err) {
      next(err);
    }
  }
};