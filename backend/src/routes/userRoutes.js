const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authRoles = require('../middlewares/authRoles');
const { validateToken } = require('../middlewares/authMiddleware');

router.get('/',  userController.getAllUsers);
router.get('/:id', validateToken, authRoles("admin", "user"), userController.getUserById);
router.post('/',  userController.createUser);
router.put('/:id', validateToken, authRoles("admin", "user"), userController.updateUser);
router.delete('/:id', validateToken, authRoles("admin"), userController.deleteUser);

module.exports = router;