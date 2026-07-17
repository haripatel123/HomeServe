/**
 * Authentication & Authorization Middleware
 */

// Redirect unauthenticated users to login
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error_msg', 'Please log in to access this page');
  res.redirect('/login');
}

// Check if user has one of the allowed roles
// Usage: ensureRole('customer', 'admin')
function ensureRole(...roles) {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      req.flash('error_msg', 'Please log in to access this page');
      return res.redirect('/login');
    }

    if (roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).render('403', {
      title: 'Access Denied — HomeServe',
      message: 'You do not have permission to access this page.',
    });
  };
}

// Redirect already-logged-in users away from login/register
function forwardAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }

  // Redirect to role-appropriate page
  switch (req.user.role) {
    case 'provider':
      return res.redirect('/provider');
    case 'admin':
      return res.redirect('/analytics');
    default:
      return res.redirect('/');
  }
}

module.exports = {
  ensureAuthenticated,
  ensureRole,
  forwardAuthenticated,
};
