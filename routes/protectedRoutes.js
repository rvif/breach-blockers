const express = require("express");
const { auth, roleAuth } = require("../middleware/auth"); // Import both auth and roleAuth

const router = express.Router();

// 🔹 Admin-only route
router.get("/admin", auth, roleAuth(["admin"]), (req, res) => {
  res.json({ msg: "Welcome, Admin!" });
});

// 🔹 Teachers and Admins can access
router.get("/teacher", auth, roleAuth(["teacher", "admin"]), (req, res) => {
  res.json({ msg: "Welcome, Teacher!" });
});

// 🔹 All authenticated users can access
router.get("/student", auth, (req, res) => {
  res.json({ msg: "Welcome, Student!" });
});

module.exports = router;
