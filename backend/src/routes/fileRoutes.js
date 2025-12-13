const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileControllers');
const upload = require('../middlewares/upload')

router.post('/upload', upload.single('file'), fileController.uploadFile);
router.delete('/:id', fileController.deleteFile);
router.put('/rename/:id', fileController.renameFile);

router.get('/', fileController.getAllFiles);
router.get('/:id', fileController.getFileById);
router.post('/', fileController.createFile);
router.post('/share/:id', fileController.createShareLink);
router.get('/share/token/:token', fileController.getFileByToken); 
router.get('/share/open/:token', fileController.openFileByToken);
router.put('/:id', fileController.updateFile);


module.exports = router;
