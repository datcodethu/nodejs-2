const crypto = require('crypto');
const mongoose = require('mongoose');
const File = require('../models/fileModel');
const Workspace = require('../models/Workspace');

// ====================
// Lấy tất cả file
// ====================
exports.getAllFiles = async (req, res) => {
  try {
    const files = await File.find({});
    res.status(200).json(files);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy file" });
  }
};

// ====================
// Lấy file theo ID
// ====================
exports.getFileById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID file không hợp lệ' });
    }
    const file = await File.findById(id);
    if (!file) return res.status(404).json({ message: "Không tìm thấy file" });

    res.json(file);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy file" });
  }
};

// ====================
// Tạo file mới
// ====================
exports.createFile = async (req, res) => {
  try {
    const { name, workspaceId, fileType, size, owner, url } = req.body;
    if (!name || !workspaceId || !fileType || !size || !owner || !url) {
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });
    }

    const file = await File.create({
      name, workspace: workspaceId, fileType, size, owner, url
    });

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace không tồn tại" });
    }

    workspace.files.push(file._id);
    await workspace.save();

    res.status(201).json(file);
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo file" });
  }
};

// ====================
// Tạo link chia sẻ
// ====================
exports.createShareLink = async (req, res) => {
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

    res.json({
      success: true,
      shareUrl: `http://localhost:3000/api/v1/files/share/token/${token}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ====================
// Mở file theo token -> trả file
// ====================
exports.openFileByToken = async (req, res) => {
  try {
    const file = await File.findOne({ shareLink: req.params.token });
    if (!file) return res.status(404).send('Không tìm thấy file');
    if (!file.isPublic) return res.status(403).send('File này không công khai');

    res.sendFile(file.url, { root: __dirname + '/../' });
  } catch (err) {
    res.status(500).send('Lỗi khi tải file');
  }
};

// ====================
// Lấy thông tin file bằng token
// ====================
exports.getFileByToken = async (req, res) => {
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
    res.status(500).json({ success: false, message: 'Lỗi khi tải file' });
  }
};

// ====================
// Cập nhật file
// ====================
exports.updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID file không hợp lệ' });
    }

    const file = await File.findByIdAndUpdate(id, req.body, { new: true });
    if (!file) return res.status(404).json({ message: "Không tìm thấy file" });

    res.json(file);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật file" });
  }
};
























exports.createFile = async (req, res) => {
  try {
    const { name, workspaceId, fileType, size, owner, url } = req.body;

    console.log("Request body:", req.body); // log để debug

    // validate bắt buộc
    if (!name || !fileType || !size || !owner || !url) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    // tạo file
    const newFile = await File.create({
      name,
      fileType,
      size,
      owner,
      url,
      workspace: workspaceId || null
    });

    // thêm vào workspace nếu có
    if (workspaceId) {
      const updated = await Workspace.findByIdAndUpdate(
        workspaceId,
        { $push: { files: newFile._id } },
        { new: true }
      );
      console.log("Workspace updated:", updated);
    }

    res.status(201).json(newFile);
  } catch (err) {
    console.error("Lỗi tạo file:", err); // log lỗi ra console
    res.status(500).json({ message: "Lỗi tạo file", error: err.message });
  }
};



