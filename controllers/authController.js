import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import auditLogger from "../middleware/auditLogger.js";
import bcrypt from "bcryptjs";

// Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// **Register User**
export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Semak jika user sudah wujud
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Pengguna sudah wujud!" });

    // Buat user baru
    user = new User({ username, email, password, role });
    await user.save();

    // Hantar token
    const token = generateToken(user);
    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Ralat Server", error });
  }
};

// **Login User**
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Emel tidak wujud!" });

    // Semak kata laluan
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Kata laluan salah!" });

    // Hantar token
    const token = generateToken(user);

    // Log aktiviti
    await auditLogger(user._id, "LOGIN", "Pengguna berjaya login");

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Ralat Server", error });
  }
};

// Logout User
export const logout = async (req, res) => {
    try {
      await auditLogger(req.user.id, "LOGOUT", "Pengguna telah logout");
      res.json({ message: "Logout berjaya" });
    } catch (error) {
      res.status(500).json({ message: "Ralat logout", error });
    }
};

// **1️⃣ Hantar Email Reset Password**
export const forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "Emel tidak wujud!" });
  
      // **Cipta Token Reset**
      const resetToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // Token sah 15 minit
      await user.save();
  
      // **Hantar Emel**
      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const resetURL = `http://localhost:5000/reset-password/${resetToken}`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Reset Password",
        text: `Klik pautan berikut untuk reset password: ${resetURL}. Link ini sah selama 15 minit.`,
      };
  
      await transporter.sendMail(mailOptions);
      res.json({ message: "Emel reset password telah dihantar!" });
  
    } catch (error) {
      res.status(500).json({ message: "Ralat menghantar emel", error });
      console.error(error.message);
    }
  };
  
  // **2️⃣ Reset Password**
  export const resetPassword = async (req, res) => {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;
  
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }, // Token masih sah?
      });
  
      if (!user) return res.status(400).json({ message: "Token tidak sah atau telah tamat" });
  
      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      await auditLogger(user._id, "RESET_PASSWORD", "Pengguna telah reset kata laluan");
  
      res.json({ message: "Kata laluan berjaya ditukar!" });
  
    } catch (error) {
      res.status(500).json({ message: "Ralat reset password", error });
    }
  };