const express = require('express');
const router = express.Router();
const { createUser, updateUser, deleteUser, loginUser, logoutUser, me } = require('../controllers/user_controller');
const authFromCookie = require('../middleware/auth_from_cookie');

// Create user & set cookie
router.post('/users', createUser);

// Login user & set cookie
router.post('/login', loginUser);

// Logout user & clear cookie
router.post('/logout', logoutUser);

// Get current user info
router.get('/me', authFromCookie, me);

// Update user (email/password)
router.put('/users/:user_id', updateUser);

// Delete user (and projects)
router.delete('/users/:user_id', deleteUser);

module.exports = router;