const express = require("express");
const router = express.Router();
const {
  getAllWorkspaces,
  getWorkspaceById,
  getWorkspaceContent,
  createWorkspace
} = require("../controllers/workspaceController");

router.get("/", getAllWorkspaces);
router.get("/:id", getWorkspaceById);
router.get("/:id/content", getWorkspaceContent);
router.post("/", createWorkspace);

module.exports = router;
