const fs = require("fs").promises;
const path = require("path");

const filePath = path.join(__dirname, "../sampleData", "userSampleData.json");

// Validate PRN or Employee ID using sample data
// async function validateUserFromSample(role, prn, emp_id) {
//   const data = await fs.readFile(filePath, "utf-8");
//   const users = JSON.parse(data);

//   if (role === "Teacher") {
//     return users.some((u) => u.role === "teacher" && u.employee_id === emp_id);
//   }
//   if (role === "Student" || role === "Alumni") {
//     return users.some(
//       (u) => u.role === role.toLowerCase() && u.prn_number === prn
//     );
//   }
//   return false;
// }

async function validateUserFromSample(role, prn, emp_id) {
  const data = await fs.readFile(filePath, "utf-8");
  const users = JSON.parse(data);

  const normalizedRole = role.toLowerCase();

  if (normalizedRole === "teacher" || normalizedRole === "admin") {
    return users.some((u) => (u.role === "teacher" || u.role === "admin") && (u.employe_id === emp_id || u.employee_id === emp_id));
  }
  if (normalizedRole === "student" || normalizedRole === "alumni") {
    return users.some((u) => u.role === normalizedRole && u.prn_number === prn);
  }
  return false;
}


// Validate password strength
function validatePassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{9,}$/;
  return regex.test(password);
}

// Validate email format
function validateEmail(email) {
  const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return regex.test(email);
}

async function getUserDetailsFromSample(role, prn, emp_id) {
  const data = await fs.readFile(filePath, "utf-8");
  const users = JSON.parse(data);
  const normalizedRole = role.toLowerCase();

  if (normalizedRole === "teacher" || normalizedRole === "admin") {
    return users.find((u) => u.role === "teacher" && (u.employe_id === emp_id || u.employee_id === emp_id));
  }
  if (normalizedRole === "student" || normalizedRole === "alumni") {
    return users.find((u) => u.role === normalizedRole && u.prn_number === prn);
  }
  return null;
}

module.exports = { validateUserFromSample, validatePassword, validateEmail, getUserDetailsFromSample };
