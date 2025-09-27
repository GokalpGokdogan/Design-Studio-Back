const express = require('express');
const router = express.Router();
const {exportToFigma, getExportData} = require('../controllers/figma_export_controller');

// Export design to Figma format
router.post('/export', exportToFigma);

// Get export data by ID (used by Figma plugin)
router.get('/export/:exportId', getExportData);

module.exports = router;