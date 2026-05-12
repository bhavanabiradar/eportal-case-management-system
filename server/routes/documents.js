const express = require('express');
const router = express.Router();
const { uploadDocument, getCaseDocuments, verifyDocument, upload } = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/upload', upload.single('document'), uploadDocument);
router.get('/:caseId', getCaseDocuments);
router.put('/:id/verify', authorize('admin', 'judge'), verifyDocument);

module.exports = router;
