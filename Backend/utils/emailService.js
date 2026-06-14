const nodemailer = require("nodemailer");

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail", // You can use other services or generic SMTP config
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

/**
 * Sends an email using nodemailer
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - Email body in HTML
 */
const sendEmail = async (to, subject, htmlContent) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email config missing. Skipping email send to:", to);
      return;
    }

    const info = await transporter.sendMail({
      from: `"AlumniConnect" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const getWelcomeTemplate = (name) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
  <h2 style="color: #4f46e5; text-align: center;">Welcome to AlumniConnect!</h2>
  <p style="font-size: 16px; color: #333;">Hello <strong>${name}</strong>,</p>
  <p style="font-size: 16px; color: #555;">We are thrilled to have you on board! You have successfully registered for the AlumniConnect platform. Start building your network, connecting with peers, and exploring new opportunities today.</p>
  <div style="text-align: center; margin-top: 30px;">
    <a href="http://localhost:5173/login" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Log In Now</a>
  </div>
  <p style="font-size: 12px; color: #aaa; margin-top: 40px; text-align: center;">If you didn't create this account, please ignore this email.</p>
</div>
`;

const getLoginAlertTemplate = (name) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
  <h2 style="color: #ea580c; border-bottom: 2px solid #ea580c; padding-bottom: 10px;">Security Alert: New Login</h2>
  <p style="font-size: 16px; color: #333;">Hi <strong>${name}</strong>,</p>
  <p style="font-size: 16px; color: #555;">We detected a new login to your AlumniConnect account on <strong>${new Date().toLocaleString()}</strong>.</p>
  <p style="font-size: 16px; color: #555;">If this was you, no further action is required.</p>
  <p style="font-size: 14px; color: #d97706; background-color: #fef3c7; padding: 10px; border-left: 4px solid #d97706;">If you do not recognize this activity, please change your password immediately.</p>
</div>
`;

const getPostConfirmationTemplate = (name, postContent) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
  <h2 style="color: #16a34a;">Your Post is Live!</h2>
  <p style="font-size: 16px; color: #333;">Hi <strong>${name}</strong>,</p>
  <p style="font-size: 16px; color: #555;">Your new post has been successfully published to the AlumniConnect feed.</p>
  <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; font-style: italic; color: #4b5563; margin: 20px 0;">
    "${postContent.substring(0, 100)}${postContent.length > 100 ? '...' : ''}"
  </div>
  <p style="font-size: 16px; color: #555;">Check out what others are saying on the dashboard!</p>
</div>
`;

const getConnectionRequestTemplate = (recipientName, senderName) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
  <h2 style="color: #2563eb;">New Connection Request</h2>
  <p style="font-size: 16px; color: #333;">Hi <strong>${recipientName}</strong>,</p>
  <p style="font-size: 16px; color: #555;">You have a new connection request from <strong>${senderName}</strong> on AlumniConnect.</p>
  <div style="text-align: center; margin-top: 30px;">
    <a href="http://localhost:5173/network" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Request</a>
  </div>
</div>
`;

const getOtpTemplate = (otpCode) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
  <h2 style="color: #4f46e5; text-align: center;">Verify Your Email</h2>
  <p style="font-size: 16px; color: #333; text-align: center;">You are almost there! Please use the following One-Time Password (OTP) to complete your registration for AlumniConnect.</p>
  <div style="text-align: center; margin: 30px 0;">
    <span style="display: inline-block; padding: 15px 30px; font-size: 24px; font-weight: bold; color: #4f46e5; background-color: #e0e7ff; border-radius: 8px; letter-spacing: 4px;">
      ${otpCode}
    </span>
  </div>
  <p style="font-size: 14px; color: #777; text-align: center;">This code will expire in 10 minutes.</p>
  <p style="font-size: 12px; color: #aaa; margin-top: 40px; text-align: center;">If you didn't request this, please ignore this email.</p>
</div>
`;

const getPasswordResetOtpTemplate = (otpCode) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
  <h2 style="color: #dc2626; text-align: center;">Password Reset Request</h2>
  <p style="font-size: 16px; color: #333; text-align: center;">We received a request to reset your AlumniConnect password. Use the following One-Time Password (OTP) to proceed.</p>
  <div style="text-align: center; margin: 30px 0;">
    <span style="display: inline-block; padding: 15px 30px; font-size: 24px; font-weight: bold; color: #dc2626; background-color: #fee2e2; border-radius: 8px; letter-spacing: 4px;">
      ${otpCode}
    </span>
  </div>
  <p style="font-size: 14px; color: #777; text-align: center;">This code will expire in 10 minutes.</p>
  <p style="font-size: 14px; color: #d97706; background-color: #fef3c7; padding: 10px; border-left: 4px solid #d97706;">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
</div>
`;

module.exports = {
  sendEmail,
  getWelcomeTemplate,
  getLoginAlertTemplate,
  getPostConfirmationTemplate,
  getConnectionRequestTemplate,
  getOtpTemplate,
  getPasswordResetOtpTemplate,
};
