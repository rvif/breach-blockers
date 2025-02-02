require("dotenv").config();
const mongoose = require("mongoose");
const Course = require("../models/Course");
const Exercise = require("../models/Exercise");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Check for required environment variables
if (!process.env.MONGO_URI) {
  console.error("ERROR: MONGO_URI is not defined in .env file");
  process.exit(1);
}

// Helper function to create slug from course name
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const sampleData = {
  users: [
    {
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
    },
    {
      name: "Test Student",
      email: "student@example.com",
      password: "student123",
      role: "student",
    },
  ],

  courses: [
    {
      name: "Web Security Fundamentals",
      slug: "web-security-fundamentals",
      description: "Learn the basics of web application security",
      thumbnail: "https://example.com/web-security.jpg",
      passingCriteria: 70,
      content: {
        easy: {
          sections: [
            {
              title: "Introduction to Web Security",
              markdown: `# Web Security Basics
Web security is crucial in today's interconnected world. In this section, we'll cover:
1. Common web vulnerabilities
2. Basic security concepts
3. Security best practices`,
              order: 1,
            },
          ],
          quiz: {
            title: "Web Security Basics Quiz",
            questions: [
              {
                question: "What is XSS?",
                options: [
                  "A styling framework",
                  "Cross-Site Scripting attack",
                  "Server configuration",
                  "Database query",
                ],
                correctAnswer: 1,
                explanation:
                  "XSS (Cross-Site Scripting) is a type of injection attack where malicious scripts are injected into trusted websites.",
              },
              {
                question: "Which of these is a common security header?",
                options: [
                  "X-Content-Type",
                  "Content-Security-Policy",
                  "X-Frame-Source",
                  "Security-Control",
                ],
                correctAnswer: 1,
                explanation:
                  "Content-Security-Policy (CSP) is a crucial security header that helps prevent various types of attacks.",
              },
            ],
            difficulty: "easy",
            passingScore: 70,
          },
        },
        medium: {
          sections: [
            {
              title: "Advanced XSS Prevention",
              markdown: `# Advanced XSS Prevention
Learn about advanced techniques to prevent XSS:
1. Content Security Policy (CSP)
2. Input Validation
3. Output Encoding`,
              order: 1,
            },
          ],
          quiz: {
            title: "Advanced Web Security Quiz",
            questions: [
              {
                question: "What is the purpose of CSP?",
                options: [
                  "To style web pages",
                  "To prevent resource loading from unauthorized sources",
                  "To compress images",
                  "To cache content",
                ],
                correctAnswer: 1,
                explanation:
                  "CSP helps prevent unauthorized resource loading and execution, mitigating XSS and other attacks.",
              },
              {
                question: "Which CSP directive prevents inline scripts?",
                options: [
                  "style-src",
                  "script-src 'none'",
                  "default-src",
                  "img-src",
                ],
                correctAnswer: 1,
                explanation:
                  "script-src directive controls which scripts can be executed.",
              },
            ],
            difficulty: "medium",
            passingScore: 75,
          },
        },
        hard: {
          sections: [
            {
              title: "Security Headers Deep Dive",
              markdown: `# Security Headers
Understanding and implementing security headers:
1. HSTS
2. CSP
3. X-Frame-Options
4. X-Content-Type-Options`,
              order: 1,
            },
          ],
          quiz: {
            title: "Expert Web Security Quiz",
            questions: [
              {
                question: "What is the purpose of HSTS?",
                options: [
                  "To compress HTTPS traffic",
                  "To force HTTPS connections",
                  "To validate certificates",
                  "To encrypt cookies",
                ],
                correctAnswer: 1,
                explanation:
                  "HTTP Strict Transport Security (HSTS) forces browsers to use HTTPS connections.",
              },
              {
                question: "Which header prevents clickjacking?",
                options: [
                  "X-Frame-Options",
                  "X-XSS-Protection",
                  "X-Content-Type",
                  "CSP-Frame",
                ],
                correctAnswer: 0,
                explanation:
                  "X-Frame-Options header controls whether a page can be embedded in frames, preventing clickjacking attacks.",
              },
            ],
            difficulty: "hard",
            passingScore: 80,
          },
        },
      },
    },
  ],

  exercises: [
    {
      title: "Find XSS Vulnerability",
      description:
        "Learn to identify and exploit XSS vulnerabilities in web applications",
      type: "web_security",
      difficulty: "easy",
      content: {
        instructions: `
# XSS Challenge

Review this code snippet and find the XSS vulnerability:

\`\`\`html
<div>
  Welcome, <%= username %>!
  <div id="message"></div>
</div>

<script>
  const msg = new URLSearchParams(window.location.search).get('message');
  document.getElementById('message').innerHTML = msg;
</script>
\`\`\`

Submit the payload that would execute an alert('xss') on the page.
        `,
        hints: [
          {
            text: "Look at how the message parameter is handled",
            pointDeduction: 5,
          },
          {
            text: "Think about HTML encoding",
            pointDeduction: 10,
          },
        ],
        resources: [],
      },
      solution: {
        type: "text",
        correctAnswer: "<script>alert('xss')</script>",
        validation: "exact",
      },
      points: 20,
    },
    {
      title: "Analyze Network Logs",
      description:
        "Practice identifying suspicious patterns in network access logs",
      type: "log_analysis",
      difficulty: "medium",
      content: {
        instructions: `
# Log Analysis Challenge

Review these log entries and identify the suspicious IP address:

\`\`\`
2024-03-15 10:15:23 192.168.1.100 GET /login.php
2024-03-15 10:15:25 192.168.1.100 POST /login.php
2024-03-15 10:15:30 192.168.1.100 GET /admin.php
2024-03-15 10:15:31 192.168.1.100 GET /config.php
2024-03-15 10:15:32 192.168.1.100 GET /backup.zip
2024-03-15 10:15:40 192.168.1.200 GET /login.php
\`\`\`

Which IP address shows signs of potential unauthorized access attempts?
        `,
        hints: [
          {
            text: "Look for rapid sequential requests",
            pointDeduction: 5,
          },
        ],
        resources: [],
      },
      solution: {
        type: "text",
        correctAnswer: "192.168.1.100",
        validation: "exact",
      },
      points: 30,
    },
    {
      title: "Basic Cryptography Challenge",
      description: "Learn about base64 encoding and practice decoding messages",
      type: "crypto",
      difficulty: "easy",
      content: {
        instructions: `
# Decode the Message

The following text has been encoded using base64:

\`\`\`
SGVsbG8sIHRoaXMgaXMgYSBzZWNyZXQgbWVzc2FnZSE=
\`\`\`

Decode this message and submit the plaintext.
        `,
        hints: [
          {
            text: "This is a common encoding method used in web applications",
            pointDeduction: 5,
          },
        ],
        resources: [],
      },
      solution: {
        type: "text",
        correctAnswer: "Hello, this is a secret message!",
        validation: "exact",
      },
      points: 15,
    },
  ],
};

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Exercise.deleteMany({});

    // Hash passwords for users
    const users = await Promise.all(
      sampleData.users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );

    // Create users
    const createdUsers = await User.create(users);
    console.log("Users created");

    // Create courses with admin as creator
    const coursesWithCreator = sampleData.courses.map((course) => ({
      ...course,
      creator: createdUsers[0]._id,
    }));

    const courses = await Course.create(coursesWithCreator);
    console.log("Courses created");

    // Create exercises with course reference
    const exercisesWithRefs = sampleData.exercises.map((exercise) => ({
      ...exercise,
      creator: createdUsers[0]._id,
      course: courses[0]._id,
      content: {
        ...exercise.content,
        resources: exercise.content.resources || [],
      },
    }));

    await Exercise.create(exercisesWithRefs);
    console.log("Exercises created");

    console.log("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    console.error("Error details:", error.message);
    process.exit(1);
  }
}

seedDatabase();
