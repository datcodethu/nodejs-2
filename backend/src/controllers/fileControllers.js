const crypto = require('crypto');
const mongoose = require('mongoose');
const File = require('../models/fileModel'); // Đảm bảo tên file model đúng
const Workspace = require('../models/Workspace');
const path = require('path');
const fs = require('fs');

// Đường dẫn thư mục uploads (dùng khi muốn xóa file vật lý)
const uploadDir = path.join(__dirname, '..', '..', 'uploads');

// =======================================================
// 1. UPLOAD FILE (Xử lý file từ Multer)
// =======================================================
const uploadFile = async (req, res) => {
  try {
    const uploadedFile = req.file; 
    const { ownerId, workspaceId, folderId } = req.body;

    if (!uploadedFile) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn file để upload" });
    }

    if (!ownerId) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin người dùng (ownerId)" });
    }

    const newFile = await File.create({
      name: uploadedFile.originalname,
      size: uploadedFile.size,
      fileType: uploadedFile.mimetype,
      owner: ownerId,
      url: uploadedFile.path, 
      workspace: workspaceId || null,
      folder: folderId || null,
      createdAt: new Date()
    });

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

// =======================================================
// 2. LẤY TẤT CẢ FILE (Có lọc theo UserID)
// =======================================================
const getAllFiles = async (req, res) => {
  try {
    const { ownerId } = req.query;
    let query = {};

    if (ownerId) {
      query.owner = ownerId;
    } else {
      return res.status(200).json([]); // Không có ID thì trả về rỗng để bảo mật
    }

    const files = await File.find(query).sort({ createdAt: -1 });
    res.status(200).json(files);
  } catch (err) {
    console.error("Lỗi lấy file:", err);
    res.status(500).json({ message: "Lỗi khi lấy file" });
  }
};

// =======================================================
// 3. LẤY FILE THEO ID
// =======================================================
const getFileById = async (req, res) => {
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

// =======================================================
// 4. TẠO FILE MỚI (Thủ công - Dành cho file text/doc)
// =======================================================
const createFile = async (req, res) => {
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

// =======================================================
// 5. ĐỔI TÊN FILE (RENAME) - MỚI
// =======================================================
const renameFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;

    if (!newName) {
      return res.status(400).json({ success: false, message: "Tên mới không được để trống" });
    }

    const updatedFile = await File.findByIdAndUpdate(
      id,
      { name: newName },
      { new: true }
    );

    if (!updatedFile) {
      return res.status(404).json({ success: false, message: "Không tìm thấy file" });
    }

    res.status(200).json({ success: true, message: "Đổi tên thành công", file: updatedFile });
  } catch (error) {
    console.error("Lỗi đổi tên:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// =======================================================
// 6. XÓA FILE (DELETE) - MỚI
// =======================================================
const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({ success: false, message: "Không tìm thấy file" });
    }

    // Xóa trong Database
    await File.findByIdAndDelete(id);

    // Xóa reference trong Workspace
    if (file.workspace) {
        await Workspace.findByIdAndUpdate(file.workspace, {
            $pull: { files: id }
        });
    }

    // (Tuỳ chọn) Xóa file vật lý để tiết kiệm dung lượng
    /*
    if (file.url) {
       const absolutePath = path.resolve(file.url); 
       if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
    }
    */

    res.status(200).json({ success: true, message: "Xóa file thành công" });
  } catch (error) {
    console.error("Lỗi xóa file:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// =======================================================
// 7. CÁC HÀM SHARE VÀ TOKEN (GIỮ NGUYÊN)
// =======================================================
const createShareLink = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'ID file không hợp lệ' });

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

const openFileByToken = async (req, res) => {
  try {
    const file = await File.findOne({ shareLink: req.params.token });
    if (!file) return res.status(404).send('Không tìm thấy file');
    if (!file.isPublic) return res.status(403).send('File này không công khai');

    res.sendFile(file.url, { root: __dirname + '/../../' });
  } catch (err) {
    res.status(500).send('Lỗi khi tải file');
  }
};

const getFileByToken = async (req, res) => {
  try {
    const file = await File.findOne({ shareLink: req.params.token });
    if (!file) return res.status(404).json({ success: false, message: 'Không tìm thấy file' });
    if (!file.isPublic) return res.status(403).json({ success: false, message: 'File này không công khai' });
    res.json({ success: true, file });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi tải file' });
  }
};

const updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findByIdAndUpdate(id, req.body, { new: true });
    if (!file) return res.status(404).json({ message: "Không tìm thấy file" });
    res.json(file);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật file" });
  }
};

// =======================================================
// EXPORT TẤT CẢ CÁC HÀM
// =======================================================
module.exports = {
  uploadFile,
  getAllFiles,
  getFileById,
  createFile,
  renameFile,   // <--- Mới
  deleteFile,   // <--- Mới
  createShareLink,
  openFileByToken,
  getFileByToken,
  updateFile
};