const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  project_id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true, index: true },
  title: { type: String, default: 'Untitled Project' },
  prompt: { type: String, default: '' },
  designData: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
