import User from "../models/User";  
import File from "../models/fileModel";
import Folder from "../models/folderModel";
import Workspace from "../models/Workspace";
import logger from "../utils/logger";

// ------------------- USER MANAGEMENT -------------------

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = "" } = req.query;
        const query = search
            ? { email: { $regex: search, $options: "i" } }
            : {};

        const users = await User.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .select("-password"); // không trả password

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: { users, total, page: Number(page), limit: Number(limit) }
        });
    } catch (error) {
        logger.error("Error in getAllUsers:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// GET /api/admin/users/:id
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user)
            return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        logger.error("Error in getUserById:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// PATCH /api/admin/users/:id/status
export const updateUserStatus = async (req, res) => {
    try {
        const { active } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { active },
            { new: true }
        ).select("-password");

        if (!user)
            return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({ success: true, message: "User status updated", data: user });
    } catch (error) {
        logger.error("Error in updateUserStatus:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// PATCH /api/admin/users/:id/reset-password
export const resetUserPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.password = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        logger.error("Error in resetUserPassword:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// PATCH /api/admin/users/:id/quota
export const updateUserQuota = async (req, res) => {
    try {
        const { maxStorage } = req.body; // byte
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { maxStorage },
            { new: true }
        ).select("-password");

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({ success: true, message: "User quota updated", data: user });
    } catch (error) {
        logger.error("Error in updateUserQuota:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ------------------- FILE MANAGEMENT -------------------

// GET /api/admin/files
export const getAllFiles = async (req, res) => {
    try {
        const { page = 1, limit = 20, owner } = req.query;
        const query = owner ? { owner } : {};

        const files = await File.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate("owner", "email role");

        const total = await File.countDocuments(query);

        res.status(200).json({
            success: true,
            data: { files, total, page: Number(page), limit: Number(limit) }
        });
    } catch (error) {
        logger.error("Error in getAllFiles:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// GET /api/admin/files/:id
export const getFileById = async (req, res) => {
    try {
        const file = await File.findById(req.params.id).populate("owner", "email role");
        if (!file) return res.status(404).json({ success: false, message: "File not found" });

        res.status(200).json({ success: true, data: file });
    } catch (error) {
        logger.error("Error in getFileById:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// DELETE /api/admin/files/:id
export const deleteFile = async (req, res) => {
    try {
        const file = await File.findByIdAndDelete(req.params.id);
        if (!file) return res.status(404).json({ success: false, message: "File not found" });

        res.status(200).json({ success: true, message: "File deleted successfully" });
    } catch (error) {
        logger.error("Error in deleteFile:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// PATCH /api/admin/files/:id/restore
export const restoreFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) return res.status(404).json({ success: false, message: "File not found" });

        file.deleted = false;
        await file.save();

        res.status(200).json({ success: true, message: "File restored successfully", data: file });
    } catch (error) {
        logger.error("Error in restoreFile:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ------------------- SYSTEM DASHBOARD -------------------

// GET /api/admin/system/overview
export const getSystemOverview = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalFiles = await File.countDocuments();
        const totalStorageUsedAgg = await File.aggregate([
            { $group: { _id: null, totalSize: { $sum: "$size" } } }
        ]);
        const totalStorageUsed = totalStorageUsedAgg[0]?.totalSize || 0;

        res.status(200).json({
            success: true,
            data: { totalUsers, totalFiles, totalStorageUsed }
        });
    } catch (error) {
        logger.error("Error in getSystemOverview:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// GET /api/admin/system/top-storage-users
export const getTopStorageUsers = async (req, res) => {
    try {
        const topUsers = await File.aggregate([
            { $group: { _id: "$owner", usedStorage: { $sum: "$size" } } },
            { $sort: { usedStorage: -1 } },
            { $limit: 10 },
        ]);

        const users = await User.find({ _id: { $in: topUsers.map(u => u._id) } }).select("email role");

        // map kết hợp storage
        const result = topUsers.map(u => {
            const user = users.find(x => x._id.toString() === u._id.toString());
            return { userId: u._id, email: user?.email, role: user?.role, usedStorage: u.usedStorage };
        });

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        logger.error("Error in getTopStorageUsers:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
