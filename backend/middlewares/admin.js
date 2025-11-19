const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.adminMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    req.admin = user; // attach admin user to request
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
