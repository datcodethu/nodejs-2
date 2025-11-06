const express = require("express");
const router = express.Router();
const Workspace = require("../models/Workspace");
const Folder = require("../models/folderModel");
const File = require("../models/fileModel")
// Lấy tất cả workspace
router.get("/", async (req, res) => {
  try {
    const workspaces = await Workspace.find();
    res.json(workspaces);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const workspaceId = req.params.id;

    // 1️⃣ Lấy workspace gốc
    const workspace = await Workspace.findById(workspaceId).lean();
    if (!workspace) {
      return res.status(404).json({ message: "Không tìm thấy workspace" });
    }

    // 2️⃣ Lấy thủ công các folder và file thuộc workspace này
    const folders = await Folder.find({ workspace: workspaceId });
    const files = await File.find({ workspace: workspaceId });

    // 3️⃣ Gắn thêm vào object workspace
    workspace.folders = folders;
    workspace.files = files;

    // 4️⃣ Trả về kết quả
    res.json(workspace);
  } catch (err) {
    console.error("❌ Lỗi khi lấy workspace:", err);
    res.status(500).json({ message: "Lỗi server khi lấy workspace" });
  }
});


router.get("/:id/content", async (req,res) => {
  try {
    const workspace = req.params.id;

    const folders = await Folder.find({workspace: workspaceId})
    const files = await File.find({workspace: workspaceId})
    res.json({folders,files})
  } catch {
    console.error(err)
  }
})

module.exports = router;
