import express from "express";
import { getProfile, updateProfile, getUsers, deleteUser } from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";
import authorize from "../middleware/rbac.js";

const router = express.Router();

// **Profil pengguna**
router.get("/me", authMiddleware, getProfile);
router.put("/me", authMiddleware, updateProfile);

// **Admin: Senarai pengguna & Ban/Delete pengguna**
router.get("/", authMiddleware, authorize(["admin"]), getUsers);
router.delete("/:id", authMiddleware, authorize(["admin"]), deleteUser);

export default router;
