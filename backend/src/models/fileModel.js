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
<<<<<<< HEAD
        // Có thể mở rộng enum này tùy theo loại tệp bạn muốn hỗ trợ
       
=======
        enum: ['document', 'image', 'video', 'audio', 'spreadsheet', 'earmark'] 
>>>>>>> origin/feature/admin
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
<<<<<<< HEAD
    uploadDate: {
        type: Date,
        default: Date.now
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Workspace'
    }
=======
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

>>>>>>> origin/feature/admin
}, { timestamps: true }); // Tự động thêm createdAt và updatedAt

// Tạo và export Model
const File = mongoose.model('File', fileSchema);

<<<<<<< HEAD
module.exports = File;
=======
module.exports = File;
>>>>>>> origin/feature/admin
