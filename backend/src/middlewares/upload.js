// middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Đường dẫn tuyệt đối đến thư mục uploads
const uploadDir = path.join(__dirname, '../../uploads');

// ✅ Tự tạo thư mục nếu chưa có
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Cấu hình nơi lưu file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // dùng đường dẫn tuyệt đối thay vì 'uploads/'
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// ✅ Middleware xử lý upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype.startsWith('image/') ||
            file.mimetype === 'text/plain' ||
            file.mimetype === 'application/pdf'
        ) {
            cb(null, true);
        } else {
            cb(new Error('Định dạng file không được hỗ trợ!'), false);
        }
    }
});

module.exports = upload;
