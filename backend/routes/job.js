const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Job = require('../models/Job');
const { verificarToken } = require('../middleware/auth');
const verifyRole = require('../middleware/verifyRole');

// Configuración de multer para subir imagen
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Crear puesto (solo admin)
router.post('/', verificarToken, verifyRole(['admin']), upload.single('imagen'), async (req, res) => {
  try {
    const { titulo, descripcion, ubicacion, tipo, empresa } = req.body;
    let nuevoTrabajo;

    if (tipo === 'texto') {
      nuevoTrabajo = new Job({
        titulo,
        tipo,
        descripcion,
        ubicacion,
        empresa
      });
    } else if (tipo === 'imagen') {
      if (!req.file) {
        return res.status(400).json({ error: 'Se requiere una imagen para este tipo de vacante' });
      }
      nuevoTrabajo = new Job({
        titulo,
        tipo,
        empresa,
        imagen: req.file.filename
      });
    } else {
      return res.status(400).json({ error: 'Tipo de vacante inválido' });
    }

    await nuevoTrabajo.save();
    res.json({ message: 'Puesto creado correctamente', trabajo: nuevoTrabajo });
  } catch (error) {
    console.error('❌ Error al crear trabajo:', error);
    res.status(500).json({ error: 'Error al crear trabajo' });
  }
});

// Ver todos los trabajos disponibles (todos los usuarios)
router.get('/', async (req, res) => {
  try {
    const trabajos = await Job.find({ activo: true });
    res.json(trabajos);
  } catch (error) {
    console.error('❌ Error al obtener trabajos:', error);
    res.status(500).json({ error: 'Error al obtener trabajos' });
  }
});

// Eliminar puesto (solo admin)
router.delete('/:id', verificarToken, verifyRole(['admin']), async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trabajo eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar trabajo:', error);
    res.status(500).json({ error: 'Error al eliminar trabajo' });
  }
});

module.exports = router;
