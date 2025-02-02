// # Submit quiz
// POST /api/quiz/submit/courseId/easy
// Body: {
//   "answers": [1, 0, 2, 1]
// }
// Response: {
//   "msg": "Quiz passed successfully!",
//   "score": 85,
//   "passed": true,
//   "results": [
//     {
//       "questionIndex": 0,
//       "isCorrect": true,
//       "correctAnswer": 1,
//       "explanation": "..."
//     }
//   ],
//   "progress": {...},
//   "eligibleForCertificate": false
// }

// # Get quiz progress
// GET /api/quiz/progress/courseId
// Response: {
//   "quizResults": {
//     "easy": { "completed": true, "score": 85, "attempts": 1 },
//     "medium": { "completed": false, "score": 0, "attempts": 0 },
//     "hard": { "completed": false, "score": 0, "attempts": 0 }
//   }
// }

const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const Course = require("../models/Course");
const Progress = require("../models/Progress");

/**
 * @swagger
 * /api/quiz/{courseId}/{difficulty}:
 *   get:
 *     tags: [Quiz]
 *     summary: Get quiz for a course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: difficulty
 *         required: true
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *     responses:
 *       200:
 *         description: Quiz questions
 *
 * /api/quiz/submit/{courseId}/{difficulty}:
 *   post:
 *     tags: [Quiz]
 *     summary: Submit quiz answers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: difficulty
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
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Quiz results
 */

// Submit quiz attempt
router.post("/submit/:courseId/:difficulty", auth, async (req, res) => {
  try {
    const { courseId, difficulty } = req.params;
    const { answers } = req.body;

    // Validate difficulty
    if (!["easy", "medium", "hard"].includes(difficulty)) {
      return res.status(400).json({ msg: "Invalid difficulty level" });
    }

    // Get course and validate
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ msg: "Course not found" });
    }

    // Get quiz questions for the specified difficulty
    const quiz = course.content[difficulty].quiz;
    if (!quiz) {
      return res.status(404).json({ msg: "Quiz not found" });
    }

    // Validate answers format
    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return res.status(400).json({ msg: "Invalid answers format" });
    }

    // Calculate score
    let correctAnswers = 0;
    const results = answers.map((answer, index) => {
      const question = quiz.questions[index];
      const isCorrect = answer === question.correctAnswer;
      if (isCorrect) correctAnswers++;
      return {
        questionIndex: index,
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      };
    });

    const score = (correctAnswers / quiz.questions.length) * 100;
    const passed = score >= course.passingCriteria;

    // Update progress
    let progress = await Progress.findOne({
      user: req.user.id,
      course: courseId,
    });

    if (!progress) {
      progress = new Progress({
        user: req.user.id,
        course: courseId,
      });
    }

    // Update quiz results for the specific difficulty
    progress.quizResults[difficulty] = {
      completed: true,
      score: score,
      attempts: (progress.quizResults[difficulty]?.attempts || 0) + 1,
    };

    progress.lastUpdated = Date.now();
    await progress.save();

    // Check if all difficulties are completed
    const allCompleted = ["easy", "medium", "hard"].every(
      (diff) =>
        progress.quizResults[diff]?.completed &&
        progress.quizResults[diff]?.score >= course.passingCriteria
    );

    res.json({
      msg: passed
        ? "Quiz passed successfully!"
        : "Quiz completed but did not meet passing criteria",
      score,
      passed,
      results,
      progress: progress.quizResults,
      eligibleForCertificate: allCompleted,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({ msg: "Error submitting quiz" });
  }
});

// Get quiz progress
router.get("/progress/:courseId", auth, async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user.id,
      course: req.params.courseId,
    });

    if (!progress) {
      return res.json({
        quizResults: {
          easy: { completed: false, score: 0, attempts: 0 },
          medium: { completed: false, score: 0, attempts: 0 },
          hard: { completed: false, score: 0, attempts: 0 },
        },
      });
    }

    res.json({ quizResults: progress.quizResults });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching progress" });
  }
});

module.exports = router;
