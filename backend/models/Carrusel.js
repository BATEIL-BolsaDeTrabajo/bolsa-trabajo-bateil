const mongoose = require('mongoose');

const carruselSchema = new mongoose.Schema({
  imagen: { type: String, required: true },
  titulo: { type: String },
  activo: { type: Boolean, default: true },
  creadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Carrusel', carruselSchema);
