import User from "../models/User.js";
import auditLogger from "../middleware/auditLogger.js";

// **1️⃣ Dapatkan profil pengguna**
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Ralat mendapatkan profil" });
  }
};

// **2️⃣ Kemaskini profil pengguna**
export const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { username, email },
      { new: true }
    ).select("-password");

    await auditLogger(req.user.id, "UPDATE_PROFILE", "Pengguna mengemaskini profil");

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Ralat mengemaskini profil" });
  }
};

// **3️⃣ (Admin) Dapatkan senarai pengguna**
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Ralat mendapatkan pengguna" });
  }
};

// **4️⃣ (Admin) Ban / Delete pengguna**
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Pengguna tidak dijumpai" });

    await user.deleteOne();

    await auditLogger(req.user.id, "DELETE_USER", `Admin memadam pengguna ${user.email}`);
    
    res.json({ message: "Pengguna telah dipadam" });
  } catch (error) {
    res.status(500).json({ message: "Ralat memadam pengguna" });
  }
};
