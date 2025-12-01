const express = require("express");
const router = express.Router();
const multer = require("multer");
const fileController = require("../controllers/fileController");
const iconv = require("iconv-lite");

// Cấu hình nơi lưu file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/"); // thư mục upload
  },
  

filename: (req, file, cb) => {
  // convert từ binary → utf8
  const original = iconv.decode(Buffer.from(file.originalname, "binary"), "utf8");

  // đảm bảo không lỗi ký tự
  const safeName = Date.now() + "-" + original;

  cb(null, safeName);
}

});

const upload = multer({ storage });

// API upload file (nhiều file)
router.post("/upload", upload.array("files"), fileController.uploadFiles);

// API lấy danh sách file
router.get("/", fileController.getFiles);

// API xoá file
router.delete("/:id", fileController.deleteFile);

// API tìm kiếm
router.get("/search", fileController.searchFiles);

module.exports = router;
