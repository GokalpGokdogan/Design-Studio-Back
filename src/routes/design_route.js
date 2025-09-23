const express = require('express');
const { generateDesign, exportFigmaTokens } = require('../controllers/design_controller');

const router = express.Router();

router.post('/generate-design', generateDesign);
router.post('/export-figma-tokens', exportFigmaTokens);

module.exports = router;
