import AuditLog from "../models/auditLogModel.js";

const auditLogger = async (userId, action, description) => {
  try {
    await AuditLog.create({ user: userId, action, description });
  } catch (error) {
    console.error("Ralat menyimpan audit log:", error);
  }
};

export default auditLogger;
