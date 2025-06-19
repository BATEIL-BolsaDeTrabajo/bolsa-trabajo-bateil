// Activando CORS global para pruebas
// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

dotenv.config(); // Lee variables del archivo .env

const app = express();
app.use(cors());
//permitir solicitudes desde tu dominio Render
/*app.use(cors({
  origin: ['https://bolsa-trabajo-bateil.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));*/



app.use(express.json());
// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Conectado a MongoDB');
}).catch(err => {
  console.error('❌ Error al conectar a MongoDB:', err);
});

// Servir archivos PDF desde la carpeta /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const jobRoutes = require('./routes/job');
const applicationRoutes = require('./routes/application');
const carruselRoutes = require('./routes/carousel');


app.use('/api', authRoutes);          // Rutas de login y registro
app.use('/api/admin', adminRoutes);   // Rutas protegidas para admin
app.use('/api/user', userRoutes);     // Rutas protegidas para usuarios normales
app.use('/api/jobs', jobRoutes);      // Rutas de trabajos
app.use('/api/applications', applicationRoutes);
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/api/carrusel', carruselRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor Bolsa de Trabajo funcionando 🚀');
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
