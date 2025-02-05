import express from "express";
import authMiddleware from "../middleware/auth.js";
import authorize from "../middleware/rbac.js";

const router = express.Router();

router.get("/admin", authMiddleware, authorize(["admin"]), (req, res) => {
  res.json({ message: "Selamat datang, Admin!" });
});

router.get("/user", authMiddleware, authorize(["admin", "user"]), (req, res) => {
  res.json({ message: "Selamat datang, Pengguna!" });
});

export default router;
