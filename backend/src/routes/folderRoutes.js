const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');

router.get('/', folderController.getAllFolders);
router.get('/:id', folderController.getFolderById);
router.get('/:id/files', folderController.getFilesInFolder);
router.post('/', folderController.createFolder);

module.exports = router;
