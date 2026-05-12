const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Get all users (admin only)
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get judges (for assigning to cases)
router.get('/judges', async (req, res) => {
  try {
    const judges = await User.find({ role: 'judge', isActive: true }).select('name email');
    res.json({ success: true, judges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get lawyers
router.get('/lawyers', async (req, res) => {
  try {
    const lawyers = await User.find({ role: 'lawyer', isActive: true }).select('name email barRegistrationNo');
    res.json({ success: true, lawyers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Toggle user active status (admin)
router.put('/:id/toggle', authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
