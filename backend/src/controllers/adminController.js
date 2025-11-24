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

