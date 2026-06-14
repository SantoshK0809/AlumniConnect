const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/registerUser/UserScehma");
const Alumni = require("../model/Alumni");
const Teacher = require("../model/Teacher");
const Student = require("../model/Student");
const {
  validateUserFromSample,
  validatePassword,
  validateEmail,
  getUserDetailsFromSample,
} = require("../utils/userRegistrationValidator");
const SuperAdmin = require("../model/SuperAdmin");
const Otp = require("../model/OtpModel");
const { sendEmail, getWelcomeTemplate, getLoginAlertTemplate, getOtpTemplate, getPasswordResetOtpTemplate } = require("../utils/emailService");

async function handleRegisterUsers(req, res) {
  try {
    const { role, name, prn_number, emp_id, email, password, otp } = req.body;
    console.log("request body :", req.body);
    
    // Basic field check
    if (!role || !name || !email || !password || !otp)
      return res.status(400).json({ error: "All fields including OTP are required" });

    // Validate OTP
    const existingOtp = await Otp.findOne({ email, otp });
    if (!existingOtp) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Validate PRN or Employee ID
    const isValid = await validateUserFromSample(role, prn_number, emp_id);
    if (!isValid)
      return res.status(400).json({
        error: `Invalid ${
          role === "Teacher" ? "Employee ID" : "PRN Number"
        } for ${role}`,
      });

    // Check for vaild
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ error: "Please enter a valid email address" });
    }

    // Check for duplicate email
    const orConditions = [{ email }];
    if (prn_number) orConditions.push({ prn_number });
    if (emp_id) orConditions.push({ emp_id });

    const existing = await User.findOne({ $or: orConditions });

    if (existing) {
      return res.status(409).json({ error: "User already registered" });
    }

    // Validate password
    if (!validatePassword(password))
      return res.status(400).json({
        error:
          "Password must be at least 9 characters long and include uppercase, lowercase, number, and special character",
      });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Save user
    await User.create({
      // role: normalizedRole,
      role,
      name,
      email,
      password: hashed,
      prn_number: prn_number || null,
      emp_id: emp_id || null,
    });

    // Send Welcome Email asynchronously
    sendEmail(email, "Welcome to AlumniConnect!", getWelcomeTemplate(name));

    // Delete OTP after successful registration
    await Otp.deleteMany({ email });

    res.status(201).json({ message: "Registration successful!" });
  } catch (err) {
    console.error("Registration Error:", err);

    // Handle duplicate key error (E11000)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({
        error: `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } already registered`,
      });
    }

    // Default server error
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

