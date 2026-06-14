const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./model/registerUser/UserScehma');
const Admin = require('./model/Admin');
require('dotenv').config();

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/AluminiConnect", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const email = "admin@alumniconnect.com";
    const password = "AdminPassword@123";
    const emp_id = "ADM001";

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Admin user already exists. Email:", email, "Password:", password);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      role: "Admin",
      name: "System Admin",
      email: email,
      password: hashedPassword,
      emp_id: emp_id,
      prn_number: null,
    });

    await Admin.create({
      user: user._id,
      emp_id: emp_id,
    });

    console.log("Admin successfully seeded!");
    console.log("------------------------");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Role: Admin");
    console.log("------------------------");

    process.exit(0);
  } catch (err) {
    console.error("Error seeding admin:", err);
    process.exit(1);
  }
}

seedAdmin();
