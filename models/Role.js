import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    permissions: [{ type: String }], // Contoh: ["read", "write", "delete"]
  },
  { timestamps: true } // ✅ Tambah createdAt & updatedAt
);

const Role = mongoose.model("Role", RoleSchema);
export default Role;
