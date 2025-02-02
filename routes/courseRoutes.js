// # Get all courses
// GET /api/courses
// Response: [
//   {
//     "name": "Web Security Fundamentals",
//     "description": "Learn web security basics",
//     "creator": {
//       "name": "Admin User"
//     }
//   }
// ]

// # Get course by slug and difficulty
// GET /api/courses/web-security-fundamentals/easy
// Response: {
//   "name": "Web Security Fundamentals",
//   "description": "...",
//   "content": {
//     "sections": [...],
//     "quiz": {...}
//   }
// }

// # Create course (admin)
// POST /api/courses
// Body: {
//   "name": "New Course",
//   "description": "Course description",
//   "content": {...}
// }
// Response: {
//   "id": "course_id",
//   "name": "New Course",
//   ...
// }

const express = require("express");
const router = express.Router();
const { auth, roleAuth } = require("../middleware/auth");
const Course = require("../models/Course");
const Certificate = require("../models/Certificate");

/**
 * @swagger
 * /api/courses:
 *   get:
 *     tags: [Courses]
 *     summary: Get all courses
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
 *         description: Items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     current:
 *                       type: integer
 *
 *   post:
 *     tags: [Courses]
 *     summary: Create a new course (Admin only)
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
 *               - description
 *               - category
 *               - difficulty
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               difficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *     responses:
 *       201:
 *         description: Course created successfully
 *       403:
 *         description: Not authorized
 */

// Get all courses (public)
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true })
      .select("name description")
      .populate("creator", "name");
    res.json(courses);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching courses" });
  }
});

// Get course by name and difficulty
router.get("/:slug/:difficulty?", auth, async (req, res) => {
  try {
    const { slug, difficulty } = req.params;
    const course = await Course.findOne({ slug, isActive: true }).populate(
      "creator",
      "name"
    );

    if (!course) {
      return res.status(404).json({ msg: "Course not found" });
    }

    if (difficulty) {
      if (!["easy", "medium", "hard"].includes(difficulty)) {
        return res.status(400).json({ msg: "Invalid difficulty level" });
      }
      // Return specific difficulty content
      res.json({
        name: course.name,
        description: course.description,
        content: course.content[difficulty],
      });
    } else {
      res.json(course);
    }
  } catch (error) {
    res.status(500).json({ msg: "Error fetching course" });
  }
});

// Create new course (admin only)
router.post("/", auth, roleAuth(["admin", "super"]), async (req, res) => {
  try {
    const course = new Course({
      ...req.body,
      creator: req.user.id,
    });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ msg: "Error creating course" });
  }
});

// Update course (admin only)
router.put("/:slug", auth, roleAuth(["admin", "super"]), async (req, res) => {
  try {
    const course = await Course.findOneAndUpdate(
      { slug: req.params.slug },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!course) {
      return res.status(404).json({ msg: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ msg: "Error updating course" });
  }
});

// Delete course (admin only)
router.delete(
  "/:slug",
  auth,
  roleAuth(["admin", "super"]),
  async (req, res) => {
    try {
      const course = await Course.findOneAndUpdate(
        { slug: req.params.slug },
        { isActive: false },
        { new: true }
      );
      if (!course) {
        return res.status(404).json({ msg: "Course not found" });
      }
      res.json({ msg: "Course deleted successfully" });
    } catch (error) {
      res.status(500).json({ msg: "Error deleting course" });
    }
  }
);

module.exports = router;
