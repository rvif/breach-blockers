const express = require("express");
const router = express.Router();
const { auth, roleAuth } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const PDFDocument = require("pdfkit");

// File handling & Image processing (multer, sharp, uuid, pdfkit)
/**
 * @swagger
 * /api/upload/profile/{userId}:
 *   post:
 *     tags: [Upload]
 *     summary: Upload profile picture
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 url:
 *                   type: string
 *
 * /api/upload/course/{courseId}:
 *   post:
 *     tags: [Upload]
 *     summary: Upload course materials
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               materials:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Course materials uploaded successfully
 *
 * /api/upload/certificate/{certificateId}:
 *   get:
 *     tags: [Upload]
 *     summary: Generate certificate PDF
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificate PDF generated
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.params.type; // 'profile', 'course', or 'certificate'
    const dir = `uploads/${type}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    profile: ["image/jpeg", "image/png"],
    course: ["application/pdf", "video/mp4", "image/jpeg", "image/png"],
    certificate: ["image/jpeg", "image/png"],
  };

  const type = req.params.type;
  if (allowedTypes[type].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Upload profile picture
router.post(
  "/profile/:userId",
  auth,
  upload.single("profile"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ msg: "No file uploaded" });
      }

      // Resize and optimize profile picture
      const optimizedPath = `${req.file.destination}/opt_${req.file.filename}`;
      await sharp(req.file.path)
        .resize(200, 200)
        .jpeg({ quality: 80 })
        .toFile(optimizedPath);

      // Update user profile picture URL
      const user = await User.findByIdAndUpdate(
        req.params.userId,
        { profilePicture: `/uploads/profile/opt_${req.file.filename}` },
        { new: true }
      );

      // Delete original file
      fs.unlinkSync(req.file.path);

      res.json({
        msg: "Profile picture uploaded successfully",
        url: user.profilePicture,
      });
    } catch (error) {
      res.status(500).json({ msg: "Error uploading profile picture" });
    }
  }
);

// Upload course material
router.post(
  "/course/:courseId",
  [auth, roleAuth(["admin", "super"])],
  upload.array("materials", 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ msg: "No files uploaded" });
      }

      const fileUrls = req.files.map((file) => ({
        url: `/uploads/course/${file.filename}`,
        type: file.mimetype,
        name: file.originalname,
      }));

      // Update course materials
      const course = await Course.findByIdAndUpdate(
        req.params.courseId,
        { $push: { materials: { $each: fileUrls } } },
        { new: true }
      );

      res.json({
        msg: "Course materials uploaded successfully",
        materials: fileUrls,
      });
    } catch (error) {
      res.status(500).json({ msg: "Error uploading course materials" });
    }
  }
);

// Generate certificate PDF
router.get("/certificate/:certificateId", auth, async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.certificateId)
      .populate("user", "name")
      .populate("course", "name");

    if (!certificate) {
      return res.status(404).json({ msg: "Certificate not found" });
    }

    // Create PDF
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
    });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=certificate-${certificate.verificationCode}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Add certificate content
    doc
      .font("Helvetica-Bold")
      .fontSize(30)
      .text("Certificate of Completion", { align: "center" });

    doc.moveDown();
    doc.fontSize(20).text(`This is to certify that`, { align: "center" });

    doc.moveDown();
    doc.fontSize(25).text(certificate.user.name, { align: "center" });

    doc.moveDown();
    doc
      .fontSize(20)
      .text(`has successfully completed the course`, { align: "center" });

    doc.moveDown();
    doc.fontSize(25).text(certificate.course.name, { align: "center" });

    doc.moveDown(2);
    doc
      .fontSize(15)
      .text(`Verification Code: ${certificate.verificationCode}`, {
        align: "center",
      });

    doc.moveDown();
    doc.text(`Issue Date: ${certificate.issuedAt.toLocaleDateString()}`, {
      align: "center",
    });

    // Finalize PDF
    doc.end();
  } catch (error) {
    res.status(500).json({ msg: "Error generating certificate" });
  }
});

module.exports = router;
