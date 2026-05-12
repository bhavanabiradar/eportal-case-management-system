const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema(
  {
    caseNumber: { type: String, unique: true },
    title: { type: String, required: true },
    caseType: {
      type: String,
      required: true,
      enum: ['Civil', 'Criminal', 'Family', 'Labour', 'Revenue', 'Constitutional', 'Other'],
    },
    description: { type: String },
    status: {
      type: String,
      enum: ['Registered', 'Under Review', 'Hearing Scheduled', 'In Progress', 'Disposed', 'Closed'],
      default: 'Registered',
    },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
    filedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedJudge: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    petitioner: {
      name: { type: String, required: true },
      contact: { type: String },
      address: { type: String },
    },
    respondent: {
      name: { type: String, required: true },
      contact: { type: String },
      address: { type: String },
    },
    petitionerLawyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    respondentLawyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
    nextHearingDate: { type: Date },
    remarks: { type: String },
  },
  { timestamps: true }
);

// Auto-generate case number before saving
CaseSchema.pre('save', async function (next) {
  if (this.isNew) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Case').countDocuments();
    this.caseNumber = `CASE-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Case', CaseSchema);
