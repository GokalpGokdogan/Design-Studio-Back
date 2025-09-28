const mongoose = require('mongoose');

const figmaExportSchema = new mongoose.Schema({
  exportId: {
    type: String,
    required: true,
    unique: true
  },
  designData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  projectId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'exported', 'failed'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  }
}, {
  timestamps: true
});

figmaExportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('FigmaExport', figmaExportSchema);