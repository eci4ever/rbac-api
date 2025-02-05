import express from "express";
import AuditLog from "../models/auditLogModel.js";
import authMiddleware from "../middleware/auth.js";
import authorize from "../middleware/rbac.js";

const router = express.Router();

// **Admin Dapatkan Semua Audit Log**
router.get("/", authMiddleware, authorize(["admin"]), async (req, res) => {
  try {
    const logs = await AuditLog.find().populate("user", "username email").sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Ralat mendapatkan audit log", error });
  }
});

export default router;
