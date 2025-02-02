// # Get course exercises
// GET /api/exercises/course/courseId
// Response: [
//   {
//     "title": "Find XSS Vulnerability",
//     "description": "...",
//     "difficulty": "easy",
//     "progress": {
//       "status": "not_started",
//       "attempts": []
//     }
//   }
// ]

// # Submit exercise
// POST /api/exercises/exerciseId/submit
// Body: {
//   "answer": "<script>alert('xss')</script>"
// }
// Response: {
//   "correct": true,
//   "pointsEarned": 15,
//   "progress": {
//     "status": "completed",
//     "attempts": [...]
//   }
// }

const express = require("express");
const router = express.Router();
const { auth, roleAuth } = require("../middleware/auth");
const Exercise = require("../models/Exercise");
const Progress = require("../models/Progress");

/**
 * @swagger
 * /api/exercises/course/{courseId}:
 *   get:
 *     tags: [Exercises]
 *     summary: Get exercises for a course
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
 *         description: List of exercises with progress
 *
 * /api/exercises/{exerciseId}/submit:
 *   post:
 *     tags: [Exercises]
 *     summary: Submit exercise solution
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exerciseId
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
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Exercise submission result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 correct:
 *                   type: boolean
 *                 pointsEarned:
 *                   type: integer
 *                 progress:
 *                   type: object
 */

// Get exercises for a course
router.get("/course/:courseId", auth, async (req, res) => {
  try {
    const exercises = await Exercise.find({
      course: req.params.courseId,
      isActive: true,
    }).sort("difficulty");

    // Get user's progress
    const progress = await Progress.findOne({
      user: req.user.id,
      course: req.params.courseId,
    });

    const exercisesWithProgress = exercises.map((exercise) => ({
      ...exercise.toObject(),
      progress: progress?.exerciseProgress.find((p) =>
        p.exercise.equals(exercise._id)
      ) || { status: "not_started" },
    }));

    res.json(exercisesWithProgress);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching exercises" });
  }
});

// Submit exercise solution
router.post("/:exerciseId/submit", auth, async (req, res) => {
  try {
    const { answer } = req.body;
    const exercise = await Exercise.findById(req.params.exerciseId);

    if (!exercise) {
      return res.status(404).json({ msg: "Exercise not found" });
    }

    let progress = await Progress.findOne({
      user: req.user.id,
      course: exercise.course,
    });

    if (!progress) {
      return res.status(400).json({ msg: "Must be enrolled in course" });
    }

    // Validate answer
    const isCorrect = await validateAnswer(exercise, answer);
    let pointsEarned = isCorrect ? exercise.points : 0;

    // Update progress
    let exerciseProgress = progress.exerciseProgress.find((p) =>
      p.exercise.equals(exercise._id)
    );

    if (!exerciseProgress) {
      progress.exerciseProgress.push({
        exercise: exercise._id,
        status: isCorrect ? "completed" : "in_progress",
        attempts: [
          {
            answer,
            correct: isCorrect,
            pointsEarned,
          },
        ],
      });
    } else {
      exerciseProgress.attempts.push({
        answer,
        correct: isCorrect,
        pointsEarned,
      });

      if (isCorrect) {
        exerciseProgress.status = "completed";
        exerciseProgress.completedAt = Date.now();
      }
    }

    progress.totalPoints += pointsEarned;
    progress.lastUpdated = Date.now();
    await progress.save();

    res.json({
      correct: isCorrect,
      pointsEarned,
      progress: exerciseProgress,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error submitting exercise" });
  }
});

// Helper function to validate answers
async function validateAnswer(exercise, answer) {
  switch (exercise.solution.validation) {
    case "exact":
      return answer === exercise.solution.correctAnswer;
    case "regex":
      const regex = new RegExp(exercise.solution.correctAnswer);
      return regex.test(answer);
    case "function":
      // For custom validation functions
      const validateFn = new Function(
        "answer",
        exercise.solution.correctAnswer
      );
      return validateFn(answer);
    default:
      return false;
  }
}

module.exports = router;
