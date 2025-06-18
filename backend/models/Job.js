const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  tipo: { type: String, enum: ['texto', 'imagen'], required: true },
  descripcion: { type: String },
  ubicacion: { type: String },
  imagen: { type: String },
  empresa: { type: String },
  fechaPublicacion: { type: Date, default: Date.now },
  activo: { type: Boolean, default: true },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Job', jobSchema);
