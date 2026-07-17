const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const pool = require('./db');

module.exports = function (passport) {
  // Local Strategy — authenticate using email + password against Account table
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const result = await pool.query('SELECT * FROM Account WHERE email = $1', [email]);

        if (result.rows.length === 0) {
          return done(null, false, { message: 'No account found with that email' });
        }

        const account = result.rows[0];
        const isMatch = await bcrypt.compare(password, account.password_hash);

        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password' });
        }

        return done(null, account);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Serialize — store account_id in session
  passport.serializeUser((user, done) => {
    done(null, user.account_id);
  });

  // Deserialize — load full profile from DB on each request
  passport.deserializeUser(async (id, done) => {
    try {
      const result = await pool.query(
        `SELECT a.account_id, a.email, a.role, a.customer_id, a.provider_id,
                c.name AS customer_name, c.phone AS customer_phone,
                p.name AS provider_name, p.phone AS provider_phone
         FROM Account a
         LEFT JOIN Customer c ON a.customer_id = c.customer_id
         LEFT JOIN Provider p ON a.provider_id = p.provider_id
         WHERE a.account_id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return done(null, false);
      }

      const row = result.rows[0];

      // Build a clean user object
      const user = {
        account_id: row.account_id,
        email: row.email,
        role: row.role,
        customer_id: row.customer_id,
        provider_id: row.provider_id,
        name: row.customer_name || row.provider_name || 'Admin',
        phone: row.customer_phone || row.provider_phone || null,
      };

      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
