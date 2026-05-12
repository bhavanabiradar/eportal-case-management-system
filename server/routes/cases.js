const express = require('express');
const router = express.Router();
const { getCases, getCase, createCase, updateCase, deleteCase } = require('../controllers/caseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getCases)
  .post(authorize('admin', 'lawyer'), createCase);

router.route('/:id')
  .get(getCase)
  .put(authorize('admin', 'judge', 'lawyer'), updateCase)
  .delete(authorize('admin'), deleteCase);

module.exports = router;
