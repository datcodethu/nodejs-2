// models/folderModel.js
const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: String, required: true }, // ID người sở hữu
    parentFolder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
    workspace: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Folder', folderSchema);