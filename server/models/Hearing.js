const mongoose = require('mongoose');

const HearingSchema = new mongoose.Schema(
  {
    case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
    hearingDate: { type: Date, required: true },
    hearingTime: { type: String, required: true }, // e.g. "10:30 AM"
    courtRoom: { type: String },
    judge: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    purpose: { type: String, required: true }, // e.g. "Evidence Presentation"
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Adjourned', 'Cancelled'],
      default: 'Scheduled',
    },
    outcome: { type: String },     // filled after hearing
    nextDate: { type: Date },      // if adjourned
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    notes: { type: String },
    notificationSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hearing', HearingSchema);
