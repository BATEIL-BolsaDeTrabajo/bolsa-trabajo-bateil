// backend/routes/user.js
const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const Usuario = require('../models/User');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Ver perfil del usuario autenticado
router.get('/profile', verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('-contrasena');
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    console.error('❌ Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

//---------------------------------------------------------------------------------------
// Actualizar perfil del usuario autenticado

// Ruta: PUT /api/user/profile
router.put('/profile', verificarToken, upload.single('cv'), async (req, res) => {

  try {
    const { nombre, ciudad, telefono, contrasena, nivelAcademico } = req.body;
    const userId = req.usuario.id;

    const datosActualizados = {
      nombre,
      ciudad,
      telefono,
      nivelAcademico,
    };

    // Si se subió un nuevo CV, lo guardamos
    if (req.file) {
      datosActualizados.cv = req.file.filename;
    }

    // Si quiere cambiar la contraseña
    if (contrasena) {
      const hashedPassword = await bcrypt.hash(contrasena, 10);
      datosActualizados.contrasena = hashedPassword;
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      userId,
      { $set: datosActualizados },
      { new: true }
    );

    res.json({
      message: 'Perfil actualizado correctamente',
      usuario: {
        nombre: usuarioActualizado.nombre,
        //direccion: usuarioActualizado.direccion,
        ciudad: usuarioActualizado.ciudad,
        telefono: usuarioActualizado.telefono,
        correo: usuarioActualizado.correo,
        nivelAcademico: usuarioActualizado.nivelAcademico,
        tipo: usuarioActualizado.tipo,
        cv: usuarioActualizado.cv,
      }
    });
  } catch (error) {
    console.error('❌ Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

//--------------------------------------------------------------------------------------------------------------

// Eliminar cuenta del usuario autenticado
router.delete('/delete', verificarToken, async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.usuario.id);
    res.json({ message: 'Cuenta eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar cuenta:', error);
    res.status(500).json({ error: 'Error al eliminar cuenta' });
  }
});

module.exports = router;

