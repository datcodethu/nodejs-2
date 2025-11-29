const Workspace = require("../models/Workspace");
const Folder = require("../models/folderModel");
const File = require("../models/fileModel");

// Lấy tất cả workspace
exports.getAllWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find();
    res.json(workspaces);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy workspace + folder + file
exports.getWorkspaceById = async (req, res) => {
  try {
    const workspaceId = req.params.id;

    const workspace = await Workspace.findById(workspaceId).lean();
    if (!workspace) {
      return res.status(404).json({ message: "Không tìm thấy workspace" });
    }

    const folders = await Folder.find({ workspace: workspaceId });
    const files = await File.find({ workspace: workspaceId });

    workspace.folders = folders;
    workspace.files = files;

    res.json(workspace);
  } catch (err) {
    console.error("❌ Lỗi khi lấy workspace:", err);
    res.status(500).json({ message: "Lỗi server khi lấy workspace" });
  }
};

// Chỉ lấy folders + files
exports.getWorkspaceContent = async (req, res) => {
  try {
    const workspaceId = req.params.id;

    const folders = await Folder.find({ workspace: workspaceId });
    const files = await File.find({ workspace: workspaceId });

    res.json({ folders, files });
  } catch (err) {
    console.error("❌ Lỗi khi lấy content workspace:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Tạo workspace mới
exports.createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Thiếu tên workspace" });

    const workspace = new Workspace({ name, folders: [], files: [] });
    await workspace.save();

    res.status(201).json(workspace);
  } catch (err) {
    console.error("❌ Lỗi tạo workspace:", err);
    res.status(500).json({ message: "Lỗi server khi tạo workspace" });
  }
};
