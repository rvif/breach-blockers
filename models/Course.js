const mongoose = require("mongoose");

const ContentSectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  markdown: { type: String, required: true },
  order: { type: Number, required: true },
});

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [
    {
      question: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctAnswer: { type: Number, required: true }, // Index of correct option
      explanation: { type: String },
    },
  ],
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  passingScore: { type: Number, required: true, default: 70 }, // Percentage needed to pass
});

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: { type: String, required: true },
  thumbnail: { type: String }, // URL to course thumbnail
  passingCriteria: {
    type: Number,
    default: 40, // 40% passing criteria
    min: 0,
    max: 100,
  },
  content: {
    easy: {
      sections: [ContentSectionSchema],
      quiz: QuizSchema,
    },
    medium: {
      sections: [ContentSectionSchema],
      quiz: QuizSchema,
    },
    hard: {
      sections: [ContentSectionSchema],
      quiz: QuizSchema,
    },
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create slug from name before saving
CourseSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Course", CourseSchema);
