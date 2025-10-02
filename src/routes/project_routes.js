const express = require('express');
const {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  ensureStudioProject
} = require('../controllers/project_controller');

const router = express.Router();
const authFromCookie = require('../middleware/auth_from_cookie');

router.use(authFromCookie);

router.get('/projects', getAllProjects);
router.get('/projects/:project_id', getProject);
router.post('/projects', createProject);
router.put('/projects/:project_id', updateProject);
router.post('/studio/ensure-project', ensureStudioProject);

module.exports = router;
