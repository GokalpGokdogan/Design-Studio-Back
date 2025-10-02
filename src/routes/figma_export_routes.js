const express = require('express');
const {exportToFigma, getExportData} = require('../controllers/figma_export_controller');

const router = express.Router();

router.post('/export', exportToFigma);
router.get('/export/:exportId', getExportData);

module.exports = router;