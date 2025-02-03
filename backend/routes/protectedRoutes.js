// # Admin Dashboard Stats
// GET /api/protected/admin/stats
// Headers: {
//   "Authorization": "Bearer admin_token"
// }
// Response: {
//   "totalUsers": 150,
//   "totalCourses": 10,
//   "totalCertificates": 45,
//   "recentCourses": [
//     {
//       "name": "New Course",
//       "creator": {
//         "name": "Admin Name"
//       }
//     }
//   ]
// }

// # Student Dashboard
// GET /api/protected/student/dashboard
// Headers: {
//   "Authorization": "Bearer user_token"
// }
// Response: {
//   "inProgress": [
//     {
//       "course": {
//         "name": "Course Name",
//         "description": "Description"
//       },
//       "progress": 65
//     }
//   ],
//   "completed": [...],
//   "certificates": [...]
// }

// # Admin Course Management
// GET /api/protected/admin/courses
// Headers: {
//   "Authorization": "Bearer admin_token"
// }
// Response: [
//   {
//     "name": "Course Name",
//     "creator": {
//       "name": "Creator Name"
//     },
//     "studentsEnrolled": 25,
//     "certificatesIssued": 15
//   }
// ]

// # Super Admin User Management
// GET /api/protected/super/users
// Headers: {
//   "Authorization": "Bearer super_token"
// }
// Response: [
//   {
//     "name": "User Name",
//     "email": "user@example.com",
//     "role": "student",
//     "coursesEnrolled": 3,
//     "certificatesEarned": 2
//   }
// ]

const express = require("express");
const { auth, roleAuth } = require("../middleware/auth");
const User = require("../models/User");
const Course = require("../models/Course");
const Progress = require("../models/Progress");
const Certificate = require("../models/Certificate");

const router = express.Router();

/**
 * @swagger
 * /api/protected/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin dashboard statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                 totalCourses:
 *                   type: integer
 *                 totalCertificates:
 *                   type: integer
 *                 recentCourses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *
 * /api/protected/student/dashboard:
 *   get:
 *     tags: [Student]
 *     summary: Get student dashboard data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inProgress:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Progress'
 *                 completed:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Progress'
 *                 certificates:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Certificate'
 *
 * /api/protected/super/users/{userId}/role:
 *   patch:
 *     tags: [Admin]
 *     summary: Update user role (Super admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [student, admin]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       403:
 *         description: Not authorized or cannot modify own role
 *       404:
 *         description: User not found
 */

// Admin Dashboard Stats
router.get(
  "/admin/stats",
  auth,
  roleAuth(["admin", "super"]),
  async (req, res) => {
    try {
      const stats = {
        totalUsers: await User.countDocuments(),
        totalCourses: await Course.countDocuments({ isActive: true }),
        totalCertificates: await Certificate.countDocuments(),
        recentCourses: await Course.find({ isActive: true })
          .sort({ createdAt: -1 })
          .limit(5)
          .select("name creator")
          .populate("creator", "name"),
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ msg: "Error fetching admin stats" });
    }
  }
);

// Student Dashboard
router.get("/student/dashboard", auth, async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user.id })
      .populate("course", "name description")
      .sort({ lastUpdated: -1 });

    const certificates = await Certificate.find({ user: req.user.id }).populate(
      "course",
      "name"
    );

    res.json({
      inProgress: progress.filter((p) => !p.certificateIssued),
      completed: progress.filter((p) => p.certificateIssued),
      certificates,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching student dashboard" });
  }
});

// Admin Course Management
router.get(
  "/admin/courses",
  auth,
  roleAuth(["admin", "super"]),
  async (req, res) => {
    try {
      const courses = await Course.find()
        .populate("creator", "name")
        .sort({ createdAt: -1 });

      const courseStats = await Promise.all(
        courses.map(async (course) => {
          const studentsEnrolled = await Progress.countDocuments({
            course: course._id,
          });
          const certificatesIssued = await Certificate.countDocuments({
            course: course._id,
          });
          return {
            ...course.toObject(),
            studentsEnrolled,
            certificatesIssued,
          };
        })
      );

      res.json(courseStats);
    } catch (error) {
      res.status(500).json({ msg: "Error fetching course management data" });
    }
  }
);

// Super Admin User Management
router.get("/super/users", auth, roleAuth(["super"]), async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });

    const userStats = await Promise.all(
      users.map(async (user) => {
        const coursesEnrolled = await Progress.countDocuments({
          user: user._id,
        });
        const certificatesEarned = await Certificate.countDocuments({
          user: user._id,
        });
        return {
          ...user.toObject(),
          coursesEnrolled,
          certificatesEarned,
        };
      })
    );

    res.json(userStats);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching user management data" });
  }
});

// Update user role (Super admin only)
router.patch(
  "/super/users/:userId/role",
  auth,
  roleAuth(["super"]),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      // Prevent super admin from changing their own role
      if (userId === req.user.id) {
        return res.status(403).json({ msg: "Cannot modify your own role" });
      }

      // Validate role
      if (!["student", "admin"].includes(role)) {
        return res.status(400).json({ msg: "Invalid role" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      // Update role
      user.role = role;
      await user.save();

      res.json({
        msg: "User role updated successfully",
        user: { id: user._id, name: user.name, role: user.role },
      });
    } catch (error) {
      console.error("Role update error:", error);
      res.status(500).json({ msg: "Error updating user role" });
    }
  }
);

module.exports = router;
