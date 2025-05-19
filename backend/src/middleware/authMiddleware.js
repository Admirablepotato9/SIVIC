// backend/src/middleware/authMiddleware.js
// PLACEHOLDER: Middleware de autenticación y autorización


export const requireAuth = (req, res, next) => {
    console.warn('WARN: Middleware requireAuth es un placeholder. Implementar autenticación.');
    // Para desarrollo inicial, simulamos un usuario autenticado. ¡QUITAR EN PRODUCCIÓN O AL IMPLEMENTAR AUTH!
    // req.user = { id: '00000000-0000-0000-0000-000000000000', role: 'Paciente' }; // O 'Medico' para probar
    next();
};

export const checkRole = (roles) => {
    return (req, res, next) => {
        console.warn('WARN: Middleware checkRole es un placeholder. Implementar verificación de roles.');
        // if (req.user && roles.includes(req.user.role)) {
        //     next();
        // } else {
        //     res.status(403).json({ error: 'Acceso denegado. Rol no autorizado.' });
        // }
        next(); // Permitir pasar por ahora para desarrollo
    };
};