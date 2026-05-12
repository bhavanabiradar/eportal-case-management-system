const Case = require('../models/Case');
const Hearing = require('../models/Hearing');
const User = require('../models/User');
const Document = require('../models/Document');

// @desc  Get dashboard statistics
// @route GET /api/dashboard/stats
exports.getStats = async (req, res) => {
  try {
    const [totalCases, totalHearings, totalUsers, totalDocuments] = await Promise.all([
      Case.countDocuments(),
      Hearing.countDocuments(),
      User.countDocuments(),
      Document.countDocuments(),
    ]);

    const casesByStatus = await Case.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const casesByType = await Case.aggregate([
      { $group: { _id: '$caseType', count: { $sum: 1 } } },
    ]);

    const today = new Date();
    const todayHearings = await Hearing.countDocuments({
      hearingDate: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999)),
      },
      status: 'Scheduled',
    });

    const recentCases = await Case.find()
      .populate('filedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const upcomingHearings = await Hearing.find({ status: 'Scheduled', hearingDate: { $gte: new Date() } })
      .populate('case', 'caseNumber title')
      .sort({ hearingDate: 1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalCases,
        totalHearings,
        totalUsers,
        totalDocuments,
        todayHearings,
        casesByStatus,
        casesByType,
        recentCases,
        upcomingHearings,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
