const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendEmail } = require("../utils/emailService");

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get user notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *         description: Filter unread notifications
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       message:
 *                         type: string
 *                       read:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *
 *   put:
 *     tags: [Notifications]
 *     summary: Mark notifications as read
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notificationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Notifications marked as read
 */

class NotificationService {
  static async createNotification(userId, type, data) {
    try {
      const notification = new Notification({
        user: userId,
        type,
        data,
        read: false,
      });

      await notification.save();

      // Get user preferences
      const user = await User.findById(userId);
      if (user.notificationPreferences?.emailNotifications) {
        await this.sendEmailNotification(user.email, type, data);
      }

      return notification;
    } catch (error) {
      console.error("Notification creation error:", error);
      throw error;
    }
  }

  static async sendEmailNotification(email, type, data) {
    const template = this.getEmailTemplate(type, data);
    await sendEmail(email, template.subject, template.body);
  }

  static getEmailTemplate(type, data) {
    const templates = {
      COURSE_UPDATE: {
        subject: `Course Update: ${data.courseName}`,
        body: `
          Hello,
          
          New content has been added to ${data.courseName}:
          ${data.updateDetails}
          
          Log in to check it out!
        `,
      },
      PROGRESS_REMINDER: {
        subject: "Continue Your Learning Journey",
        body: `
          Hello,
          
          Don't forget to continue your progress in ${data.courseName}.
          You're ${data.progress}% through the course!
          
          Keep up the great work!
        `,
      },
      CERTIFICATE_ISSUED: {
        subject: "🎉 New Certificate Earned!",
        body: `
          Congratulations!
          
          You've earned a certificate for completing ${data.courseName}.
          Log in to view and download your certificate.
          
          Keep learning and growing!
        `,
      },
    };

    return (
      templates[type] || {
        subject: "New Notification",
        body: "You have a new notification in your learning platform",
      }
    );
  }
}

// Example notification triggers
const notificationTriggers = {
  // Course update trigger
  async onCourseUpdate(courseId, updateDetails) {
    try {
      const course = await Course.findById(courseId).populate(
        "enrolledStudents"
      );

      const notifications = course.enrolledStudents.map((student) =>
        NotificationService.createNotification(student._id, "COURSE_UPDATE", {
          courseName: course.name,
          updateDetails,
        })
      );

      await Promise.all(notifications);
    } catch (error) {
      console.error("Course update notification error:", error);
    }
  },

  // Progress reminder trigger
  async checkAndSendProgressReminders() {
    try {
      const threshold = 7; // days
      const date = new Date();
      date.setDate(date.getDate() - threshold);

      const inactiveEnrollments = await Enrollment.find({
        lastAccessedAt: { $lt: date },
        status: "active",
      }).populate("user course");

      const notifications = inactiveEnrollments.map((enrollment) =>
        NotificationService.createNotification(
          enrollment.user._id,
          "PROGRESS_REMINDER",
          {
            courseName: enrollment.course.name,
            progress: enrollment.progress,
          }
        )
      );

      await Promise.all(notifications);
    } catch (error) {
      console.error("Progress reminder error:", error);
    }
  },

  // Certificate notification trigger
  async onCertificateIssued(userId, courseId) {
    try {
      const course = await Course.findById(courseId);
      await NotificationService.createNotification(
        userId,
        "CERTIFICATE_ISSUED",
        {
          courseName: course.name,
        }
      );
    } catch (error) {
      console.error("Certificate notification error:", error);
    }
  },
};

module.exports = { NotificationService, notificationTriggers };
