const bcrypt = require('bcrypt');
const passport = require('passport');
const pool = require('../config/db');
const bookingModel = require('../models/bookingModel');

// Validate returnTo paths to prevent open-redirect attacks
function safeReturnTo(url) {
  if (!url || typeof url !== 'string') return null;
  // Must start with / but not // (protocol-relative)
  if (!url.startsWith('/') || url.startsWith('//')) return null;
  // Block auth pages to avoid redirect loops
  const blocked = ['/login', '/register', '/logout'];
  const pathname = url.split('?')[0];
  if (blocked.includes(pathname)) return null;
  return url;
}


module.exports = {
  showRegisterForm: (req, res) => {
    // Capture where the user came from (via query param or Referer header)
    if (!req.session.returnTo) {
      const from = req.query.returnTo || req.get('Referer');
      if (from) {
        try {
          const url = new URL(from, `${req.protocol}://${req.get('host')}`);
          // Only store same-origin, non-auth paths
          if (url.host === req.get('host') && !['/login', '/register', '/logout'].includes(url.pathname)) {
            req.session.returnTo = url.pathname + url.search;
          }
        } catch (_) { /* ignore malformed URLs */ }
      }
    }
    res.render('register', { title: 'Register — HomeServe' });
  },

  showLoginForm: (req, res) => {
    // Capture where the user came from (via query param or Referer header)
    if (!req.session.returnTo) {
      const from = req.query.returnTo || req.get('Referer');
      if (from) {
        try {
          const url = new URL(from, `${req.protocol}://${req.get('host')}`);
          // Only store same-origin, non-auth paths
          if (url.host === req.get('host') && !['/login', '/register', '/logout'].includes(url.pathname)) {
            req.session.returnTo = url.pathname + url.search;
          }
        } catch (_) { /* ignore malformed URLs */ }
      }
    }
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

      let accountId;
      if (selectedRole === 'provider') {
        // Insert into Provider table
        const providerResult = await client.query(
          'INSERT INTO Provider (name, email, phone, bio, experience_yrs) VALUES ($1, $2, $3, $4, $5) RETURNING provider_id',
          [name, email, phone, bio || null, parseInt(experience_yrs) || 0]
        );
        const providerId = providerResult.rows[0].provider_id;

        // Insert into Account with provider_id
        const accountResult = await client.query(
          'INSERT INTO Account (email, password_hash, role, provider_id) VALUES ($1, $2, $3, $4) RETURNING account_id',
          [email, hashedPassword, 'provider', providerId]
        );
        accountId = accountResult.rows[0].account_id;
      } else {
        // Insert into Customer table
        const customerResult = await client.query(
          'INSERT INTO Customer (name, email, phone) VALUES ($1, $2, $3) RETURNING customer_id',
          [name, email, phone]
        );
        const customerId = customerResult.rows[0].customer_id;

        // Insert into Account with customer_id
        const accountResult = await client.query(
          'INSERT INTO Account (email, password_hash, role, customer_id) VALUES ($1, $2, $3, $4) RETURNING account_id',
          [email, hashedPassword, 'customer', customerId]
        );
        accountId = accountResult.rows[0].account_id;
      }

      await client.query('COMMIT');

      // Auto login after successful registration
      const newUser = {
        account_id: accountId,
        role: selectedRole
      };

      req.logIn(newUser, (err) => {
        if (err) {
          console.error('[ERROR] Auto-login failed:', err);
          req.flash('success_msg', 'You are now registered and can log in');
          return res.redirect('/login');
        }

        req.flash('success_msg', 'Registration successful! Welcome to HomeServe.');

        // Redirect to the page the user was on before registering
        const returnTo = req.session.returnTo;
        delete req.session.returnTo;

        if (returnTo) {
          return res.redirect(returnTo);
        }

        // Fall back to role-based default
        if (newUser.role === 'provider') {
          return res.redirect('/provider');
        } else {
          return res.redirect('/');
        }
      });
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

        // Redirect to the page the user was on before logging in
        const returnTo = req.session.returnTo;
        delete req.session.returnTo;

        if (returnTo) {
          return res.redirect(returnTo);
        }

        // Fall back to role-based redirect
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
        formData: {},
        returnTo: safeReturnTo(req.query.returnTo)
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
        formData: req.body,
        returnTo: safeReturnTo(req.body.returnTo)
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
      const returnTo = safeReturnTo(req.body.returnTo);
      res.redirect(returnTo || '/profile');
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