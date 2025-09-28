const express = require('express');
const router = express.Router();
const authFromCookie = require('../middleware/auth_from_cookie');
const {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  ensureStudioProject
} = require('../controllers/project_controller');

// All project routes require cookie "uid"
router.use(authFromCookie);

router.get('/projects', getAllProjects); // list for current user
router.get('/projects/:project_id', getProject); // detail (only if owned)
router.post('/projects', createProject); // create new
router.put('/projects/:project_id', updateProject); // update/create (upsert)
router.post('/studio/ensure-project', ensureStudioProject); // first visit helper

module.exports = router;
