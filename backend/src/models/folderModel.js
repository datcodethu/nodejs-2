
// models/folderModel.js
// const mongoose = require('mongoose');

// const folderSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     owner: { type: String, required: true }, // ID người sở hữu
//     parentFolder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
//     workspace: { type: String, default: null },
// }, { timestamps: true });

// module.exports = mongoose.model('Folder', folderSchema);

const mongoose = require('mongoose');

// Định nghĩa Schema cho Thư mục
const folderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' 
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace', 
        default: null
    }

    // Trường timestamps sẽ tự động thêm createdAt và updatedAt
}, { timestamps: true });

// Tạo và export Model
const Folder = mongoose.model('Folder', folderSchema);

module.exports = Folder;

