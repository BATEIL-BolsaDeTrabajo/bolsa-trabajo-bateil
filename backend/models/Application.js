// backend/models/Application.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trabajo: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true }
}, {
  timestamps: true // crea createdAt y updatedAt automáticamente
});

module.exports = mongoose.model('Application', applicationSchema);
