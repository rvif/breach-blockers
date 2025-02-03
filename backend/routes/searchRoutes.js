const express = require("express");
const router = express.Router();
const { auth, roleAuth } = require("../middleware/auth");
const Course = require("../models/Course");
const Exercise = require("../models/Exercise");
const Progress = require("../models/Progress");
const User = require("../models/User");

/**
 * @swagger
 * /api/search/courses:
 *   get:
 *     tags: [Search]
 *     summary: Search courses with filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query string
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of courses matching criteria
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/courses", auth, async (req, res) => {
  try {
    const {
      query,
      difficulty,
      category,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    // Build search criteria
    const searchCriteria = { isActive: true };
    if (query) {
      searchCriteria.$or = [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
      ];
    }
    if (difficulty) searchCriteria.difficulty = difficulty;
    if (category) searchCriteria.category = category;

    // Build sort options
    const sortOptions = {};
    sortOptions[sortBy] = order === "desc" ? -1 : 1;

    const courses = await Course.find(searchCriteria)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("creator", "name");

    const total = await Course.countDocuments(searchCriteria);

    res.json({
      courses,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Error searching courses" });
  }
});

// Search and filter exercises
router.get("/exercises", auth, async (req, res) => {
  try {
    const {
      query,
      type, // code_analysis, packet_analysis, etc.
      difficulty,
      courseId,
      completed,
      sort = "title",
      page = 1,
      limit = 10,
    } = req.query;

    let filter = { isActive: true };

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }

    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;
    if (courseId) filter.course = courseId;

    // Filter by completion status
    if (completed) {
      const progress = await Progress.findOne({
        user: req.user.id,
        course: courseId,
      });

      if (progress) {
        const completedExerciseIds = progress.exerciseProgress
          .filter((ep) => ep.completed)
          .map((ep) => ep.exercise);

        filter._id =
          completed === "true"
            ? { $in: completedExerciseIds }
            : { $nin: completedExerciseIds };
      }
    }

    let sortConfig = {};
    switch (sort) {
      case "difficulty":
        sortConfig = {
          difficulty: 1,
          title: 1,
        };
        break;
      case "points":
        sortConfig = { points: -1 };
        break;
      default:
        sortConfig = { title: 1 };
    }

    const exercises = await Exercise.find(filter)
      .sort(sortConfig)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("course", "name")
      .populate("creator", "name");

    const total = await Exercise.countDocuments(filter);

    res.json({
      exercises,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ msg: "Error searching exercises" });
  }
});

/**
 * @swagger
 * /api/search/users:
 *   get:
 *     tags: [Search]
 *     summary: Search users (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, admin, super]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: List of users matching criteria
 *       403:
 *         description: Insufficient permissions
 */
router.get("/users", auth, roleAuth(["admin", "super"]), async (req, res) => {
  try {
    const {
      query,
      role,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const searchCriteria = {};
    if (query) {
      searchCriteria.$or = [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ];
    }
    if (role) searchCriteria.role = role;

    const sortOptions = {};
    sortOptions[sortBy] = order === "desc" ? -1 : 1;

    const users = await User.find(searchCriteria)
      .select("-password -refreshToken")
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(searchCriteria);

    res.json({
      users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Error searching users" });
  }
});

module.exports = router;
