const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SuperAdmin = require("../model/SuperAdmin");
const User = require("../model/registerUser/UserScehma");

async function handleSuperAdminLogin(req, res) {
  try {
    let { email, password } = req.body;
    const superAdminExist = await SuperAdmin.findOne({ email });
    if (!superAdminExist) {
      return res.status(404).json({ message: "Super Admin not found" });
    }
    const correctPass = await bcrypt.compare(
      password,
      superAdminExist.password
    );
    if (!correctPass) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: superAdminExist._id, role: superAdminExist.role }, // this is the data we convert into token
      process.env.JWT_SECRET_KEY, // secret key (stored in .env)
      { expiresIn: "24h" } // optional expiry time
    );

    res.cookie("accessToken", token, {
      httpOnly: true, //It's a security flag. It means JavaScript running in the browser cannot read this cookie.
      secure: process.env.NODE_ENV === "production", //The cookie will be sent only over HTTPS connections if this is true.
      sameSite: "None", //Can work on different domains ex- we have separate frontend domain as well as backend domain
      maxAge: 24 * 60 * 60 * 1000, // 24 hour
    });

    return res.status(200).json({
      message: `Welcome back ${superAdminExist.name}`,
    });
  } catch (err) {
    console.error(err);
    if (err.name === "MongoError") {
      return res.status(500).json({ message: "Database error" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function handleSuperAdminGetLoginPage(req, res) {
  try {
    console.log("Welcome to super admin login page");
    res.send("Hello super Admin");
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

/*
async function handleRegisterAdmin(req, res) {
  try {
    // Get SuperAdmin ID from params (or token)
    const { id } = req.params; // super admin id from URL
    const { name, email, password } = req.body; // admin details from body

    // Verify if SuperAdmin exists
    const isSuperAdmin = await SuperAdmin.findById(id);
    if (!isSuperAdmin) {
      return res
        .status(400)
        .json({ message: "This Super Admin doesn't exist" });
    }

    // Check if admin with same email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ message: "Admin with this email already exists" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new Admin
    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      createdBy: isSuperAdmin._id, // optional: to track who created
    });

    // Return success response
    res.status(201).json({
      message: "Admin registered successfully!",
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
*/

async function handelGetAllAdmins(req, res) {
  try {
    const admins = await User.find({ role: "Admin" }).select("-password -__v"); // exclude sensitive info
    if (admins.length == 0)
      return res.status(404).json({ message: "No admin exists" });
    return res
      .status(200)
      .json({ message: "Successfully retrieved all admins", admins });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
}

async function handleDeleteAdmin(req, res) {
  try {
    const { id } = req.params;
    const { password } = req.body;
    // Get logged-in superadmin from JWT payload (added by verifyToken)
    const superAdminId = req.user.id;

    // Fetch the superadmin from DB
    const superAdmin = await SuperAdmin.findById(superAdminId);
    if (!superAdmin)
      return res.status(403).json({ message: "Unauthorized access" });

    // Compare entered password with stored hash
    const isPasswordMatch = await bcrypt.compare(password, superAdmin.password);
    if (!isPasswordMatch)
      return res
        .status(400)
        .json({ message: "Incorrect password. Deletion not authorized." });

    // Now verify that target user is actually an admin
    const adminToDelete = await User.findById(id);
    if (!adminToDelete)
      return res.status(404).json({ message: "Admin not found" });

    if (adminToDelete.role !== "Admin")
      return res.status(403).json({ message: "Target user is not an admin" });

    // Finally, delete
    await User.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ message: "Admin deleted successfully", deletedAdminId: id });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
}

async function handleUpdateAdmin(req, res) {
  try {
    const { id } = req.params;
    const { role, name, email, password } = req.body;

    const admin = await User.findById(id);

    if (!admin) return res.status(404).json({ message: "User not found" });
    if (admin.role !== "Admin")
      return res
        .status(400)
        .json({ message: "The user you're trying to update is not admin" });

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (name) admin.name = name;
    if (email) admin.email = email;
    if (role) admin.role = role;
    if (password) {
      admin.password = await bcrypt.hash(password, 10);
    }

    await admin.save();

    const { password: _, __v, ...safeAdmin } = admin.toObject();

    return res.status(200).json({
      message: "Admin updated sucessfully",
      admin: safeAdmin,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
}

async function handleGetSystemStats(req, res) {
  try {
    // Get counts grouped by role
    const [totalUsers, totalAdmins, totalTeachers, totalStudents, totalAlumni] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "Admin" }),
        User.countDocuments({ role: "Teacher" }),
        User.countDocuments({ role: "Student" }),
        User.countDocuments({ role: "Alumni" }),
      ]);

    // Optional: Add counts from other collections
    // const [totalEvents, totalMentorships] = await Promise.all([
    //   Event?.countDocuments?.() || 0,
    //   Mentorship?.countDocuments?.() || 0,
    // ]);

    // // Optional: Calculate new users in last 7 days
    // const oneWeekAgo = new Date();
    // oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    // const newUsersThisWeek = await User.countDocuments({
    //   createdAt: { $gte: oneWeekAgo },
    // });

    // // Combine into one object
    // const stats = {
    //   users: {
    //     total: totalUsers,
    //     admins: totalAdmins,
    //     teachers: totalTeachers,
    //     students: totalStudents,
    //     alumni: totalAlumni,
    //     newThisWeek: newUsersThisWeek,
    //   },
    //   system: {
    //     totalEvents,
    //     totalMentorships,
    //     serverTime: new Date(),
    //   },
    // };

    // Calculate new users in last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    const stats = {
      users: {
        total: totalUsers,
        admins: totalAdmins,
        teachers: totalTeachers,
        students: totalStudents,
        alumni: totalAlumni,
        newThisWeek: newUsersThisWeek,
      },
    };

    res
      .status(200)
      .json({ message: "System stats fetched successfully", stats });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching system stats", error: err.message });
  }
}

module.exports = {
  handleSuperAdminLogin,
  handleSuperAdminGetLoginPage,
  handelGetAllAdmins,
  handleDeleteAdmin,
  handleUpdateAdmin,
  handleGetSystemStats
};
