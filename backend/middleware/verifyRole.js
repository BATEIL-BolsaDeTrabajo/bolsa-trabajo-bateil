const jwt = require('jsonwebtoken');

function verifyRole(roles) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'No autorizado, token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Verifica si el tipo del usuario está dentro de los roles permitidos
      if (!roles.includes(decoded.tipo)) {
        return res.status(403).json({ error: 'No tienes permiso para acceder a esta ruta' });
      }

      req.user = decoded; // Puedes usar req.user en tus rutas protegidas
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
  };
}

module.exports = verifyRole;
