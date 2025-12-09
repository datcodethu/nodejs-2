const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload'); // Đảm bảo bạn có file này
const crypto = require('crypto');
const File = require('../models/fileModel'); // Cần cho tính năng Share (nếu chưa chuyển vào controller)

// --- QUAN TRỌNG: Import Controller đúng tên file ---
// Giả sử file của bạn là fileController.js (không có s)
const fileController = require('../controllers/filesController'); 

// =========================================================
// CÁC ROUTE CƠ BẢN (Sử dụng Controller)
// =========================================================

// 1. Tạo file mới (Data text)
router.post('/add', fileController.createFile);

// 2. Upload file (Data file + text)
router.post('/upload', upload.single('file'), fileController.uploadFile);

// 3. Lấy danh sách file
router.get('/', fileController.getFiles);

// 4. Lấy chi tiết file theo ID
router.get('/:id', fileController.getFileById);

// 5. Cập nhật file
router.put('/:id', fileController.updateFile);

// 6. Xóa file
router.delete('/:id', fileController.deleteFile);

// 7. Đổi tên file
router.put('/rename/:id', fileController.renameFile);

// 8. Xem/Preview file
router.get('/view/:id', fileController.viewFile);

// =========================================================
// TÍNH NĂNG SHARE (Giữ lại logic cũ vì chưa có trong Controller)
// =========================================================

// Tạo link chia sẻ
router.post('/share/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);
    if (!file) return res.status(404).json({ success: false, message: 'Không tìm thấy file' });

    const token = crypto.randomBytes(16).toString('hex');
    file.shareLink = token;
    file.isPublic = true;
    await file.save();

    res.json({ success: true, shareUrl: `http://localhost:3000/api/v1/files/share/token/${token}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mở file bằng token
router.get('/share/token/:token', async (req, res) => {
  try {
    const file = await File.findOne({ shareLink: req.params.token });
    if (!file) return res.status(404).json({ success: false, message: 'Không tìm thấy file' });
    if (!file.isPublic) return res.status(403).json({ success: false, message: 'File này không công khai' });
    
    // Trả về thông tin file
    res.json({ success: true, file });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi tải file' });
  }
});

module.exports = router;