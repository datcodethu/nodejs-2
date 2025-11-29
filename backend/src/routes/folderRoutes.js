const express = require('express');
const router = express.Router();
// Bỏ File, Folder, Workspace, chỉ cần import Controller
const folderController = require('../controllers/folderController'); 

// @route GET /api/v1/folders - Lấy danh sách thư mục
router.get('/', folderController.getFolders);

// @route GET /api/v1/folders/:id - Lấy chi tiết thư mục
router.get("/:id", folderController.getFolderById);

// @route GET /api/v1/folders/:id/files - Lấy danh sách file trong folder
router.get("/:id/files", folderController.getFilesInFolder);

// @route POST /api/v1/folders - Tạo folder mới
// LƯU Ý: Tuyến đường cũ bị trùng: router.post("/", async (req, res) => {...}) VÀ router.post('/', folderController.createFolder);
// Chúng ta chỉ giữ lại một cái và dùng Controller đã tách.
router.post("/", folderController.createFolder); 

module.exports = router;