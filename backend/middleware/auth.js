const jwt = require("jsonwebtoken");

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Check if email is verified
    if (!req.user.isEmailVerified) {
      return res.status(403).json({ msg: "Please verify your email first" });
    }

    next();
  } catch (error) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// Role-based authorization middleware
const roleAuth = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ msg: "Access denied, insufficient permissions" });
    }
    next();
  };
};

const superAuth = async (req, res, next) => {
  if (req.user.role !== "super") {
    return res
      .status(403)
      .json({ msg: "This operation requires super admin privileges" });
  }
  next();
};

module.exports = { auth, roleAuth, superAuth };
