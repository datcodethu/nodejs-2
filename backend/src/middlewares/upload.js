// middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Đường dẫn tuyệt đối đến thư mục uploads
// Giả định middleware nằm trong src/middlewares (hoặc tương tự) và uploads nằm ngang cấp với src
const uploadDir = path.join(__dirname, '../../uploads'); 

// ✅ Tự tạo thư mục nếu chưa có
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Cấu hình nơi lưu file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Danh sách các MIME Type được hỗ trợ
const ALLOWED_MIME_TYPES = [
    // 1. Hình ảnh
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    // 2. Tài liệu văn bản cơ bản
    'text/plain',
    'application/pdf',
    // 3. Tài liệu Microsoft Office (xlsx, docx, pptx)
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    // 4. Định dạng nén
    'application/zip',
    'application/x-rar-compressed',
    'application/vnd.ms-cab-compressed',
    // 5. Code & Data
    'application/json',
    'text/csv',
];

// ✅ Middleware xử lý upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 }, // 10MB
    fileFilter: (req, file, cb) => {
        // Kiểm tra xem MIME type có trong danh sách được phép không
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            // Lỗi xảy ra tại đây (dòng 36 trong log của bạn)
            cb(new Error('Định dạng file không được hỗ trợ!'), false);
        }
    }
});

module.exports = upload;