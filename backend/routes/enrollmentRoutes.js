// # Get User Enrollments
// GET /api/enrollments/my
// Headers: {
//   "Authorization": "Bearer user_token"
// }
// Response: [
//   {
//     "course": {
//       "name": "Course Name",
//       "description": "Course description",
//       "thumbnail": "url"
//     },
//     "status": "active",
//     "enrolledAt": "2024-03-20T...",
//     "lastAccessedAt": "2024-03-21T...",
//     "timeSpent": 45
//   }
// ]

// # Update Enrollment Status
// PATCH /api/enrollments/course_id/status
// Headers: {
//   "Authorization": "Bearer user_token"
// }
// Body: {
//   "status": "completed"
// }
// Response: {
//   "msg": "Enrollment status updated",
//   "enrollment": {
//     "status": "completed",
//     "completedAt": "2024-03-21T..."
//   }
// }

// # Update Activity Time
// PATCH /api/enrollments/course_id/activity
// Headers: {
//   "Authorization": "Bearer user_token"
// }
// Body: {
//   "timeSpentMinutes": 30
// }
// Response: {
//   "msg": "Activity updated",
//   "enrollment": {
//     "lastAccessedAt": "2024-03-21T...",
//     "timeSpent": 75
//   }
// }

const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const Progress = require("../models/Progress");

/**
 * @swagger
 * /api/enrollments/{courseId}:
 *   post:
 *     tags: [Enrollments]
 *     summary: Enroll in a course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully enrolled
 *
 *   delete:
 *     tags: [Enrollments]
 *     summary: Unenroll from a course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully unenrolled
 *
 * /api/enrollments/my:
 *   get:
 *     tags: [Enrollments]
 *     summary: Get user's enrollments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of enrollments
 *
 * /api/enrollments/{courseId}/status:
 *   patch:
 *     tags: [Enrollments]
 *     summary: Update enrollment status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
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
 *               status:
 *                 type: string
 *                 enum: [active, completed, dropped]
 *     responses:
 *       200:
 *         description: Status updated successfully
 */

// Enroll in a course
router.post("/:courseId", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ msg: "Course not found" });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({ msg: "Already enrolled in this course" });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      user: req.user.id,
      course: req.params.courseId,
    });
    await enrollment.save();

    // Initialize progress tracking
    const progress = new Progress({
      user: req.user.id,
      course: req.params.courseId,
    });
    await progress.save();

    res.json({ msg: "Successfully enrolled in course", enrollment });
  } catch (error) {
    console.error("Enrollment error:", error);
    res.status(500).json({ msg: "Error enrolling in course" });
  }
});

// Get user's enrollments
router.get("/my", auth, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id })
      .populate("course", "name description thumbnail")
      .sort("-enrolledAt");

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching enrollments" });
  }
});

// Update enrollment status
router.patch("/:courseId/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "completed", "dropped"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId,
    });

    if (!enrollment) {
      return res.status(404).json({ msg: "Enrollment not found" });
    }

    enrollment.status = status;
    if (status === "completed") {
      enrollment.completedAt = Date.now();
    }
    await enrollment.save();

    res.json({ msg: "Enrollment status updated", enrollment });
  } catch (error) {
    res.status(500).json({ msg: "Error updating enrollment status" });
  }
});

// Update last accessed time and time spent
router.patch("/:courseId/activity", auth, async (req, res) => {
  try {
    const { timeSpentMinutes } = req.body;

    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId,
    });

    if (!enrollment) {
      return res.status(404).json({ msg: "Enrollment not found" });
    }

    enrollment.lastAccessedAt = Date.now();
    if (timeSpentMinutes) {
      enrollment.timeSpent += Number(timeSpentMinutes);
    }
    await enrollment.save();

    res.json({ msg: "Activity updated", enrollment });
  } catch (error) {
    res.status(500).json({ msg: "Error updating activity" });
  }
});

// Unenroll from a course
router.delete("/:courseId", auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId,
    });

    if (!enrollment) {
      return res.status(404).json({ msg: "Enrollment not found" });
    }

    // Instead of deleting, mark as dropped
    enrollment.status = "dropped";
    await enrollment.save();

    res.json({ msg: "Successfully unenrolled from course" });
  } catch (error) {
    res.status(500).json({ msg: "Error unenrolling from course" });
  }
});

module.exports = router;
