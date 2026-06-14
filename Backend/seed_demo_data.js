const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./model/registerUser/UserScehma");
const Student = require("./model/Student");
const Alumni = require("./model/Alumni");
const Teacher = require("./model/Teacher");
const Admin = require("./model/Admin");
const SuperAdmin = require("./model/SuperAdmin");
const Post = require("./model/Posts");
const DEPARTMENTS = require("./constants/departments");
const SPECIALIZATIONS = require("./constants/specializations");

const MONGO_URI = "mongodb://127.0.0.1:27017/AlumniPortalDB";

const indianNames = [
  "Aarav Sharma", "Rahul Verma", "Arjun Gupta", "Priya Patel", "Ananya Singh", 
  "Neha Kumar", "Rohit Rao", "Vikram Desai", "Siddharth Joshi", "Amit Kadam", 
  "Aditya Patil", "Kunal Pawar", "Manish Deshmukh", "Rohan Chavan", "Sanjay Kale",
  "Sneha Swati", "Kavita Swaminathan", "Meera Nair", "Ayesha Khan", "Gaurav Mishra"
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for Seeding...");

    // DROP collections
    const collections = ['users', 'students', 'alumnis', 'teachers', 'admins', 'posts', 'superadmins'];
    for (const col of collections) {
        try {
            await mongoose.connection.db.dropCollection(col);
            console.log(`Dropped collection: ${col}`);
        } catch (e) {
            console.log(`Collection ${col} not found.`);
        }
    }

    const plainPassword = "Password@123";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const userRecords = [];

    // 1. Seed Students (10)
    for (let i = 0; i < 10; i++) {
        const name = indianNames[i];
        const email = `${name.split(" ")[0].toLowerCase()}${i}@student.demo`;
        const user = await User.collection.insertOne({
            role: "Student",
            name,
            prn_number: `78000${1000+i}K`,
            email,
            password: hashedPassword,
            connectionsCount: 0,
            createdAt: new Date(), updatedAt: new Date()
        });
        await Student.collection.insertOne({
            user: user.insertedId, department: DEPARTMENTS[i%DEPARTMENTS.length],
            batch: 2024, verified: true, isActive: true,
            createdAt: new Date(), updatedAt: new Date()
        });
        userRecords.push({ id: user.insertedId, name, role: "Student" });
    }

    // 2. Seed Admin (1)
    const adminUser = await User.collection.insertOne({
        role: "Admin",
        name: indianNames[18],
        emp_id: "ADM1001",
        email: "ayesha18@admin.demo",
        password: hashedPassword,
        connectionsCount: 0,
        createdAt: new Date(), updatedAt: new Date()
    });
    await Admin.collection.insertOne({
        user: adminUser.insertedId,
        permissions: ["manageStudents", "manageTeachers", "manageAlumni", "viewReports"],
        verified: true, isActive: true,
        createdAt: new Date(), updatedAt: new Date()
    });

    // 3. Seed SuperAdmin (1)
    await SuperAdmin.collection.insertOne({
        name: "Super Admin",
        email: "superadmin@demo.com",
        password: hashedPassword,
        role: "superadmin",
        createdAt: new Date(), updatedAt: new Date()
    });

    // 4. Seed Posts (5)
    for (let i = 0; i < 5; i++) {
        const author = userRecords[i % userRecords.length];
        await Post.collection.insertOne({
            user: author.id, role: author.role, authorName: author.name,
            content: `Demo Post ${i+1}: Welcome to AluminiConnect!`,
            createdAt: new Date()
        });
    }

    console.log("✓ Seeding Completed.");
    console.log("Admin: ayesha18@admin.demo / Password@123");
    console.log("SuperAdmin: superadmin@demo.com / Password@123");

    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
