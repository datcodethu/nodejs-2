const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  folders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Folder" }],
  files: [{ type: mongoose.Schema.Types.ObjectId, ref: "File" }],
});

module.exports = mongoose.model("Workspace", workspaceSchema);
