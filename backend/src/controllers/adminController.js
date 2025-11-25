import User from "../models/User.js";
import File from "../models/File.js";
import Folder from "../models/Folder.js";
import logger from "../utils/logger.js";

// ------------------- USER MANAGEMENT -------------------

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
    try {
        // Lấy query từ URL, nếu không có thì dùng mặc định
        const { page = 1, limit = 20, search = "" } = req.query;

        // Nếu có search thì tìm theo email chứa chuỗi search (dùng regex, không phân biệt hoa/thường)
        const query = search
            ? { email: { $regex: search, $options: "i" } }
            : {};

        const users = await User.find(query)
            .skip((page - 1) * limit)  // bỏ qua số lượng document = (page - 1) * limit
            .limit(Number(limit))      // giới hạn số lượng trả về
            .select("-password");      // không trả password vì lý do bảo mật

        const total = await User.countDocuments(query); // đếm tổng số user theo điều kiện tìm kiếm

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
        // Lấy user theo ID, đồng thời không trả về password
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
        // Lấy trạng thái active (true/false) từ body
        const { active } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { active },  // cập nhật field active
            { new: true } // new: true => trả về bản ghi mới sau update
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

        // Tìm user theo ID
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Gán password mới
        // Lưu ý: Mongoose pre-save hook sẽ tự hash mật khẩu nếu bạn đã cấu hình trong model
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
        const { maxStorage } = req.body; // dung lượng tối đa cho user (byte)

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

        // Nếu truyền owner thì lọc file theo người sở hữu
        const query = owner ? { owner } : {};

        const files = await File.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate("owner", "email role"); 
            // populate => join bảng User và chỉ lấy email + role

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
        // populate để lấy thông tin user của file
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
        // Tìm file rồi bật deleted = false (restore lại)
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
        const totalUsers = await User.countDocuments(); // tổng số user
        const totalFiles = await File.countDocuments(); // tổng số file

        // Aggregate để cộng tất cả size file
        const totalStorageUsedAgg = await File.aggregate([
            { $group: { _id: null, totalSize: { $sum: "$size" } } }
        ]);

        // Nếu không có file nào => totalSize = 0
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
        // B1: Gom nhóm file theo owner, tính tổng dung lượng của mỗi user
        const topUsers = await File.aggregate([
            { $group: { _id: "$owner", usedStorage: { $sum: "$size" } } },
            { $sort: { usedStorage: -1 } }, // sắp xếp user nào dùng nhiều dung lượng nhất
            { $limit: 10 },                 // lấy 10 user đầu
        ]);

        // B2: Lấy thông tin user tương ứng (email, role)
        const users = await User.find({
            _id: { $in: topUsers.map(u => u._id) }
        }).select("email role");

        // B3: merge kết quả lại
        const result = topUsers.map(u => {
            const user = users.find(x => x._id.toString() === u._id.toString());
            return {
                userId: u._id,
                email: user?.email,
                role: user?.role,
                usedStorage: u.usedStorage
            };
        });

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        logger.error("Error in getTopStorageUsers:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
