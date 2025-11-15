const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileControllers');

router.get('/', fileController.getAllFiles);
router.get('/:id', fileController.getFileById);
router.post('/', fileController.createFile);
router.post('/share/:id', fileController.createShareLink);
router.get('/share/token/:token', fileController.getFileByToken); 
router.get('/share/open/:token', fileController.openFileByToken);
router.put('/:id', fileController.updateFile);

module.exports = router;
