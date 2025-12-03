const express = require("express");
const {
    getAllUsers,
    getUserById,
    updateUserStatus,
    resetUserPassword,
    updateUserQuota,
    getAllFiles,
    getFileById,
    deleteFile,
    restoreFile,
    getSystemOverview,
    getTopStorageUsers,
} = require("../controllers/adminController");

const { validateToken } = require("../middlewares/validateToken");
const authRoles = require("../middlewares/authRoles");

const router = express.Router();

// ÁP DỤNG CHO TẤT CẢ ROUTE ADMIN
router.use(validateToken, authRoles("admin")); 
// => chỉ admin mới truy cập được

// --------------------- USER MANAGEMENT ---------------------
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/reset-password", resetUserPassword);
router.patch("/users/:id/quota", updateUserQuota);

// --------------------- FILE MANAGEMENT ---------------------
router.get("/files", getAllFiles);
router.get("/files/:id", getFileById);
router.delete("/files/:id", deleteFile);
router.patch("/files/:id/restore", restoreFile);

// --------------------- SYSTEM DASHBOARD ---------------------
router.get("/system/overview", getSystemOverview);
router.get("/system/top-storage-users", getTopStorageUsers);

module.exports = router;
