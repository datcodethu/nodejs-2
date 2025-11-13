const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { validateToken } = require('../middlewares/authMiddleware');
const authRoles = require('../middlewares/authRoles');

router.use(validateToken, authRoles('admin'));
// === FILE MANAGEMENT ===
router.get('/files', adminController.getAllFiles);
router.delete('/files/:id', adminController.deleteFile);
router.get('/storage/stats', adminController.getStorageStats);

// === DASHBOARD ===
router.get('/dashboard', adminController.getDashboardSummary);

module.exports = router;
