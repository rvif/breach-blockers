// # Get Course Analytics (Admin)
// GET /api/analytics/courses?courseId=course_id&timeframe=month
// Headers: {
//   "Authorization": "Bearer admin_token"
// }
// Response: {
//   "totalEnrollments": 150,
//   "completionRate": 75.5,
//   "averageTimeSpent": 120,
//   "quizStats": {
//     "easy": {
//       "averageScore": 85,
//       "completionRate": 95
//     },
//     "medium": {
//       "averageScore": 78,
//       "completionRate": 82
//     },
//     "hard": {
//       "averageScore": 72,
//       "completionRate": 68
//     }
//   }
// }

// # Get Platform Analytics (Admin)
// GET /api/analytics/courses
// Headers: {
//   "Authorization": "Bearer admin_token"
// }
// Response: {
//   "totalUsers": 1000,
//   "totalCourses": 25,
//   "totalEnrollments": 3500,
//   "courseStats": [
//     {
//       "name": "Popular Course",
//       "enrollments": 250,
//       "completionRate": 80
//     }
//   ],
//   "exerciseStats": [
//     {
//       "name": "Top Exercise",
//       "completions": 180,
//       "averageAttempts": 2.5
//     }
//   ]
// }

const express = require("express");
const router = express.Router();
const { auth, roleAuth } = require("../middleware/auth");
const Course = require("../models/Course");
const Exercise = require("../models/Exercise");
const Progress = require("../models/Progress");
const Enrollment = require("../models/Enrollment");

/**
 * @swagger
 * /api/analytics/courses:
 *   get:
 *     tags: [Analytics]
 *     summary: Get course or platform analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Optional course ID for specific course analytics
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *         description: Time period for analytics
 *     responses:
 *       200:
 *         description: Analytics data
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     totalEnrollments:
 *                       type: integer
 *                     completionRate:
 *                       type: number
 *                     averageTimeSpent:
 *                       type: number
 *                     quizStats:
 *                       type: object
 *                       properties:
 *                         easy:
 *                           type: object
 *                         medium:
 *                           type: object
 *                         hard:
 *                           type: object
 *                 - type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                     totalCourses:
 *                       type: integer
 *                     totalEnrollments:
 *                       type: integer
 *                     courseStats:
 *                       type: array
 *                     exerciseStats:
 *                       type: array
 *       403:
 *         description: Not authorized
 */

// Get course analytics (admin only)
router.get("/courses", [auth, roleAuth("admin")], async (req, res) => {
  try {
    const { courseId, timeframe } = req.query;
    let dateFilter = {};

    // Set timeframe filter
    if (timeframe) {
      const date = new Date();
      switch (timeframe) {
        case "week":
          date.setDate(date.getDate() - 7);
          break;
        case "month":
          date.setMonth(date.getMonth() - 1);
          break;
        case "year":
          date.setFullYear(date.getFullYear() - 1);
          break;
      }
      dateFilter.enrolledAt = { $gte: date };
    }

    // Course-specific analytics
    if (courseId) {
      const enrollments = await Enrollment.find({
        course: courseId,
        ...dateFilter,
      });

      const progress = await Progress.find({ course: courseId });

      const analytics = {
        totalEnrollments: enrollments.length,
        completionRate:
          (enrollments.filter((e) => e.status === "completed").length /
            enrollments.length) *
          100,
        averageTimeSpent:
          enrollments.reduce((avg, e) => avg + e.timeSpent, 0) /
          enrollments.length,
        quizStats: {
          easy: calculateQuizStats(progress, "easy"),
          medium: calculateQuizStats(progress, "medium"),
          hard: calculateQuizStats(progress, "hard"),
        },
      };

      res.json(analytics);
    }
    // Platform-wide analytics
    else {
      const totalUsers = await User.countDocuments();
      const totalCourses = await Course.countDocuments();
      const totalEnrollments = await Enrollment.countDocuments(dateFilter);

      const analytics = {
        totalUsers,
        totalCourses,
        totalEnrollments,
        courseStats: await getTopCourses(),
        exerciseStats: await getTopExercises(),
      };

      res.json(analytics);
    }
  } catch (error) {
    res.status(500).json({ msg: "Error fetching analytics" });
  }
});

// Helper functions
function calculateQuizStats(progress, difficulty) {
  const attempts = progress.filter(
    (p) => p.quizResults[difficulty].attempts > 0
  );
  return {
    averageScore:
      attempts.reduce((sum, p) => sum + p.quizResults[difficulty].score, 0) /
      attempts.length,
    totalAttempts: attempts.reduce(
      (sum, p) => sum + p.quizResults[difficulty].attempts,
      0
    ),
    passRate:
      (attempts.filter((p) => p.quizResults[difficulty].completed).length /
        attempts.length) *
      100,
  };
}

async function getTopCourses() {
  return await Enrollment.aggregate([
    {
      $group: {
        _id: "$course",
        enrollmentCount: { $sum: 1 },
        completionCount: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
      },
    },
    { $sort: { enrollmentCount: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "courseDetails",
      },
    },
    { $unwind: "$courseDetails" },
  ]);
}

async function getTopExercises() {
  return await Progress.aggregate([
    { $unwind: "$exerciseProgress" },
    {
      $group: {
        _id: "$exerciseProgress.exercise",
        completionCount: { $sum: 1 },
        averageAttempts: { $avg: { $size: "$exerciseProgress.attempts" } },
      },
    },
    { $sort: { completionCount: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "exercises",
        localField: "_id",
        foreignField: "_id",
        as: "exerciseDetails",
      },
    },
    { $unwind: "$exerciseDetails" },
  ]);
}

module.exports = router;
