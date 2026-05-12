const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema(
  {
    case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    documentType: {
      type: String,
      enum: ['Petition', 'Evidence', 'Affidavit', 'Order', 'Notice', 'Reply', 'Other'],
      default: 'Other',
    },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number },
    mimeType: { type: String },
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', DocumentSchema);
