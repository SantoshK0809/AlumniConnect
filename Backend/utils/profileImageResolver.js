const StudentProfile = require("../model/Student");
const AlumniProfile = require("../model/Alumni");
const TeacherProfile = require("../model/Teacher");
const AdminProfile = require("../model/Admin");

/**
 * Resolve profile image URL from role-specific model
 * Note: Profile models use 'user' field (not 'userId') to reference User
 */
async function resolveProfileImage(userId, role) {
  try {
    switch (role) {
      case "Student": {
        const profile = await StudentProfile.findOne({ user: userId })
          .select("profileImage");
        const image = profile?.profileImage;
        // Student stores profileImage as { url, public_id }
        return image?.url || null;
      }

      case "Alumni": {
        const profile = await AlumniProfile.findOne({ user: userId })
          .select("profileImage");
        const image = profile?.profileImage;
        // Alumni stores profileImage as { url, public_id }
        return image?.url || null;
      }

      case "Teacher": {
        const profile = await TeacherProfile.findOne({ user: userId })
          .select("profileImage");
        const image = profile?.profileImage;
        // Teacher stores profileImage as { url, public_id }
        return image?.url || null;
      }

      case "Admin": {
        const profile = await AdminProfile.findOne({ user: userId })
          .select("profileImage");
        const image = profile?.profileImage;
        // Admin stores profileImage as a string
        return image || null;
      }

      default:
        return null;
    }
  } catch (err) {
    console.error(`Error resolving profile image for user ${userId} with role ${role}:`, err);
    return null;
  }
}

module.exports = resolveProfileImage;
