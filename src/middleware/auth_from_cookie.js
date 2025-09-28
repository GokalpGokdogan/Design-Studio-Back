module.exports = function authFromCookie(req, res, next) {
  const uid = req.cookies && req.cookies.uid;
  if (!uid) return res.status(401).json({ error: 'Missing user cookie (uid)' });
  req.user_id = uid;
  next();
};