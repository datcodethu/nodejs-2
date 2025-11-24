const mongoose = require('mongoose');

// Định nghĩa Schema cho Tệp
const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255
    },
    fileType: {
        type: String,
        required: true,
        enum: ['document', 'image', 'video', 'audio', 'spreadsheet', 'earmark'] 
    },
    size: {
        type: Number, // Kích thước tệp tính bằng bytes
        required: true
    },
    folder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder', // Tham chiếu đến Model Folder
        default: null // Tệp có thể nằm ngoài thư mục
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Workspace'
    },
    url: {
        type: String,
        required: true
    },
    shareLink: {
        type: String,
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    createdAt: { type: Date, default: Date.now },

}, { timestamps: true }); // Tự động thêm createdAt và updatedAt

// Tạo và export Model
const File = mongoose.model('File', fileSchema);

module.exports = File;