
// controllers/folderController.js
const Folder = require('../models/folderModel');
const File = require('../models/fileModel'); // Cần cho hàm getFiles
const Workspace = require('../models/Workspace'); // Cần cho hàm createFolder

/**
 * @desc Lấy danh sách tất cả các thư mục (READ - List)
 * @route GET /api/v1/folders
 */
const getFolders = async (req, res, next) => {
    try {
        const folders = await Folder.find({});
        console.log(`[Backend] Yêu cầu GET tới /api/v1/folders được xử lý. Đã tìm thấy ${folders.length} thư mục.`);
        res.status(200).json(folders);
    } catch (error) {
        console.error("Lỗi khi truy vấn MongoDB cho folders:", error);
        next(error); 
    }
};

/**
 * @desc Lấy chi tiết một thư mục theo ID (READ - Detail)
 * @route GET /api/v1/folders/:id
 */
const getFolderById = async (req, res) => {
    const { id } = req.params;
    try {
        const folder = await Folder.findById(id);
        if (!folder) {
            return res.status(404).json({ message: "Không tìm thấy folder" });
        }
        res.json(folder);
    } catch (err) {
        console.error("Lỗi khi tìm folder theo ID:", err);
        res.status(500).json({ message: "Lỗi server khi tìm folder" });
    }
};

/**
 * @desc Lấy danh sách file trong một thư mục
 * @route GET /api/v1/folders/:id/files
 */
const getFilesInFolder = async (req, res) => {
    try {
        console.log("👉 ID folder được gửi:", req.params.id);
        const files = await File.find({ folder: req.params.id }); 
        console.log(`📄 Tìm thấy ${files.length} file`);
        res.status(200).json(files);
    } catch (err) {
        console.error("❌ Lỗi khi lấy danh sách file:", err);
        res.status(500).json({ message: "Lỗi server khi lấy danh sách file" });
    }
};

/**
 * @desc Tạo folder mới và gắn vào Workspace (CREATE)
 * @route POST /api/v1/folders
 */
// controllers/folderController.js (Chỉ phần tạo folder)

const createFolder = async (req, res) => {
    try {
        const { name, workspaceId } = req.body;
        // ... (ownerId)

        let workspace = null;
        
        // 💡 BƯỚC SỬA: CHỈ TÌM WORKSPACE NẾU ID ĐƯỢC CUNG CẤP
        if (workspaceId) {
            workspace = await Workspace.findById(workspaceId);
            if (!workspace) {
                return res.status(404).json({ message: "Không tìm thấy workspace" });
            }
        }
        
        // ⚡️ Tạo folder
        const folder = new Folder({ 
            name, 
            workspace: workspace ? workspace._id : null, // Gán null nếu không có workspace
            owner: ownerId 
        });
        await folder.save();

        // ⚡️ Gắn folder ID vào workspace (CHỈ KHI WORKSPACE TỒN TẠI)
        if (workspace) {
            workspace.folders = workspace.folders || [];
            workspace.folders.push(folder._id);
            await workspace.save();
        }

        res.json(folder);
    } catch (err) {
        // ... (Xử lý lỗi)
    }
};

module.exports = {
    getFolders,
    getFolderById,
    getFilesInFolder,
    createFolder,
    // ... (Thêm updateFolder, deleteFolder nếu có)
};



// ==============================
// Lấy tất cả folder
// ==============================
exports.getAllFolders = async (req, res, next) => {
  try {
    const folders = await Folder.find({});
    console.log(`[Backend] GET /folders -> ${folders.length} folders`);
    res.status(200).json(folders);
  } catch (error) {
    console.error("Lỗi khi lấy folders:", error);
    next(error);
  }
};

// ==============================
// Lấy folder theo ID + file + subfolder
// ==============================
exports.getFolderById = async (req, res) => {
  try {
    const { id } = req.params;

    const folder = await Folder.findById(id).lean();
    if (!folder) return res.status(404).json({ message: "Không tìm thấy folder" });

    const files = await File.find({ folder: id }).lean();
    const subFolders = await Folder.find({ parent: id }).lean();

    folder.files = files;
    folder.subFolders = subFolders;

    res.json(folder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ==============================
// Lấy danh sách file trong folder
// ==============================
exports.getFilesInFolder = async (req, res) => {
  try {
    console.log("👉 ID folder:", req.params.id);

    const files = await File.find({ folder: req.params.id });
    console.log(`📄 Tìm thấy ${files.length} file`);

    res.status(200).json(files);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách file:", err);
    res.status(500).json({ message: "Lỗi server khi lấy file" });
  }
};

// ==============================
// Tạo folder mới
// ==============================
exports.createFolder = async (req, res) => {
  try {
    const { name, workspaceId } = req.body;
    console.log("📥 Nhận yêu cầu tạo folder:", { name, workspaceId });

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      console.log("⚠ Không tìm thấy workspace:", workspaceId);
      return res.status(404).json({ message: "Không tìm thấy workspace" });
    }

    const ownerId = req.user ? req.user.id : "68fcca6cf8eb17ab26fb6b1f";

    const folder = new Folder({
      name,
      workspace: workspace._id,
      ownerId
    });

    await folder.save();

    workspace.folders = workspace.folders || [];
    workspace.folders.push(folder._id);
    await workspace.save();

    console.log(`✅ Đã tạo folder "${folder.name}" trong workspace "${workspace.name}"`);

    res.json(folder);
  } catch (err) {
    console.error("💥 Lỗi khi tạo folder:", err);
    res.status(500).json({ message: "Lỗi tạo folder" });
  }
};

