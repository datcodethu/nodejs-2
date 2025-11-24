const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  folders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Folder",default: [] }],
  files: [{ type: mongoose.Schema.Types.ObjectId, ref: "File", default: [] }],
});

module.exports = mongoose.model("Workspace", workspaceSchema, "workspaces");