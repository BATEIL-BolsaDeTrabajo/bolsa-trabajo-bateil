// backend/routes/user.js
const express = require('express');
const router = express.Router();
const { verificarToken, verifyRole } = require('../middleware/auth');

// Ruta protegida solo para usuarios normales
router.get('/perfil', verificarToken, verifyRole(['usuario']), (req, res) => {
  res.json({
    message: `Hola ${req.user.correo}, este es tu perfil de usuario`,
    tipo: req.user.tipo
  });
});

module.exports = router;
