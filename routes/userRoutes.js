// routes/userRoutes.js
// Admin/Super User Management API Tests

// 1. Get All Users (Super Admin)
// GET /api/users
// Headers: {
//   "Authorization": "Bearer super_token"
// }
// Success Response (200): [
//   {
//     "id": "user_id_1",
//     "name": "John Doe",
//     "email": "john@example.com",
//     "role": "student",
//     "isEmailVerified": true,
//     "createdAt": "2024-03-20T..."
//   },
//   {
//     "id": "user_id_2",
//     "name": "Admin User",
//     "email": "admin@example.com",
//     "role": "admin",
//     "isEmailVerified": true,
//     "createdAt": "2024-03-19T..."
//   }
// ]
// Error Response (403): {
//   "msg": "Access denied, insufficient role"
// }

// 2. Update User Role (Super Admin)
// PATCH /api/users/user_id/role
// Headers: {
//   "Authorization": "Bearer super_token"
// }
// Body: {
//   "role": "admin"
// }
// Success Response (200): {
//   "msg": "Role updated successfully",
//   "user": {
//     "id": "user_id",
//     "name": "John Doe",
//     "email": "john@example.com",
//     "role": "admin",
//     "isEmailVerified": true
//   }
// }
// Error Responses:
// (400): { "msg": "Invalid role" }
// (400): { "msg": "Cannot modify your own role" }
// (404): { "msg": "User not found" }

// 3. Delete User (Super Admin)
// DELETE /api/users/user_id
// Headers: {
//   "Authorization": "Bearer super_token"
// }
// Success Response (200): {
//   "msg": "User deleted successfully"
// }
// Error Responses:
// (400): { "msg": "Cannot delete your own account" }
// (404): { "msg": "User not found" }

const express = require("express");
const User = require("../models/User");
const { auth, roleAuth } = require("../middleware/auth");
const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Users per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, admin, super]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     current:
 *                       type: integer
 *       403:
 *         description: Not authorized
 *
 *   post:
 *     tags: [Users]
 *     summary: Create new user (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, admin]
 *     responses:
 *       201:
 *         description: User created successfully
 *       403:
 *         description: Not authorized
 *
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *
 *   put:
 *     tags: [Users]
 *     summary: Update user (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, admin]
 *     responses:
 *       200:
 *         description: User updated successfully
 *
 *   delete:
 *     tags: [Users]
 *     summary: Delete user (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 */

// Get all users (super only)
router.get("/", auth, roleAuth(["super"]), async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });
    res.json(users); // Bio will be included in the response
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

// Get user by username
router.get("/:username", auth, async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.username }).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Users can only view their own profile unless they're admin/super
    if (
      user._id.toString() !== req.user.id &&
      !["admin", "super"].includes(req.user.role)
    ) {
      return res
        .status(403)
        .json({ msg: "Access denied, insufficient permissions" });
    }

    res.json(user); // Bio will be included in the response
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

// Update user role (super only)
router.patch("/:userId/role", auth, roleAuth(["super"]), async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ["student", "admin", "super"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ msg: "Invalid role" });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ msg: "Cannot modify your own role" });
    }

    user.role = role;
    await user.save();

    res.json({
      msg: "Role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

// Update user profile (owner or super)
router.put("/:userId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Only allow users to update their own profile unless they're super
    if (user._id.toString() !== req.user.id && req.user.role !== "super") {
      return res
        .status(403)
        .json({ msg: "Access denied, insufficient permissions" });
    }

    const allowedUpdates = ["name", "bio"];
    const updates = Object.keys(req.body)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    // Validate bio length
    if (updates.bio && updates.bio.length > 100) {
      return res
        .status(400)
        .json({ msg: "Bio must be 100 characters or less" });
    }

    Object.assign(user, updates);
    await user.save();

    res.json({
      msg: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

// Delete user (super only)
router.delete("/:userId", auth, roleAuth(["super"]), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ msg: "Cannot delete your own account" });
    }

    await user.deleteOne();
    res.json({ msg: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
