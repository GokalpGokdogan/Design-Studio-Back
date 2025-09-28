const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Project = require('../models/Project');

function newId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// Create user (and set cookie)
async function createUser(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already exists' });

    const user_id = newId('user');
    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({ user_id, email, password_hash, project_ids: [] });

    res.cookie('uid', user.user_id, { httpOnly: true, sameSite: 'lax' });
    res.json({ user_id: user.user_id, email: user.email, project_ids: user.project_ids, createdAt: user.createdAt });
  } catch (e) {
    console.error('createUser error:', e);
    res.status(500).json({ error: 'Failed to create user' });
  }
}

// Update user (email/password)
async function updateUser(req, res) {
  try {
    const { user_id } = req.params;
    const { email, password } = req.body || {};

    const user = await User.findOne({ user_id });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (email) user.email = email;
    if (password) user.password_hash = await bcrypt.hash(password, 10);
    await user.save();

    res.json({ user_id: user.user_id, email: user.email, project_ids: user.project_ids, updatedAt: user.updatedAt });
  } catch (e) {
    console.error('updateUser error:', e);
    res.status(500).json({ error: 'Failed to update user' });
  }
}

// Delete user (and all their projects)
async function deleteUser(req, res) {
  try {
    const { user_id } = req.params;
    const user = await User.findOne({ user_id });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await Project.deleteMany({ user_id: user.user_id });
    await user.deleteOne();

    res.clearCookie('uid');
    res.json({ success: true });
  } catch (e) {
    console.error('deleteUser error:', e);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}

// Login
async function loginUser(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    // issue cookie
    res.cookie('uid', user.user_id, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ user_id: user.user_id, email: user.email, project_ids: user.project_ids });
  } catch (e) {
    console.error('loginUser error:', e);
    res.status(500).json({ error: 'Failed to login' });
  }
}

// Logout
async function logoutUser(req, res) {
  try {
    res.clearCookie('uid');
    res.json({ success: true });
  } catch (e) {
    console.error('logoutUser error:', e);
    res.status(500).json({ error: 'Failed to logout' });
  }
}

// Me
async function me(req, res) {
  try {
    const user = await User.findOne({ user_id: req.user_id }, { _id: 0, user_id: 1, email: 1, project_ids: 1, createdAt: 1 });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e) {
    console.error('me error:', e);
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
}

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  logoutUser,
  me
};
