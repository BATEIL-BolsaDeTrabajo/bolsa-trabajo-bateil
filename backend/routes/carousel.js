const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Carrusel = require('../models/Carrusel');

// Configuración de subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const nombreUnico = Date.now() + '-' + file.originalname;
    cb(null, nombreUnico);
  }
});
const upload = multer({ storage });

// Ruta pública: obtener imágenes activas para index.html
router.get('/', async (req, res) => {
  try {
    const imagenes = await Carrusel.find({ activo: true }).sort({ creadoEn: -1 });
    res.json(imagenes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener carrusel' });
  }
});

// Ruta admin: subir nueva imagen
router.post('/admin', upload.single('imagen'), async (req, res) => {
  try {
    const nueva = new Carrusel({
      imagen: req.file.filename,
      titulo: req.body.titulo || ''
    });
    await nueva.save();
    res.status(201).json(nueva);
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar imagen' });
  }
});

// Ruta admin: eliminar imagen
router.delete('/admin/:id', async (req, res) => {
  try {
    await Carrusel.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Imagen eliminada del carrusel' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar imagen' });
  }
});

module.exports = router;
