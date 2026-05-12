const express = require('express');
const router = express.Router();
const { getHearings, createHearing, updateHearing, getUpcomingHearings } = require('../controllers/hearingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/upcoming', getUpcomingHearings);

router.route('/')
  .get(getHearings)
  .post(authorize('admin', 'judge'), createHearing);

router.route('/:id')
  .put(authorize('admin', 'judge'), updateHearing);

module.exports = router;
