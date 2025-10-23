const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authRolers = require('../middlewares/authRoles');
const { validateToken } = require('../middlewares/authMiddleware');

router.get('/',  userController.getAllUsers);
router.get('/:id', validateToken, authRolers("admin", "user"), userController.getUserById);
router.post('/',  userController.createUser);
router.put('/:id', validateToken, authRolers("admin", "user"), userController.updateUser);
router.delete('/:id', validateToken, authRolers("admin"), userController.deleteUser);

module.exports = router;