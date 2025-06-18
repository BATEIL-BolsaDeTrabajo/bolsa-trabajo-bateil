const express = require('express');
const router = express.Router();
const Usuario = require('../models/User');
const verifyRole = require('../middleware/verifyRole');
const verificarToken = require('../middleware/auth').verificarToken;

// Obtener todos los usuarios
router.get('/usuarios', verificarToken, verifyRole(['admin']), async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-contrasena');
    res.json(usuarios);
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Eliminar usuario por ID
router.delete('/usuarios/:id', verificarToken, verifyRole(['admin']), async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;
