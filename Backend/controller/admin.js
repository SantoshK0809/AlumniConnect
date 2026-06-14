const User = require("../model/registerUser/UserScehma");
const Student = require("../model/Student");
const Alumni = require("../model/Alumni");
const Teacher = require("../model/Teacher");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

// Example: replace later with actual DB model
async function getAllAdmins(req, res) {
  res.send("Get all Admins");
}

async function getAdminById(req, res) {
  try {
    const { id } = req.params;
    res.send(`Get Admin with ID: ${id}`);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function createAdmin(req, res) {
  try {
    const data = req.body;
    res.send(`Create Admin with data: ${JSON.stringify(data)}`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function updateAdmin(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    res.send(`Update Admin ${id} with data: ${JSON.stringify(data)}`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function deleteAdmin(req, res) {
  try {
    const { id } = req.params;
    res.send(`Delete Admin with ID: ${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function handleGetAllUsers(req, res) {
  try {
    const id = req.user?.id;
    const admin = await User.findById(id);

    if (!admin)
      return res.status(404).json({ message: "Admin not found" });

    if (admin.role?.toLowerCase() !== "admin")
      return res.status(403).json({ message: "Access denied. Admins only." });

    // Fetch users by role
    const students = await User.find({ role: "Student" }).select("-password -__v");
    const teachers = await User.find({ role: "Teacher" }).select("-password -__v");
    const alumni = await User.find({ role: "Alumni" }).select("-password -__v");

    res.status(200).json({
      message: "Users successfully retrieved",
      counts: {
        total: students.length + teachers.length + alumni.length,
        students: students.length,
        teachers: teachers.length,
        alumni: alumni.length,
      },
      users: {
        students,
        teachers,
        alumni,
      },
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({
      message: "Internal server error while fetching users",
    });
  }
}

async function handleDeleteUser(req, res) {
  try {
    const adminId = req.user?.id;
    const admin = await User.findById(adminId);
    
    if (!admin || admin.role?.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { id } = req.params;
    const userToDelete = await User.findById(id);
    
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    const role = userToDelete.role;
    
    // Delete associated profile
    if (role === "Student") {
      await Student.deleteOne({ user: id });
    } else if (role === "Alumni") {
      await Alumni.deleteOne({ user: id });
    } else if (role === "Teacher") {
      await Teacher.deleteOne({ user: id });
    }

    // Delete the user record
    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function handleGetAdminDashboardData(req, res) {
  try {
    const students = await User.countDocuments({ role: "Student" });
    const teachers = await User.countDocuments({ role: "Teacher" });
    const alumni = await User.countDocuments({ role: "Alumni" });

    const dashboardData = {
      stats: [
        { label: "Total Users", value: students + teachers + alumni },
        { label: "Students", value: students },
        { label: "Alumni", value: alumni },
        { label: "Teachers", value: teachers }
      ],
      activities: [
        {
          type: "system",
          title: "System Check",
          description: "All systems operational",
          timestamp: "Just now"
        }
      ]
    };

    res.status(200).json({
      message: "Admin dashboard data retrieved successfully",
      data: dashboardData
    });
  } catch (err) {
    console.error("Error fetching admin dashboard data:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function handleCsvUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const results = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", resolve)
        .on("error", reject);
    });

    fs.unlinkSync(filePath);

    if (results.length === 0) {
      return res.status(400).json({ message: "CSV file is empty" });
    }

    const dataPath = path.join(__dirname, "../sampleData", "userSampleData.json");
    const fileContent = await fs.promises.readFile(dataPath, "utf-8");
    const existingUsers = JSON.parse(fileContent);

    let addedCount = 0;
    
    for (const row of results) {
      const newRole = (row.role || "").toLowerCase().trim();
      const newEmail = (row.email || "").trim();
      const newPrn = (row.prn_number || "").trim();
      const newEmpId = (row.employe_id || row.employee_id || "").trim();
      const newName = (row.name || "").trim();

      if (!newRole || !newName || !newEmail) continue;

      let isDuplicate = false;
      if (newRole === "teacher" || newRole === "admin") {
        isDuplicate = existingUsers.some(u => 
          (u.role === "teacher" || u.role === "admin") && 
          (u.employe_id === newEmpId || u.employee_id === newEmpId)
        );
      } else {
        isDuplicate = existingUsers.some(u => 
          u.role === newRole && u.prn_number === newPrn
        );
      }

      if (!isDuplicate) {
        existingUsers.push({
          role: newRole,
          prn_number: newPrn || undefined,
          employe_id: newEmpId || undefined,
          name: newName,
          email: newEmail
        });
        addedCount++;
      }
    }

    await fs.promises.writeFile(dataPath, JSON.stringify(existingUsers, null, 2));

    return res.status(200).json({ 
      message: `CSV Processed successfully. Added ${addedCount} new records.`,
      addedCount
    });

  } catch (err) {
    console.error("CSV Upload Error:", err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).json({ message: "Failed to process CSV file", error: err.message });
  }
}

module.exports = {
  getAdminById,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  handleGetAllUsers,
  handleDeleteUser,
  handleGetAdminDashboardData,
  handleCsvUpload,
};
