const express = require('express');
const router = express.Router();
const File = require('../models/fileModel')
const Folder = require('../models/folderModel'); 
const Workspace = require('../models/Workspace'); 
/**
 * @route GET /api/v1/folders
 * @desc Lấy danh sách tất cả các thư mục từ MongoDB
 */

router.get('/', async (req, res, next) => {
    try {

        const folders = await Folder.find({}); 
        
        console.log(`[Backend] Yêu cầu GET tới /api/v1/folders được xử lý. Đã tìm thấy ${folders.length} thư mục.`);
        
        res.status(200).json(folders);

    } catch (error) {

        console.error("Lỗi khi truy vấn MongoDB cho folders:", error);
        next(error); 
    }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy folder
    const folder = await Folder.findById(id).lean();
    if (!folder) return res.status(404).json({ message: "Không tìm thấy folder" });

    // Lấy file trong folder
    const files = await File.find({ folder: id }).lean();

    // Nếu muốn, có thể lấy cả folder con (subfolder)
    const subFolders = await Folder.find({ parent: id }).lean();

    // Gắn vào folder object
    folder.files = files;
    folder.subFolders = subFolders;

    res.json(folder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});


//  Lấy danh sách file trong folder
router.get("/:id/files", async (req, res) => {
  try {
    console.log("👉 ID folder được gửi:", req.params.id);
    const files = await File.find({ folder: req.params.id }); // field đúng trong DB là "folder"
    console.log(`📄 Tìm thấy ${files.length} file`);
    res.status(200).json(files);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách file:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách file" });
  }
});
router.post("/", async (req, res) => {
  try {
    const { name, workspaceId } = req.body;
    console.log(" Nhận yêu cầu tạo folder:", { name, workspaceId });

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      console.log(" Không tìm thấy workspace:", workspaceId);
      return res.status(404).json({ message: "Không tìm thấy workspace" });
    }

    // ⚡️ Tạo folder kèm workspace
    const ownerId = req.user ? req.user.id : "68fcca6cf8eb17ab26fb6b1f";
    const folder = new Folder({ name, workspace: workspace._id, ownerId });
    await folder.save();

    // ⚡️ Gắn folder ID vào workspace
    workspace.folders = workspace.folders || [];
    workspace.folders.push(folder._id);
    await workspace.save();

    console.log(`✅ Đã thêm folder "${folder.name}" vào workspace "${workspace.name}"`);

    res.json(folder);
  } catch (err) {
    console.error("💥 Lỗi khi tạo folder:", err);
    res.status(500).json({ message: "Lỗi tạo folder" });
  }
});

module.exports = router;
