import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Akses ditolak. Token diperlukan!" });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = decoded; // Simpan data user dalam req
    next();
  } catch (error) {
    res.status(401).json({ message: "Token tidak sah!" });
  }
};

export default authMiddleware;
