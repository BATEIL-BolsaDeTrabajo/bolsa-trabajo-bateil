console.log("✅ auth.js cargado");

const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcrypt');
const path = require('path');
const jwt = require('jsonwebtoken');

// Modelo
const Usuario = require('../models/User');

// Middleware: Ruta de prueba
router.get('/test', (req, res) => {
  res.send('Ruta de auth funcionando 🚀');
});

// Configuración de almacenamiento de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Registro
router.post('/register', upload.single('cv'), async (req, res) => {
  try {
    console.log('BODY:', req.body);
    console.log('FILE:', req.file);

    const { nombre, ciudad, correo, telefono, contrasena, tipo, nivelAcademico, carrera} = req.body;

    // Validar nombre: solo letras y espacios
    const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/;
    if (!nombreRegex.test(nombre)) {
      return res.status(400).json({ error: 'El nombre solo puede contener letras y espacios' });
    }

    // Validar nivel de seguridad de la contraseña
    if (contrasena.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const seguridadRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!seguridadRegex.test(contrasena)) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos una mayúscula, una minúscula y un número'
      });
    }

    // Validar si el correo ya existe
    const usuarioExistente = await Usuario.findOne({ correo });
    if (usuarioExistente) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const nuevoUsuario = new Usuario({
      nombre,
      ciudad,
      correo,
      telefono,
      contrasena: hashedPassword,
      cv: req.file ? req.file.filename : null,
      tipo: tipo || 'usuario',
      nivelAcademico,
      carrera,
    });

    await nuevoUsuario.save();
    res.json({ message: 'Usuario registrado correctamente' });

  } catch (error) {
    console.error('❌ Error en /register:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});


// Login
router.post('/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValida) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: usuario._id, correo: usuario.correo, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      usuario: {
        nombre: usuario.nombre,
        correo: usuario.correo,
        tipo: usuario.tipo
      },
      token
    });
  } catch (error) {
    console.error('❌ Error en /login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});


const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Ruta para solicitar recuperación
router.post('/forgot-password', async (req, res) => {
  const { correo } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(404).json({ error: 'Correo no encontrado' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    usuario.resetToken = token;
    usuario.resetTokenExpires = Date.now() + 3600000; // 1 hora
    await usuario.save();

    // Configura tu servicio de correo (este es un ejemplo con Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'bateil_reset@bateil.edu.mx',
        pass: 'puec kuhb iehy dhor'
      }
    });

    const mailOptions = {
      to: correo,
      subject: 'Recuperación de contraseña',
      html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="http://localhost:3000/reset-password.html?token=${token}">Restablecer contraseña</a>`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Correo de recuperación enviado' });
  } catch (error) {
    console.error('❌ Error en forgot-password:', error);
    res.status(500).json({ error: 'Error al procesar solicitud' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, nuevaContrasena } = req.body;

  try {
    const usuario = await Usuario.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() }
    });

    if (!usuario) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
    usuario.contrasena = hashedPassword;
    usuario.resetToken = undefined;
    usuario.resetTokenExpires = undefined;
    await usuario.save();

    res.json({ message: 'Contraseña restablecida correctamente' });
  } catch (error) {
    console.error('❌ Error en reset-password:', error);
    res.status(500).json({ error: 'Error al restablecer contraseña' });
  }
});


module.exports = router;