async function handleUserLogin(req, res) {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ message: "Invalid request format" });
    }

    console.log("Request body:", req.body);

    const { email, password, role } = req.body;
    const normalizedRole = role.toLowerCase();

    // Validate input
    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Email, password and role are required" });
    }

    // Check if user exists
    const user = await User.findOne({
      email,
      role: { $regex: new RegExp(`^${role}$`, "i") },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    console.log(user.role);

    // Compare entered password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Success
    /* return res.status(200).json({
      message: `Welcome back ${user.name}`,
      role: user.role,
    }); */

    const token = jwt.sign(
      { id: user._id, role: user.role }, // this is the data we convert into token
      process.env.JWT_SECRET_KEY, // secret key (stored in .env)
      { expiresIn: "24h" } // optional expiry time
    );

    res.cookie("accessToken", token, {
      httpOnly: true, //It's a security flag. It means JavaScript running in the browser cannot read this cookie.
      secure: process.env.NODE_ENV === "production", //The cookie will be sent only over HTTPS connections if this is true.
      sameSite: "Lax", //Can work on different domains ex- we have separate frontend domain as well as backend domain
      maxAge: 24 * 60 * 60 * 1000, // 24 hour
    });

    // Resolve profile image for all roles
    let profileImage = null;
    const profileSelect = "-__v -isActive -verified -createdAt -updatedAt";

    if (user.role === "Student") {
      const student = await Student.findOne({ user: user._id }).select(profileSelect);
      profileImage = student?.profileImage || null;
    } else if (user.role === "Alumni") {
      const alumni = await Alumni.findOne({ user: user._id }).select(profileSelect);
      profileImage = alumni?.profileImage || null;
    } else if (user.role === "Teacher") {
      const teacher = await Teacher.findOne({ user: user._id }).select(profileSelect);
      profileImage = teacher?.profileImage || null;
    } else if (user.role === "Admin") {
      const Admin = require("../model/Admin");
      const admin = await Admin.findOne({ user: user._id }).select(profileSelect);
      profileImage = admin?.profileImage || null;
    }

    // Normalize profileImage to { url, public_id } or null
    if (profileImage && typeof profileImage === "string") {
      profileImage = { url: profileImage, public_id: null };
    }

    // Send Login Alert asynchronously
    sendEmail(user.email, "Security Alert: New Login", getLoginAlertTemplate(user.name));

    return res.status(200).json({
      message: `Welcome back ${user.name}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: profileImage,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// async function getUser(token) {
//   let user = req.cookie?.token;
//   try {
//     if (!user) res.status(400).json({ message: "Token is invalid" });
//     res.status(200).redirect(`/${user.role}/dashboard`);
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: "Server error", error: err.message });
//   }
// }

// Dead SSR page handlers removed — React frontend handles routing

/*
async function handleRegisterAdmin(req, res) {
  const token = req.cookies?.accessToken;
  if (!token)
    return res.status(401).json({ message: "Unauthorized: No token" });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const isSuperAdmin = await SuperAdmin.findById(user.id);

    if (!isSuperAdmin || user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Access denied: Not a SuperAdmin" });
    }
    const { role, emp_id, email, password, name } = req.body;

    if (!role || !emp_id || !email || !password || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await User.create({
      name: name,
      role: role,
      email: email,
      password: hashedPassword,
      emp_id: emp_id,
      createdBy: user.id,
    });

    return res.status(200).json({ message: "Created admin sucessfully." });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
}
*/

async function handleRegisterAdmin(req, res) {
  try {
    const { role, emp_id, email, password, name } = req.body;

    if (!role || !emp_id || !email || !password || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await User.create({
      name,
      role,
      email,
      password: hashedPassword,
      emp_id,
      createdBy: req.user.id, // because verifyToken put this on req.user
    });

    return res.status(201).json({
      message: "Admin created successfully.",
      admin: { name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
}

async function handleVerifyIdentity(req, res) {
  try {
    const { role, prn_number, emp_id } = req.body;
    if (!role || (!prn_number && !emp_id)) {
      return res.status(400).json({ error: "Role and either PRN or Employee ID are required" });
    }

    const user = await getUserDetailsFromSample(role, prn_number, emp_id);
    if (user) {
      return res.status(200).json({ name: user.name });
    } else {
      return res.status(404).json({ error: "Identity not found" });
    }
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}

async function handleGetPublicStats(req, res) {
  try {
    const alumniCount = await User.countDocuments({ role: { $regex: /^alumni$/i } });
    const studentCount = await User.countDocuments({ role: { $regex: /^student$/i } });
    const teacherCount = await User.countDocuments({ role: { $in: [/^teacher$/i, /^admin$/i] } });
    
    return res.status(200).json({
      alumni: alumniCount,
      students: studentCount,
      faculty: teacherCount,
      satisfaction: 95
    });
  } catch (err) {
    console.error("Error fetching public stats:", err);
    return res.status(500).json({ error: "Server error fetching stats" });
  }
}

async function handleSendRegistrationOtp(req, res) {
  try {
    const { role, email, prn_number, emp_id } = req.body;

    if (!role || !email) {
      return res.status(400).json({ error: "Role and email are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }

    const isValid = await validateUserFromSample(role, prn_number, emp_id);
    if (!isValid) {
      return res.status(400).json({
        error: `Invalid ${role === "Teacher" ? "Employee ID" : "PRN Number"} for ${role}`,
      });
    }

    const orConditions = [{ email }];
    if (prn_number) orConditions.push({ prn_number });
    if (emp_id) orConditions.push({ emp_id });
    const existing = await User.findOne({ $or: orConditions });
    if (existing) {
      return res.status(409).json({ error: "User already registered" });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ email });
    await Otp.create({ email, otp: otpCode });

    sendEmail(email, "Your AlumniConnect OTP", getOtpTemplate(otpCode));

    res.status(200).json({ message: "OTP sent to your email." });
  } catch (err) {
    console.error("Send OTP Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

async function handleForgotPasswordOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists with this email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "No account found with this email address" });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Clear any existing OTPs for this email and create new one
    await Otp.deleteMany({ email: email.toLowerCase() });
    await Otp.create({ email: email.toLowerCase(), otp: otpCode });

    // Send OTP email
    sendEmail(email, "Password Reset OTP - AlumniConnect", getPasswordResetOtpTemplate(otpCode));

    res.status(200).json({ message: "OTP sent to your email address." });
  } catch (err) {
    console.error("Forgot Password OTP Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

async function handleResetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, OTP, and new password are required" });
    }

    // Verify OTP
    const existingOtp = await Otp.findOne({ email: email.toLowerCase(), otp });
    if (!existingOtp) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Validate new password strength
    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        error: "Password must be at least 9 characters long and include uppercase, lowercase, number, and special character",
      });
    }

    // Find user and update password
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash new password and save
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Delete used OTP
    await Otp.deleteMany({ email: email.toLowerCase() });

    res.status(200).json({ message: "Password reset successfully! You can now login with your new password." });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

module.exports = {
  handleRegisterUsers,
  handleUserLogin,
  handleRegisterAdmin,
  handleVerifyIdentity,
  handleGetPublicStats,
  handleSendRegistrationOtp,
  handleForgotPasswordOtp,
  handleResetPassword,
};
