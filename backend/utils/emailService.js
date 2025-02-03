// utils/emailService.js
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const sendVerificationEmail = async (tempUser) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: tempUser.email,
      subject: "Verify Your Email - Br3achBl0ckers",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
            <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
              
              body {
                font-family: 'JetBrains Mono', monospace;
                margin: 0;
                padding: 0;
                background-color: #111111;
                color: #ffffff;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .card {
                background-color: #1a1a1a;
                border: 1px solid #00ff00;
                border-radius: 8px;
                padding: 32px;
                margin: 20px 0;
              }
              .logo {
                text-align: center;
                font-size: 24px;
                font-weight: 700;
                color: #00ff00;
                margin-bottom: 24px;
                font-family: 'JetBrains Mono', monospace;
              }
              .title {
                font-size: 20px;
                font-weight: 700;
                margin-bottom: 16px;
                color: #ffffff;
                font-family: 'JetBrains Mono', monospace;
              }
              .text {
                color: #cccccc;
                line-height: 1.5;
                margin-bottom: 24px;
                font-family: 'JetBrains Mono', monospace;
              }
              .otp {
                font-size: 32px;
                font-weight: 700;
                color: #00ff00;
                text-align: center;
                letter-spacing: 8px;
                margin: 32px 0;
                background-color: #1a1a1a;
                padding: 16px;
                border: 1px dashed #00ff00;
                border-radius: 4px;
                font-family: 'JetBrains Mono', monospace;
              }
              .footer {
                text-align: center;
                color: #666666;
                font-size: 12px;
                margin-top: 32px;
                font-family: 'JetBrains Mono', monospace;
              }
              .warning {
                color: #666666;
                font-size: 12px;
                margin-top: 24px;
                font-family: 'JetBrains Mono', monospace;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="card">
                <div class="logo">Br3achBl0ckers</div>
                <div class="title">Welcome to Br3achBl0ckers!</div>
                <div class="text">
                  To complete your registration, please use the following verification code:
                </div>
                <div class="otp">${tempUser.otp}</div>
                <div class="warning">
                  This code will expire in 15 minutes. If you didn't create an account with us, you can safely ignore this email.
                </div>
              </div>
              <div class="footer">
                © ${new Date().getFullYear()} Br3achBl0ckers. All rights reserved.<br>
                This is an automated message, please do not reply to this email.
              </div>
            </div>
          </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

const sendPasswordResetEmail = async (user) => {
  try {
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.PASSWORD_RESET_SECRET,
      { expiresIn: "1h" }
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request - Br3achBl0ckers",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
            <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
              
              body {
                font-family: 'JetBrains Mono', monospace;
                margin: 0;
                padding: 0;
                background-color: #111111;
                color: #ffffff;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .card {
                background-color: #1a1a1a;
                border: 1px solid #00ff00;
                border-radius: 8px;
                padding: 32px;
                margin: 20px 0;
              }
              .logo {
                text-align: center;
                font-size: 24px;
                font-weight: 700;
                color: #00ff00;
                margin-bottom: 24px;
                font-family: 'JetBrains Mono', monospace;
              }
              .title {
                font-size: 20px;
                font-weight: 700;
                margin-bottom: 16px;
                color: #ffffff;
                font-family: 'JetBrains Mono', monospace;
              }
              .text {
                color: #cccccc;
                line-height: 1.5;
                margin-bottom: 24px;
                font-family: 'JetBrains Mono', monospace;
              }
              .button {
                display: inline-block !important;
                background-color: #00ff00 !important;
                color: #000000 !important;
                padding: 12px 24px !important;
                text-decoration: none !important;
                border-radius: 4px !important;
                font-weight: 700 !important;
                margin: 16px 0 !important;
                font-family: 'JetBrains Mono', monospace !important;
                border: none !important;
                text-align: center !important;
                -webkit-text-decoration-color: #000000 !important;
                text-decoration-color: #000000 !important;
                -webkit-text-fill-color: #000000 !important;
              }
              a.button:link,
              a.button:visited,
              a.button:hover,
              a.button:active {
                color: #000000 !important;
                text-decoration: none !important;
                background-color: #00ff00 !important;
              }
              .footer {
                text-align: center;
                color: #666666;
                font-size: 12px;
                margin-top: 32px;
                font-family: 'JetBrains Mono', monospace;
              }
              .warning {
                color: #666666;
                font-size: 12px;
                margin-top: 24px;
                font-family: 'JetBrains Mono', monospace;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="card">
                <div class="logo">Br3achBl0ckers</div>
                <div class="title">Reset Your Password</div>
                <div class="text">
                  We received a request to reset your password. Click the button below to create a new password. If you didn't make this request, you can safely ignore this email.
                </div>
                <a href="${
                  process.env.FRONTEND_URL
                }/reset-password?token=${resetToken}" 
                   class="button" 
                   style="display: inline-block; background-color: #00ff00; color: #000000 !important; 
                          padding: 12px 24px; text-decoration: none; border-radius: 4px; 
                          font-weight: 700; margin: 16px 0; font-family: 'JetBrains Mono', monospace; 
                          border: none; text-align: center; -webkit-text-decoration-color: #000000; 
                          text-decoration-color: #000000; -webkit-text-fill-color: #000000;">
                  Reset Password
                </a>
                <div class="warning">
                  This link will expire in 1 hour for security reasons. If you need a new reset link, you can request one from the login page.
                </div>
              </div>
              <div class="footer">
                © ${new Date().getFullYear()} Br3achBl0ckers. All rights reserved.<br>
                This is an automated message, please do not reply to this email.
              </div>
            </div>
          </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  generateOTP,
};
