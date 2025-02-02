const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const sendVerificationEmail = async (user) => {
  const verificationToken = jwt.sign(
    { id: user._id },
    process.env.EMAIL_VERIFICATION_SECRET,
    { expiresIn: "24h" }
  );

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Verify Your Email",
    html: `
      <h1>Welcome to BreachBlockers!</h1>
      <p>Please click the link below to verify your email:</p>
      <a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (user) => {
  const resetToken = jwt.sign(
    { id: user._id },
    process.env.PASSWORD_RESET_SECRET,
    { expiresIn: "1h" }
  );

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Password Reset Request",
    html: `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
