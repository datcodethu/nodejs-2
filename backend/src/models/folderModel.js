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