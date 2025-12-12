const crypto = require('crypto');
const mongoose = require('mongoose');
const File = require('../models/fileModel'); // Đảm bảo tên file model đúng
const Workspace = require('../models/Workspace');

// ====================
// 1. UPLOAD FILE (Hàm mới - Xử lý file từ Multer)
// ====================
exports.uploadFile = async (req, res) => {
  try {
    // req.file được Multer tạo ra khi upload thành công
    const uploadedFile = req.file; 
    const { ownerId, workspaceId, folderId } = req.body;

    // Kiểm tra xem có file không
    if (!uploadedFile) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn file để upload" });
    }

    // Kiểm tra ownerId (bắt buộc)
    if (!ownerId) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin người dùng (ownerId)" });
    }

    // Tạo document File trong MongoDB
    const newFile = await File.create({
      name: uploadedFile.originalname,
      size: uploadedFile.size,
      fileType: uploadedFile.mimetype,
      owner: ownerId,
      url: uploadedFile.path, // Đường dẫn file (ví dụ: uploads/hinhanh.png)
      workspace: workspaceId || null,
      folder: folderId || null,
      createdAt: new Date()
    });

    // Nếu file thuộc workspace, cập nhật workspace đó
    if (workspaceId) {
      await Workspace.findByIdAndUpdate(workspaceId, {
        $push: { files: newFile._id }
      });
    }

    res.status(201).json({
      success: true,
      message: "Upload thành công",
      file: newFile
    });
  } catch (error) {
    console.error("Lỗi upload:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi upload file" });
  }
};

// ====================
// 2. Lấy tất cả file
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
// 3. Lấy file theo ID
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
// 4. Tạo file mới (Dành cho tạo file text/doc thủ công)
// ====================
exports.createFile = async (req, res) => {
  try {
    const { name, workspaceId, fileType, size, owner, url } = req.body;
    
    if (!name || !fileType || !size || !owner) {
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });
    }

    const file = await File.create({
      name, workspace: workspaceId || null, fileType, size, owner, url: url || ''
    });

    if (workspaceId) {
      const workspace = await Workspace.findById(workspaceId);
      if (workspace) {
        workspace.files.push(file._id);
        await workspace.save();
      }
    }

    res.status(201).json(file);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi tạo file" });
  }
};

// ====================
// 5. Tạo link chia sẻ
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
// 6. Mở file theo token (Download/Xem)
// ====================
exports.openFileByToken = async (req, res) => {
  try {
    const file = await File.findOne({ shareLink: req.params.token });
    if (!file) return res.status(404).send('Không tìm thấy file');
    if (!file.isPublic) return res.status(403).send('File này không công khai');

    // Chú ý: __dirname trỏ đến thư mục controllers. Cần lùi lại để ra root nơi chứa thư mục uploads
    res.sendFile(file.url, { root: __dirname + '/../../' });
  } catch (err) {
    res.status(500).send('Lỗi khi tải file');
  }
};

// ====================
// 7. Lấy thông tin JSON file bằng token
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
// 8. Cập nhật file
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