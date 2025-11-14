const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const adminFileController = require('../controllers/adminController');
const { validateToken } = require('../middlewares/authMiddleware');
const authRoles = require('../middlewares/authRoles');


// ==============================
// 1️⃣ PUBLIC ROUTES (Không cần login)
// ==============================

router.post('/users', userController.createUser); // Register


// ==============================
// 2️⃣ USER ROUTES (Yêu cầu login)
// ==============================

// Middleware: tất cả route từ đây trở xuống phải login
router.use(validateToken);

// Lấy danh sách user (admin)
router.get('/users', authRoles("admin"), userController.getAllUsers);

// Lấy user theo ID (user chỉ xem chính mình, admin xem được tất cả)
router.get('/users/:id', authRoles("admin", "user"), userController.getUserById);

// Update user
router.put('/users/:id', authRoles("admin", "user"), userController.updateUser);

// Delete user (admin only)
router.delete('/users/:id', authRoles("admin"), userController.deleteUser);


// ==============================
// 3️⃣ ADMIN ROUTES (Admin Only)
// ==============================

// Tất cả route bên dưới bắt buộc: login + admin
router.use('/admin', authRoles("admin"));

router.get('/admin/files', adminFileController.getAllFiles);

router.delete('/admin/files/:id', adminFileController.deleteFileById);

router.get('/admin/files/status', adminFileController.getFileStatusCounts);


module.exports = router;
