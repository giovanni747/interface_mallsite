export function ensureAdmin(req, res, next) {
  if (!req.session.user || !req.session.user.is_admin) {
    return res.status(403).send('Access denied');
  }
  next();
} 