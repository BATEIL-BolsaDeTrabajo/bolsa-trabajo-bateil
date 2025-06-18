// backend/routes/application.js
const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const verifyToken = require('../middleware/verifyRole'); // Para verificar login y tipo

// Postularse a un trabajo (usuario autenticado)
router.post('/:jobId', verifyToken(['usuario']), async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.user.id;

    // Verificar si ya se postuló
    const existe = await Application.findOne({ usuario: userId, trabajo: jobId });
    if (existe) {
      return res.status(400).json({ error: 'Ya te postulaste a este trabajo' });
    }

    const postulation = new Application({ usuario: userId, trabajo: jobId });
    await postulation.save();

    res.json({ message: 'Postulación registrada correctamente' });
  } catch (error) {
    console.error('❌ Error al postularse:', error);
    res.status(500).json({ error: 'Error al postularse' });
  }
});

// Obtener todas las postulaciones (solo admin)
router.get('/', verifyToken(['admin']), async (req, res) => {
  try {
    const postulaciones = await Application.find()
      .populate('usuario', 'nombre correo cv ciudad')
      .populate('trabajo', 'titulo descripcion empresa');

    res.json(postulaciones);
  } catch (error) {
    console.error('❌ Error al obtener postulaciones:', error);
    res.status(500).json({ error: 'Error al obtener postulaciones' });
  }
});

// Eliminar una postulación (solo admin)
router.delete('/:id', verifyToken(['admin']), async (req, res) => {
  try {
    const id = req.params.id;
    await Application.findByIdAndDelete(id);
    res.json({ message: 'Postulación eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar postulación:', error);
    res.status(500).json({ error: 'Error al eliminar postulación' });
  }
});

module.exports = router;
