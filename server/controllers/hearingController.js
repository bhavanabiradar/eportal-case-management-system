const Hearing = require('../models/Hearing');
const Case = require('../models/Case');
const nodemailer = require('nodemailer');

const sendHearingNotification = async (hearing) => {
  try {
    if (!process.env.EMAIL_USER) return;
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: `"e-Portal" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // In production: send to actual case parties
      subject: `Hearing Scheduled — ${hearing.purpose}`,
      html: `<h2>Hearing Notification</h2>
             <p><strong>Date:</strong> ${new Date(hearing.hearingDate).toDateString()}</p>
             <p><strong>Time:</strong> ${hearing.hearingTime}</p>
             <p><strong>Court Room:</strong> ${hearing.courtRoom || 'TBD'}</p>
             <p><strong>Purpose:</strong> ${hearing.purpose}</p>`,
    });
  } catch (e) {
    console.error('Email notification error:', e.message);
  }
};

// @desc  Get all hearings
// @route GET /api/hearings
exports.getHearings = async (req, res) => {
  try {
    const { caseId, status, date } = req.query;
    let query = {};
    if (caseId) query.case = caseId;
    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      query.hearingDate = { $gte: d, $lt: new Date(d.setDate(d.getDate() + 1)) };
    }

    const hearings = await Hearing.find(query)
      .populate('case', 'caseNumber title caseType')
      .populate('judge', 'name')
      .sort({ hearingDate: 1 });

    res.json({ success: true, hearings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Schedule a hearing
// @route POST /api/hearings
exports.createHearing = async (req, res) => {
  try {
    const { case: caseId, hearingDate, hearingTime, courtRoom, purpose, judge } = req.body;

    // Check for scheduling conflict in same court room
    if (courtRoom) {
      const conflict = await Hearing.findOne({
        courtRoom,
        hearingDate: new Date(hearingDate),
        hearingTime,
        status: 'Scheduled',
      });
      if (conflict)
        return res.status(400).json({
          success: false,
          message: `Court room ${courtRoom} is already booked at this time`,
        });
    }

    const hearing = await Hearing.create({ case: caseId, hearingDate, hearingTime, courtRoom, purpose, judge });

    // Update case with next hearing date
    await Case.findByIdAndUpdate(caseId, {
      nextHearingDate: hearingDate,
      status: 'Hearing Scheduled',
    });

    await sendHearingNotification(hearing);

    res.status(201).json({ success: true, hearing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update hearing outcome
// @route PUT /api/hearings/:id
exports.updateHearing = async (req, res) => {
  try {
    const hearing = await Hearing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hearing) return res.status(404).json({ success: false, message: 'Hearing not found' });

    // If adjourned, update case next date
    if (req.body.status === 'Adjourned' && req.body.nextDate) {
      await Case.findByIdAndUpdate(hearing.case, { nextHearingDate: req.body.nextDate });
    }

    res.json({ success: true, hearing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get upcoming hearings (next 7 days)
// @route GET /api/hearings/upcoming
exports.getUpcomingHearings = async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const hearings = await Hearing.find({
      hearingDate: { $gte: today, $lte: nextWeek },
      status: 'Scheduled',
    })
      .populate('case', 'caseNumber title')
      .populate('judge', 'name')
      .sort({ hearingDate: 1 });

    res.json({ success: true, hearings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
