const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authRoles = require('../middlewares/authRoles');
const { validateToken } = require('../middlewares/authMiddleware');

// ==============================
// PUBLIC ROUTES
// ==============================

// Create user (register)
router.post('/', userController.createUser);


// ==============================
// PROTECTED ROUTES
// ==============================

// Require login for all routes below
router.use(validateToken);

// Admin: get all users
router.get('/', authRoles("admin"), userController.getAllUsers);

// Get user by ID
router.get('/:id', authRoles("admin", "user"), userController.getUserById);

// Update user
router.put('/:id', authRoles("admin", "user"), userController.updateUser);

// Delete user (admin only)
router.delete('/:id', authRoles("admin"), userController.deleteUser);

module.exports = router;
