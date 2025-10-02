const express = require('express');
const { createUser, updateUser, deleteUser, loginUser, logoutUser, me } = require('../controllers/user_controller');

const router = express.Router();
const authFromCookie = require('../middleware/auth_from_cookie');

router.post('/users', createUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', authFromCookie, me);
router.put('/users/:user_id', updateUser);
router.delete('/users/:user_id', deleteUser);

module.exports = router;