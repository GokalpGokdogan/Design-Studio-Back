const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, index: true },
  password_hash: { type: String, required: true },
  project_ids: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
