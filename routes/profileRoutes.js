// Profile Management API Tests

// 1. Get User Profile
// GET /api/johndoe
// Headers: {
//   "Authorization": "Bearer access_token"
// }
// Success Response (Own Profile) (200): {
//   "user": {
//     "id": "user_id",
//     "name": "John Doe",
//     "email": "john@example.com",
//     "bio": "Full stack developer",
//     "preferences": {
//       "emailNotifications": true,
//       "progressReminders": true,
//       "difficultyPreference": "medium"
//     }
//   },
//   "stats": {
//     "completedCourses": 5,
//     "activeCourses": 2,
//     "totalPoints": 1250,
//     "averageScores": {
//       "easy": 92,
//       "medium": 85,
//       "hard": 78
//     }
//   }
// }

// 2. Update Profile
// PUT /api/johndoe
// Headers: {
//   "Authorization": "Bearer access_token"
// }
// Body: {
//   "name": "John Doe Updated",
//   "email": "john.new@example.com",
//   "bio": "Senior full stack developer"
// }
// Success Response (200): {
//   "msg": "Profile updated successfully",
//   "user": {...}
// }

// 3. Update Preferences
// PUT /api/johndoe/preferences
// Headers: {
//   "Authorization": "Bearer access_token"
// }
// Body: {
//   "emailNotifications": true,
//   "progressReminders": true,
//   "difficultyPreference": "hard"
// }
// Success Response (200): {
//   "msg": "Preferences updated",
//   "user": {...}
// }

// Error Cases:
// 404: { "msg": "User not found" }
// 403: { "msg": "Access denied" }
// 400: { "msg": "Email already in use" }
// 500: { "msg": "Error updating profile/preferences" }

const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const User = require("../models/User");
const Progress = require("../models/Progress");
const Enrollment = require("../models/Enrollment");
const bcrypt = require("bcryptjs");

/**
 * @swagger
 * /api/{username}:
 *   get:
 *     tags: [Profile]
 *     summary: Get user profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 stats:
 *                   type: object
 *                   properties:
 *                     completedCourses:
 *                       type: integer
 *                     activeCourses:
 *                       type: integer
 *                     totalPoints:
 *                       type: integer
 *                     averageScores:
 *                       type: object
 *
 *   put:
 *     tags: [Profile]
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
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
 *               bio:
 *                 type: string
 *               preferences:
 *                 type: object
 *                 properties:
 *                   emailNotifications:
 *                     type: boolean
 *                   progressReminders:
 *                     type: boolean
 *                   difficultyPreference:
 *                     type: string
 *                     enum: [easy, medium, hard]
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *
 * /api/{username}/preferences:
 *   put:
 *     tags: [Profile]
 *     summary: Update user preferences
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
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
 *               emailNotifications:
 *                 type: boolean
 *               progressReminders:
 *                 type: boolean
 *               difficultyPreference:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 */

// Get user profile
router.get("/:username", auth, async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.username }).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // If requesting own profile or admin/super, include detailed stats
    if (
      user._id.toString() === req.user.id ||
      ["admin", "super"].includes(req.user.role)
    ) {
      const enrollments = await Enrollment.find({ user: user._id });
      const progress = await Progress.find({ user: user._id });

      const stats = {
        completedCourses: enrollments.filter((e) => e.status === "completed")
          .length,
        activeCourses: enrollments.filter((e) => e.status === "active").length,
        totalPoints: progress.reduce((sum, p) => sum + p.totalPoints, 0),
        averageScores: calculateAverageScores(progress),
      };

      return res.json({
        user,
        stats,
      });
    }

    // For other users' profiles, return public info only
    res.json({
      user: {
        name: user.name,
        bio: user.bio,
        joinedAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching profile" });
  }
});

// Update profile
router.put("/:username", auth, async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.username });

    if (!user || user._id.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const { name, email, bio, preferences } = req.body;

    // Check if email is already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ msg: "Email already in use" });
      }
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) {
      updates.email = email;
      updates.isEmailVerified = false; // Require re-verification
    }
    if (bio) updates.bio = bio;
    if (preferences) updates.preferences = preferences;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updates },
      { new: true }
    ).select("-password -refreshToken");

    res.json({ msg: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ msg: "Error updating profile" });
  }
});

// Update preferences
router.put("/:username/preferences", auth, async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.username });

    if (!user || user._id.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const { emailNotifications, progressReminders, difficultyPreference } =
      req.body;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          "preferences.emailNotifications": emailNotifications,
          "preferences.progressReminders": progressReminders,
          "preferences.difficultyPreference": difficultyPreference,
        },
      },
      { new: true }
    ).select("-password -refreshToken");

    res.json({ msg: "Preferences updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ msg: "Error updating preferences" });
  }
});

// Helper function for calculating average scores
function calculateAverageScores(progress) {
  const quizScores = progress.reduce((scores, p) => {
    Object.entries(p.quizResults).forEach(([difficulty, result]) => {
      if (result.completed) {
        scores[difficulty] = scores[difficulty] || { total: 0, count: 0 };
        scores[difficulty].total += result.score;
        scores[difficulty].count++;
      }
    });
    return scores;
  }, {});

  return Object.entries(quizScores).reduce((avg, [diff, data]) => {
    avg[diff] = Math.round(data.total / data.count);
    return avg;
  }, {});
}

module.exports = router;
