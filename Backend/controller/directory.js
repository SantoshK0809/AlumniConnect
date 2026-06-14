const mongoose = require("mongoose");
const User = require("../model/registerUser/UserScehma");
const Connection = require("../modules/connections/connectionSchema");

async function handleGetDirectory(req, res) {
  try {
    const userRole = req.user?.role?.toLowerCase();
    const { role: requestedRole, search } = req.query;

    // Access control
    let allowedRoles = [];
    if (userRole === 'student') {
      allowedRoles = ['alumni'];
    } else if (userRole === 'alumni') {
      allowedRoles = ['student'];
    } else if (userRole === 'teacher' || userRole === 'admin') {
      allowedRoles = ['student', 'alumni'];
    } else {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    if (!allowedRoles.includes(requestedRole?.toLowerCase())) {
      return res.status(403).json({ message: "You cannot access this directory" });
    }

    // Build query
    let query = { role: new RegExp(`^${requestedRole}$`, 'i') };
    const userId = req.user?.id;
    
    if (userId) {
      query._id = { $ne: userId };
    }

    if (search) {
      query.name = new RegExp(search, 'i'); // Search by name (case-insensitive)
    }

    const users = await User.find(query).select("-password -__v").sort({ name: 1 });

    // Fetch connections involving the current user
    const connections = await Connection.find({
      $or: [{ requesterId: userId }, { recipientId: userId }]
    });

    const currentUserIdStr = userId.toString();

    const usersWithStatus = users.map(u => {
      const userObj = u.toObject();
      const targetUserIdStr = u._id.toString();

      const conn = connections.find(c => 
        (c.requesterId.toString() === currentUserIdStr && c.recipientId.toString() === targetUserIdStr) ||
        (c.requesterId.toString() === targetUserIdStr && c.recipientId.toString() === currentUserIdStr)
      );

      return {
        ...userObj,
        connectionStatus: conn ? conn.status : "NONE",
        isRequester: conn ? conn.requesterId.toString() === currentUserIdStr : false
      };
    });

    res.status(200).json({
      message: "Directory retrieved successfully",
      users: usersWithStatus
    });
  } catch (err) {
    console.error("Error fetching directory:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
}

module.exports = {
  handleGetDirectory
};
