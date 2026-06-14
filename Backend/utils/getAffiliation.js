const StudentProfile = require("../model/Student");
const AlumniProfile = require("../model/Alumni");
const TeacherProfile = require("../model/Teacher");
const AdminProfile = require("../model/Admin");

/**
 * Get affiliation info based on user role
 * Returns a meaningful affiliation string for display in connections
 */
async function getAffiliation(userId, role) {
  try {
    switch (role) {
      case "Student": {
        const profile = await StudentProfile.findOne({ user: userId })
          .select("department batch");
        if (!profile) return "Student";
        return profile.batch ? `${profile.department} (Batch ${profile.batch})` : profile.department;
      }

      case "Alumni": {
        const profile = await AlumniProfile.findOne({ user: userId })
          .select("currentCompany department");
        if (!profile) return "Alumni";
        return profile.currentCompany || profile.department || "Alumni";
      }

      case "Teacher": {
        const profile = await TeacherProfile.findOne({ user: userId })
          .select("designation department");
        if (!profile) return "Teacher";
        return profile.designation || profile.department || "Teacher";
      }

      case "Admin": {
        const profile = await AdminProfile.findOne({ user: userId })
          .select("_id");
        return profile ? "Admin" : "Admin";
      }

      default:
        return role || "User";
    }
  } catch (err) {
    console.error(`Error getting affiliation for user ${userId} with role ${role}:`, err);
    return role; // fallback to just the role
  }
}

module.exports = getAffiliation;
