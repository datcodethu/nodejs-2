const User = require('../models/User');
const { validationUser, validationUpdateUser } = require('../validation/userValidation');
const logger = require('../utils/logger');

// [GET] /users
exports.getAllUsers = async (req, res) => {
    try {
        logger.info('Fetching all users...');
        const users = await User.find().select('-password');
        
        logger.info(`Total users retrieved: ${users.length}`);
        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: users
        });
    } catch (err) {
        logger.error(`Error fetching users: ${err.message}`);
        res.status(500).json({ 
            success: false,
            error: 'Internal Server Error' 
        });
    }
};

// [GET] /users/:id
exports.getUserById = async (req, res) => {
    try {
        logger.info(`Fetching user with ID: ${req.params.id}`);

        if (!req.params.id) {
            logger.warn('User ID is required');
            return res.status(400).json({ 
                success: false,
                error: 'User ID is required' 
            });
        }

        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            logger.warn(`User not found with ID: ${req.params.id}`);

            return res.status(404).json({ 
                success: false,
                error: 'User not found' 
            });
        }
        logger.info(`User retrieved successfully: ${user._id}`);
        res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            data: user
        });
    } catch (err) {
        logger.error(`Error fetching user: ${err.message}`);
        res.status(400).json({ error: 'Invalid user ID' });
    }
};

// [POST] /users
exports.createUser = async (req, res) => {
    try {
        logger.info('Creating a new user...');

        const { error } = validationUser(req.body);

        if (error) {
            logger.warn(`Validation error: ${error.details[0].message}`);
            return res.status(400).json({ 
                success: false,
                error: error.details[0].message 
            });
        }

        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            logger.warn(`Email already exists: ${email}`);
            
            return res.status(409).json({ 
                success: false,
                error: 'Email already exists' 
            });
        }

        const user = new User({ name, email, password, role });
        await user.save();
        await sendEmail(user.email, user.name);
        
        logger.info(`User created successfully: ${user._id}`);
        res.status(201).json({ 
            success: true,
            message: 'User created successfully', 
            user: { ...user._doc, password: undefined } 
        });
    } catch (err) {
        logger.error(`Error creating user: ${err.message}`);
        res.status(400).json({ 
            success: false,
            error: 'Failed to create user', 
            details: err.message 
        });
    }
};

// [PUT] /users/:id
exports.updateUser = async (req, res) => {
  try {
    logger.info(`User update requested for ID: ${req.params.id} by user: ${req.user._id}`);

    // 1 Kiểm tra có param id hay không (phòng lỗi router)
    const userId = req.params.id;
    if (!userId) {
      logger.warn('User ID is missing in request');
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // 2 Tìm user trong DB
    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`User not found with ID: ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // 3️ Kiểm tra quyền cập nhật
    //  - Admin có thể update tất cả
    //  - User chỉ được update chính mình
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      logger.warn(`User ${req.user._id} tried to update another account`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own account.',
      });
    }

    // 4️ Validate dữ liệu gửi lên (Joi hoặc validationUpdateUser)
    const { error } = validationUpdateUser(req.body);
    if (error) {
      logger.warn(`Validation error by user ${req.user._id}: ${error.details[0].message}`);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // 5️ Chuẩn bị dữ liệu cần cập nhật
    const updates = { ...req.body };

    // Nếu user có gửi password mới → hash lại
    if (updates.password) {
      logger.info(`Hashing new password for user ${userId}`);
      updates.password = await argon2.hash(updates.password);
    }

    // 6️ Cập nhật dữ liệu user
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,              // trả về bản ghi sau khi update
      runValidators: true,    // kiểm tra theo schema Mongoose
      select: '-password',    // không trả về password
    });

    if (!updatedUser) {
      logger.warn(`Failed to update user with ID: ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'User not found or update failed',
      });
    }

    // 7️ Ghi log và trả về kết quả
    logger.info(`User ${userId} updated successfully by ${req.user._id}`);

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (err) {
    // 8️ Bắt lỗi hệ thống
    logger.error(`Error updating user: ${err.message}`);

    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating user',
      details: err.message,
    });
  }
};

// [DELETE] /users/:id
exports.deleteUser = async (req, res) => {
    try {
        logger.info(`Deleting user with ID: ${req.params.id}`);
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            logger.warn(`User not found for deletion with ID: ${req.params.id}`);

            return res.status(404).json({ 
                success: false,
                error: 'User not found'
            });
        }
        logger.info(`User deleted successfully: ${deletedUser._id}`);
        res.status(200).json({ 
            success: true,
            message: 'User deleted successfully' 
        });
    } catch (err) {
        logger.error(`Error deleting user: ${err.message}`);
        res.status(400).json({ 
            success: false,
            error: 'Failed to delete user', 
            details: err.message 
        });
    }
};