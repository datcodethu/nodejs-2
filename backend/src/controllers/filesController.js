const File = require('../models/fileModel');
const fs = require('fs');
const path = require('path');

const { model } = require('mongoose');
const uploadDir = path.join(__dirname, '..', '..', 'uploads'); // Đường dẫn đến thư mục uploads

// CREATE  
const createFile = async (req, res) => {
  try {
    // Lấy dữ liệu từ client gửi lên
    const { name, content, workspaceId, ownerId, folderId, size, fileType, url } = req.body;

    // Kiểm tra dữ liệu hợp lệ
    if (!name || !content || !ownerId || !size || !fileType) {
      return res.status(400).json({
        success: false,
        message: "Thiếu các trường bắt buộc: name, content, ownerId, size, fileType!"
      });
    }

    // Tạo mới document File
    const newFile = new File({
      name,
      content,
      owner: ownerId,
      size,
      fileType,
      url: url || '',
      folder: folderId || null,
      workspace: workspaceId || null,
      createdAt: new Date(),
    });

    // Lưu file vào MongoDB
    await newFile.save();

    // Nếu có workspace thì thêm file vào danh sách file của workspace
    if (workspaceId) {
      await Workspace.findByIdAndUpdate(workspaceId, {
        $push: { files: newFile._id }
      });
    }

    // Phản hồi lại client
    res.status(201).json({
      success: true,
      message: 'Tạo file thành công!',
      file: newFile
    });

  } catch (error) {
    console.error('Lỗi khi thêm file:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thêm file!'
    });
  }
};
// UPLOAD FILE
const uploadFile = async (req, res) => {
    // req.file chứa thông tin về file đã được multer xử lý và lưu
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Không tìm thấy tệp tin được tải lên.'
        });
    }

    try {
        // Lấy các trường dữ liệu text đi kèm từ client gửi lên (dùng req.body)
        const { workspaceId, ownerId, folderId } = req.body; 

        // Kiểm tra dữ liệu bắt buộc (ownerId là người tải lên)
        if (!ownerId) {
            return res.status(400).json({
                success: false,
                message: "Thiếu ownerId!"
            });
        }
        
        // 1. Tạo mới document File trong DB
        const newFile = new File({
            name: req.file.originalname, // Tên file gốc
            size: req.file.size, 
            fileType: req.file.mimetype, // Kiểu MIME
            url: req.file.path,          // Đường dẫn lưu trữ trên server (tên file mới)
            owner: ownerId,
            folder: folderId || null,
            workspace: workspaceId || null,
        });

        await newFile.save();

        // 2. Nếu có workspace thì thêm file vào danh sách file của workspace
        if (workspaceId) {
            await Workspace.findByIdAndUpdate(workspaceId, {
                $push: { files: newFile._id }
            });
        }

        // 3. Phản hồi lại client
        res.status(201).json({
            success: true,
            message: 'Tải tệp lên thành công!',
            file: newFile
        });

    } catch (error) {
        console.error('Lỗi khi tải tệp lên:', error);
        // Kiểm tra lỗi Multer (ví dụ: kích thước file quá lớn)
        if (error.code === 'LIMIT_FILE_SIZE') {
             return res.status(400).json({
                success: false,
                message: 'Kích thước tệp tin quá lớn!'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi tải tệp lên!'
        });
    }
};
// READ - chỉ lấy file của user hiện tại
const getFiles = async (req, res) => {
  try {
    // Lấy ownerId từ middleware xác thực (giả sử đã gán vào req.user._id)
    const ownerId = req.user?._id || req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ message: 'Không xác thực được người dùng.' });
    }
    const files = await File.find({ owner: ownerId });
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET FILE BY ID - chỉ cho phép xem file của mình
const getFileById = async (req, res) => {
  try {
    const ownerId = req.user?._id || req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ message: 'Không xác thực được người dùng.' });
    }
    const file = await File.findOne({ _id: req.params.id, owner: ownerId });
    if (file) {
      res.status(200).json(file);
    } else {
      res.status(404).json({ message: 'Không tìm thấy file hoặc bạn không có quyền truy cập.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
const updateFile = async (req, res) => {
  try{
    const file = await File.findByIdAndUpdate(
      req.params.id,
      req.body,
      {new : true, runValidators: true}
    );
    if(file){
      res.status(200).json(file);
    }
    else{
      res.status(404).json({message: 'File khong tim thay'})
    }
  }
  catch (error){
    res.status(400).json({message: error.message});
  }
}

// DELETE
const deleteFile = async (req, res) => {
  try{
    const file = await File.findByIdAndDelete(req.params.id);
    if (file){
      res.status(200).json({message: 'File da duoc xoa'});

    }
    else{
      res.status(404).json({message: 'File khong duoc tim thay'})
    }
  }
  catch (error){
    res.status(500).json({message: error.message});
  }
};
// UPDATE NAME
const renameFile = async (req, res) => {
    const fileId = req.params.id;
    const { name } = req.body;

    // 1. Kiểm tra dữ liệu đầu vào
    if (!name) {
        return res.status(400).json({ message: "Tên file mới không được để trống." });
    }

    try {
        // 2. Tìm và cập nhật file trong cơ sở dữ liệu
        // Cần đảm bảo rằng tên file mới không trùng lặp nếu bạn có ràng buộc unique
        const updatedFile = await File.findByIdAndUpdate(
            fileId,
            { name: name },
            { new: true, runValidators: true } // {new: true} trả về tài liệu đã cập nhật
        );

        // 3. Xử lý trường hợp không tìm thấy file
        if (!updatedFile) {
            return res.status(404).json({ message: `Không tìm thấy file với ID: ${fileId}` });
        }

        // 4. Phản hồi thành công
        res.status(200).json({ 
            message: "Đổi tên file thành công!",
            file: updatedFile
        });

    } catch (error) {
        console.error("Lỗi Server khi đổi tên file:", error);
        // Trả về lỗi 500 nếu có lỗi không mong muốn từ DB hoặc server
        res.status(500).json({ message: "Lỗi Server: Không thể đổi tên file." });
    }
};
const viewFile = async (req, res) => {
  try {
    const ownerId = req.user?._id || req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ message: 'Không xác thực được người dùng.' });
    }
    // Tìm file theo id và owner
    const file = await File.findOne({ _id: req.params.id, owner: ownerId });
    if (!file) {
      return res.status(404).json({ message: "Không tìm thấy file hoặc bạn không có quyền truy cập." });
    }
    const filePath = path.join(uploadDir, file.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File không còn tồn tại trên server." });
    }
    // --- Xử lý loại File ---
    // 1. Nếu là Ảnh: Trả về URL công khai
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      return res.status(200).json({ url: fileUrl });
    }
    // 2. Nếu là Văn bản (Text, JSON, Code, v.v.): Trả về nội dung
    if (file.mimetype && (file.mimetype.startsWith('text/') || file.mimetype.includes('json'))) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return res.status(200).json({ content: fileContent });
    }
    // 3. Các loại file khác (PDF, Word) không thể xem trực tiếp bằng cách này
    return res.status(400).json({ message: "Định dạng file này chưa được hỗ trợ xem trước nhanh." });
  } catch (error) {
    console.error("Lỗi khi xem trước file:", error);
    return res.status(500).json({ message: "Lỗi Server: Không thể tải nội dung xem trước." });
  }
};
module.exports = {
    createFile,
    getFiles,
    getFileById,
    updateFile,
    deleteFile,
    uploadFile,
    renameFile,
    viewFile
};