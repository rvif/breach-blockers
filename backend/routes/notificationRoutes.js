const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
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

// Get user's notifications with pagination
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, unreadOnly = false } = req.query;
    const query = { user: req.user.id };
    if (unreadOnly === "true") query.read = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching notifications" });
  }
});

// Mark notifications as read
router.put("/read", auth, async (req, res) => {
  try {
    const { notificationIds } = req.body;

    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        user: req.user.id,
      },
      { $set: { read: true } }
    );

    res.json({ msg: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ msg: "Error updating notifications" });
  }
});

// Delete notifications
router.delete("/", auth, async (req, res) => {
  try {
    const { notificationIds } = req.body;

    await Notification.deleteMany({
      _id: { $in: notificationIds },
      user: req.user.id,
    });

    res.json({ msg: "Notifications deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Error deleting notifications" });
  }
});

// Notification settings
router.put("/settings", auth, async (req, res) => {
  try {
    const {
      emailNotifications,
      progressReminders,
      courseUpdates,
      certificateNotifications,
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          notificationPreferences: {
            emailNotifications,
            progressReminders,
            courseUpdates,
            certificateNotifications,
          },
        },
      },
      { new: true }
    );

    res.json({
      msg: "Notification settings updated",
      preferences: user.notificationPreferences,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error updating notification settings" });
  }
});

// Utility functions for creating notifications
const notificationService = {
  async createNotification(userId, type, data) {
    try {
      const notification = new Notification({
        user: userId,
        type,
        data,
        read: false,
      });

      await notification.save();

      // Get user's notification preferences
      const user = await User.findById(userId);

      // Send email if enabled
      if (user.notificationPreferences?.emailNotifications) {
        const emailContent = this.getEmailContent(type, data);
        await sendEmail(user.email, emailContent.subject, emailContent.body);
      }

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  },

  getEmailContent(type, data) {
    const templates = {
      COURSE_UPDATE: {
        subject: `Course Update: ${data.courseName}`,
        body: `New content has been added to ${data.courseName}: ${data.updateDetails}`,
      },
      PROGRESS_REMINDER: {
        subject: "Course Progress Reminder",
        body: `Don't forget to continue your progress in ${data.courseName}. You're ${data.progress}% through!`,
      },
      CERTIFICATE_ISSUED: {
        subject: "New Certificate Issued",
        body: `Congratulations! You've earned a certificate for completing ${data.courseName}`,
      },
    };

    return (
      templates[type] || {
        subject: "New Notification",
        body: "You have a new notification in your learning platform",
      }
    );
  },
};

module.exports = { router, notificationService };
