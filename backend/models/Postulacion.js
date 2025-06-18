const mongoose = require('mongoose');

const postulacionSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  puesto: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Postulacion', postulacionSchema);
