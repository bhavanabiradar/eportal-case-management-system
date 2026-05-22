const Case = require('../models/Case');

// @desc  Get all cases (filtered by role)
// @route GET /api/cases
exports.getCases = async (req, res) => {
  try {
    let query = {};
    const { status, caseType, search, page = 1, limit = 10 } = req.query;

    // Filter by role
    if (req.user.role === 'lawyer') {
      query.$or = [{ petitionerLawyer: req.user._id }, { respondentLawyer: req.user._id }];
    } else if (req.user.role === 'litigant') {
      query.$or = [
        { filedBy: req.user._id },
        { petitionerUser: req.user._id },
        { respondentUser: req.user._id },
      ];
    } else if (req.user.role === 'judge') {
      query.assignedJudge = req.user._id;
    }

    if (status) query.status = status;
    if (caseType) query.caseType = caseType;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { caseNumber: { $regex: search, $options: 'i' } },
      { 'petitioner.name': { $regex: search, $options: 'i' } },
    ];

    const total = await Case.countDocuments(query);
    const cases = await Case.find(query)
      .populate('filedBy', 'name email')
      .populate('assignedJudge', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), cases });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get single case
// @route GET /api/cases/:id
exports.getCase = async (req, res) => {
  try {
    const c = await Case.findById(req.params.id)
      .populate('filedBy', 'name email phone')
      .populate('assignedJudge', 'name email')
      .populate('petitionerLawyer', 'name email')
      .populate('respondentLawyer', 'name email')
      .populate('documents');

    if (!c) return res.status(404).json({ success: false, message: 'Case not found' });
    res.json({ success: true, case: c });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Register new case
// @route POST /api/cases
exports.createCase = async (req, res) => {
  try {
    const caseData = { ...req.body, filedBy: req.user._id };
    const newCase = await Case.create(caseData);
    res.status(201).json({ success: true, case: newCase });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update case
// @route PUT /api/cases/:id
exports.updateCase = async (req, res) => {
  try {
    const updated = await Case.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ success: false, message: 'Case not found' });
    res.json({ success: true, case: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Delete case (admin only)
// @route DELETE /api/cases/:id
exports.deleteCase = async (req, res) => {
  try {
    await Case.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Case deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
