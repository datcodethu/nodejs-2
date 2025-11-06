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
        // Có thể mở rộng enum này tùy theo loại tệp bạn muốn hỗ trợ
        enum: ['document', 'image', 'video', 'audio', 'spreadsheet', 'other'] 
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
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Workspace'
    }
}, { timestamps: true }); // Tự động thêm createdAt và updatedAt

// Tạo và export Model
const File = mongoose.model('File', fileSchema);

module.exports = File;
