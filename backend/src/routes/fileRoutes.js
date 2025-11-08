const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const File = require('../models/fileModel'); 
const Workspace = require('../models/Workspace'); 
/**
 * @route GET /api/v1/files
 * @desc Lấy danh sách tất cả các tệp từ MongoDB
 */

router.get('/', async (req, res, next) => {
    try {

        const files = await File.find({}); 
        
        console.log(`[Backend] Yêu cầu GET tới /api/v1/files được xử lý. Đã tìm thấy ${files.length} tệp.`);
        
        res.status(200).json(files);

    } catch (error) {
        // 3. XỬ LÝ LỖI DB
        console.error("Lỗi khi truy vấn MongoDB cho files:", error);
        next(error); 
    }
});

router.post("/", async (req, res) => {
  try {
    const { name, workspaceId, content } = req.body;
    const file = new File({ name, workspace: workspaceId, content });
    await file.save();

    // ✅ Gắn vào workspace
    await Workspace.findByIdAndUpdate(workspaceId, {
      $push: { files: file._id }
    });

    res.json(file);
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo file" });
  }
});

//link chia se
router.post('/share/:id', async (req,res) => {
  try {
      const file = await File.findById(req.params.id);
      if (!file) return res.status(400).json({success:false, message:'Không tìm thấy file'});

      const token = crypto.randomBytes(16).toString('hex');
      file.shareLink = token;
      file.isPublic = true;

      await file.save();
      res.json({success: true, shareUrl:`http://localhost:5173/share/${token}`});
  } catch (err) {
      console.error('Lỗi khi tạo link chia sẻ:', err);
      res.status(500).json({ success: false, message: err.message });
  }
});


//mo file qua link
router.get('/share/:token', async (req, res) => {
  try {
    // Tìm chính xác token
    const file = await File.findOne({ shareLink: req.params.token });

    if (!file) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy file' });
    }

    if (!file.isPublic) {
      return res.status(403).json({ success: false, message: 'File này không công khai' });
    }

    res.json({ success: true, file });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi khi tải file' });
  }
});


router.get('/:token', async (req, res) => {
  try {
    const file = await File.findOne({ shareLink: { $regex: req.params.token } });
    if (!file) return res.status(400).json({ message: 'Không tìm thấy file' });

    if (!file.isPublic) {
      return res.status(403).json({ success: false, message: 'File này không công khai' });
    }

    res.json({ success: true, file });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi khi tải file' });
  }
});

module.exports = router;


module.exports = router;