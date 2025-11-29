const File = require('../models/fileModel')
const Workspace = require('../models/Workspace')

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

