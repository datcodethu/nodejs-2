const File = require('../models/fileModel');
const { model } = require('mongoose');

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
// READ
const getFiles = async (req, res) => {
  try{
    const files = await File.find({});
    res.status(200).json(files)
  }
  catch (error){
    res.status(500).json({message: error.message});
  }
};

// GET FILE BY ID
const getFileById = async (req, res) => {
  try{
    const file = await File.findById(req.params.id);
    if(file){
      res.status(200).json(file);

    }else{
      res.status(404).json({message: 'Khoong tim thay file'})

    }
  }catch(error){
    res.status(500).json({message: error.message});
  };

}

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

module.exports = {
    createFile,
    getFiles,
    getFileById,
    updateFile,
    deleteFile,
    uploadFile
};