const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  ciudad: { type: String, required: true },
  telefono: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
  cv: { type: String },
  tipo: { type: String, enum: ['usuario', 'admin'], default: 'usuario' },
  nivelAcademico: {
    type: String,
    enum: ['Técnico', 'Técnico Superior', 'Licenciatura', 'Maestría', 'Doctorado'],
    required: true
  },
  carrera: { type: String, required: true },
  resetToken: String,
  resetTokenExpires: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
