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

//link chia se
router.post('/:id/share', async (req,res) => {
    try {
        const fileId = req.params.id;
        const { isPublic = true, shareWith = [] } = req.body;

        const shareToken = crypto.randomBytes(8).toString('hex')
        const shareLink = `${req.protocol}://${req.get('host')}/share/${shareToken}`

        const file = await File.findByIdAndUpdate(
            fileId,
            { shareLink, isPublic, shareWith},
            {new: true}
        );
        res.json({success: true,link: shareLink, file});

    }catch (err) {
        res.status(500).json({ success: false, message: err.message})
    }
})


//mo file qua link
router.get('/share/:token', async (req,res) => {
    try {
        const file = await File.findOne({ shareLink: { $regex: req.params.token}})
        if(!file) return res.status(400).json({message: 'khong tim thay file'})
        
        //neu file khong public
        if (!file.isPublic){
            return res.status(403).json({success: false,message: 'file nay khong cong khai'})
        }

        res.json({ success: true, file})
    } catch (error){
        console.error(error)
        res.status(500).json({ success:false, message : 'loi khi tai file'})
    }
})

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

module.exports = router;