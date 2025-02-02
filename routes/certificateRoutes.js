// # Issue certificate
// POST /api/certificates/issue/courseId
// Response: {
//   "msg": "Certificate issued successfully",
//   "certificate": {
//     "id": "cert_id",
//     "verificationCode": "...",
//     "issuedAt": "..."
//   },
//   "scores": {
//     "easy": 85,
//     "medium": 78,
//     "hard": 72
//   }
// }

// # Verify certificate
// GET /api/certificates/verify/verificationCode
// Response: {
//   "user": {
//     "name": "John Doe",
//     "email": "..."
//   },
//   "course": {
//     "name": "Web Security Fundamentals"
//   },
//   "issuedAt": "..."
// }

const express = require("express");
const router = express.Router();
const { auth, roleAuth } = require("../middleware/auth");
const Certificate = require("../models/Certificate");
const Course = require("../models/Course");
const Progress = require("../models/Progress");

/**
 * @swagger
 * /api/certificates/issue/{courseId}:
 *   post:
 *     tags: [Certificates]
 *     summary: Issue a certificate for completed course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Certificate issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 certificate:
 *                   $ref: '#/components/schemas/Certificate'
 *                 scores:
 *                   type: object
 *
 * /api/certificates/verify/{code}:
 *   get:
 *     tags: [Certificates]
 *     summary: Verify a certificate
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificate verification details
 *
 * /api/certificates/user/{userId}:
 *   get:
 *     tags: [Certificates]
 *     summary: Get user's certificates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user certificates
 */

// Issue certificate
router.post("/issue/:courseId", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ msg: "Course not found" });
    }

    // Check if certificate already exists
    const existingCert = await Certificate.findOne({
      user: req.user.id,
      course: req.params.courseId,
    });

    if (existingCert) {
      return res
        .status(400)
        .json({ msg: "Certificate already issued for this course" });
    }

    // Get user's progress
    const progress = await Progress.findOne({
      user: req.user.id,
      course: req.params.courseId,
    });

    if (!progress) {
      return res.status(400).json({ msg: "No progress found for this course" });
    }

    // Check if all difficulties are completed with passing scores
    const { easy, medium, hard } = progress.quizResults;
    const passingCriteria = course.passingCriteria;

    if (!easy.completed || !medium.completed || !hard.completed) {
      return res.status(400).json({
        msg: "All difficulty levels must be completed before certificate issuance",
        progress: progress.quizResults,
      });
    }

    if (
      easy.score < passingCriteria ||
      medium.score < passingCriteria ||
      hard.score < passingCriteria
    ) {
      return res.status(400).json({
        msg: `All quizzes must be passed with at least ${passingCriteria}% score`,
        scores: {
          easy: easy.score,
          medium: medium.score,
          hard: hard.score,
        },
      });
    }

    // Create certificate
    const certificate = new Certificate({
      user: req.user.id,
      course: req.params.courseId,
      completedDifficulties: ["easy", "medium", "hard"],
      quizScores: {
        easy: easy.score,
        medium: medium.score,
        hard: hard.score,
      },
    });

    await certificate.save();

    // Update progress to mark certificate as issued
    progress.certificateIssued = true;
    await progress.save();

    res.status(201).json({
      msg: "Certificate issued successfully",
      certificate,
      scores: {
        easy: easy.score,
        medium: medium.score,
        hard: hard.score,
      },
    });
  } catch (error) {
    console.error("Error issuing certificate:", error);
    res.status(500).json({ msg: "Error issuing certificate" });
  }
});

// Verify certificate
router.get(
  "/verify/:code",
  auth,
  roleAuth(["admin", "super"]),
  async (req, res) => {
    try {
      const certificate = await Certificate.findOne({
        verificationCode: req.params.code,
      })
        .populate("user", "name email")
        .populate("course", "name");

      if (!certificate) {
        return res.status(404).json({ msg: "Invalid certificate" });
      }

      res.json(certificate);
    } catch (error) {
      res.status(500).json({ msg: "Error verifying certificate" });
    }
  }
);

// Get user certificates
router.get("/user/:userId", auth, async (req, res) => {
  try {
    // Users can only view their own certificates unless they're admin/super
    if (
      req.user.id !== req.params.userId &&
      !["admin", "super"].includes(req.user.role)
    ) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const certificates = await Certificate.find({
      user: req.params.userId,
    }).populate("course", "name");
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching certificates" });
  }
});

module.exports = router;
