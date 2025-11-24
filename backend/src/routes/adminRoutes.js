import express from "express";
import {
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
} from "../controllers/adminController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdminMiddleware } from "../middleware/isAdminMiddleware.js";

const router = express.Router();

// --------------------- USER MANAGEMENT ---------------------
router.get("/users", authMiddleware, isAdminMiddleware, getAllUsers);
router.get("/users/:id", authMiddleware, isAdminMiddleware, getUserById);
router.patch("/users/:id/status", authMiddleware, isAdminMiddleware, updateUserStatus);
router.patch("/users/:id/reset-password", authMiddleware, isAdminMiddleware, resetUserPassword);
router.patch("/users/:id/quota", authMiddleware, isAdminMiddleware, updateUserQuota);

// --------------------- FILE MANAGEMENT ---------------------
router.get("/files", authMiddleware, isAdminMiddleware, getAllFiles);
router.get("/files/:id", authMiddleware, isAdminMiddleware, getFileById);
router.delete("/files/:id", authMiddleware, isAdminMiddleware, deleteFile);
router.patch("/files/:id/restore", authMiddleware, isAdminMiddleware, restoreFile);

// --------------------- SYSTEM DASHBOARD ---------------------
router.get("/system/overview", authMiddleware, isAdminMiddleware, getSystemOverview);
router.get("/system/top-storage-users", authMiddleware, isAdminMiddleware, getTopStorageUsers);

export default router;
