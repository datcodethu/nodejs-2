const User = require("../models/User");
const File = require("../models/fileModel");
const logger = require("../utils/logger");

// ------------------------- USERS -------------------------

exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = "" } = req.query;
        const skip = (page - 1) * limit;

        // Tạo bộ lọc tìm kiếm
        const matchStage = search 
            ? { email: { $regex: search, $options: "i" } } 
            : {};

        const usersAggregation = await User.aggregate([
            { $match: matchStage }, // 1. Lọc theo tên/email
            {
                $lookup: {          // 2. Nối sang bảng Files để lấy file của user
                    from: "files",  // Tên collection trong MongoDB (thường là số nhiều)
                    localField: "_id",
                    foreignField: "owner",
                    as: "files"
                }
            },
            {
                $addFields: {       // 3. Tính tổng size của mảng files vừa lấy được
                    usedStorage: { $sum: "$files.size" } 
                }
            },
            { $project: { files: 0, password: 0 } }, // 4. Bỏ field files nặng nề đi, giấu password
            { $sort: { createdAt: -1 } },            // 5. Sắp xếp mới nhất
            { $skip: Number(skip) },                 // 6. Phân trang
            { $limit: Number(limit) }
        ]);

        // Đếm tổng số user để làm phân trang
        const total = await User.countDocuments(matchStage);

        res.json({ 
            success: true, 
            data: { users: usersAggregation, total, page, limit } 
        });
    } catch (error) {
        console.error("getAllUsers:", error); // Dùng console.error thay logger nếu chưa config
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, data: user });
    } catch (error) {
        logger.error("getUserById:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { active } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { active },
            { new: true }
        ).select("-password");

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, message: "User status updated", data: user });
    } catch (error) {
        logger.error("updateUserStatus:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.resetUserPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ success: false, message: "New password required" });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        logger.error("resetUserPassword:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.updateUserQuota = async (req, res) => {
    try {
        const { storageLimit } = req.body;

        if (!storageLimit || storageLimit <= 0) {
            return res.status(400).json({ success: false, message: "Invalid storage limit" });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { storageLimit },
            { new: true }
        ).select("-password");

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, message: "User quota updated", data: user });
    } catch (error) {
        logger.error("updateUserQuota:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ------------------------- FILES -------------------------

exports.getAllFiles = async (req, res) => {
    try {
        const { page = 1, limit = 20, owner } = req.query;
        const filter = owner ? { owner } : {};

        const [files, total] = await Promise.all([
            File.find(filter)
                .skip((page - 1) * limit)
                .limit(Number(limit))
                .populate("owner", "email role"),
            File.countDocuments(filter)
        ]);

        res.json({ success: true, data: { files, total, page, limit } });
    } catch (error) {
        logger.error("getAllFiles:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.getFileById = async (req, res) => {
    try {
        const file = await File.findById(req.params.id)
            .populate("owner", "email role");

        if (!file) return res.status(404).json({ success: false, message: "File not found" });

        res.json({ success: true, data: file });
    } catch (error) {
        logger.error("getFileById:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const file = await File.findByIdAndDelete(req.params.id);
        if (!file) return res.status(404).json({ success: false, message: "File not found" });

        res.json({ success: true, message: "File deleted" });
    } catch (error) {
        logger.error("deleteFile:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.restoreFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) return res.status(404).json({ success: false, message: "File not found" });

        file.isDeleted = false;
        await file.save();

        
        res.json({ success: true, message: "File restored", data: file });
    } catch (error) {
        logger.error("restoreFile:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ------------------------- SYSTEM -------------------------

exports.getSystemOverview = async (req, res) => {
    try {
        const [totalUsers, totalFiles] = await Promise.all([
            User.countDocuments(),
            File.countDocuments()
        ]);

        const storageAgg = await File.aggregate([
            { $group: { _id: null, size: { $sum: "$size" } } }
        ]);

        const totalStorageUsed = storageAgg[0]?.size || 0;

        res.json({
            success: true,
            data: { totalUsers, totalFiles, totalStorageUsed }
        });
    } catch (error) {
        logger.error("getSystemOverview:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.getTopStorageUsers = async (req, res) => {
    try {
        const topUsers = await File.aggregate([
            { $group: { _id: "$owner", usedStorage: { $sum: "$size" } } },
            { $sort: { usedStorage: -1 } },
            { $limit: 10 }
        ]);

        const users = await User.find({
            _id: { $in: topUsers.map(u => u._id) }
        }).select("email role");

        const result = topUsers.map(item => {
            const user = users.find(u => u._id.toString() === item._id.toString());
            return {
                userId: item._id,
                email: user?.email,
                role: user?.role,
                usedStorage: item.usedStorage
            };
        });

        res.json({ success: true, data: result });
    } catch (error) {
        logger.error("getTopStorageUsers:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
