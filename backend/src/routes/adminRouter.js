const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { validateToken } = require('../middlewares/authMiddleware');
const authRoles = require('../middlewares/authRoles');
// ql file
router.get('/files', validateToken, authRoles('admin'), adminController.getAllFiles);
router.delete('/files/:id', validateToken, authRoles('admin'), adminController.deleteFileById);
router.get('files/status', validateToken, authRoles('admin'), adminController.getFileStatusCounts);

module.exports = router;