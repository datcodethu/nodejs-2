const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
const File = require('../models/fileModel'); 
const Workspace = require('../models/Workspace'); 

// ====================
// Lấy tất cả file
// ====================
router.get('/', async (req, res) => {
  try {
    const files = await File.find({});
    res.status(200).json(files);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy file" });
  }
});

// ====================
// Lấy file theo _id
// ====================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID file không hợp lệ' });
    }
    const file = await File.findById(id);
    if (!file) return res.status(404).json({ message: "Không tìm thấy file" });
    res.json(file);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi lấy file" });
  }
});

// ====================
// Tạo file mới
// ====================
router.post('/', async (req, res) => {
  try {
    const { name, workspaceId, fileType, size, owner, url } = req.body;
    if (!name || !workspaceId || !fileType || !size || !owner || !url) {
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });
    }

    const file = await File.create({ name, workspace: workspaceId, fileType, size, owner, url });

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: "Workspace không tồn tại" });

    workspace.files = workspace.files || [];
    workspace.files.push(file._id);
    await workspace.save();

    res.status(201).json(file);
  } catch (err) {
    console.error("Lỗi tạo file:", err);
    res.status(500).json({ message: "Lỗi tạo file" });
  }
});

// ====================
// Tạo link chia sẻ
// POST /api/v1/files/share/:id
// ====================
router.post('/share/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID file không hợp lệ' });
    }

    const file = await File.findById(id);
    if (!file) return res.status(404).json({ success: false, message: 'Không tìm thấy file' });

    const token = crypto.randomBytes(16).toString('hex');
    file.shareLink = token;
    file.isPublic = true;

    await file.save();

    res.json({ success: true, shareUrl: `http://localhost:5173/share/${token}` });
  } catch (err) {
    console.error('Lỗi khi tạo link chia sẻ:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ====================
// Mở file theo token chia sẻ
// GET /api/v1/files/share/token/:token
// ====================
router.get('/share/token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const file = await File.findOne({ shareLink: token });

    if (!file) return res.status(404).json({ success: false, message: 'Không tìm thấy file' });
    if (!file.isPublic) return res.status(403).json({ success: false, message: 'File này không công khai' });

    res.json({ success: true, file });
  } catch (err) {
    console.error('Lỗi khi mở file chia sẻ:', err);
    res.status(500).json({ success: false, message: 'Lỗi khi tải file' });
  }
});


// GET file bằng token
router.get('/share/token/:token', async (req, res) => {
  try {
    const file = await File.findOne({ shareLink: req.params.token });
    if (!file) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy file' });
    }

    if (!file.isPublic) {
      return res.status(403).json({ success: false, message: 'File này không công khai' });
    }

    res.json({ success: true, file });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi khi tải file' });
  }
});


// ====================
// Cập nhật file theo id
// ====================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID file không hợp lệ' });
    }

    const file = await File.findByIdAndUpdate(id, req.body, { new: true });
    if (!file) return res.status(404).json({ message: "Không tìm thấy file" });

    res.json(file);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi cập nhật file" });
  }
});

module.exports = router;
