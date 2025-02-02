const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Check if email is verified
    if (!req.user.isEmailVerified) {
      return res.status(403).json({ msg: "Please verify your email first" });
    }

    next();
  } catch (err) {
    res.status(403).json({ msg: "Invalid token" });
  }
};

const roleAuth = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Access denied, insufficient role" });
    }
    next();
  };
};

module.exports = { auth, roleAuth };
