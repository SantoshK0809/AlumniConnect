const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./model/registerUser/UserScehma");
const Student = require("./model/Student");
const Alumni = require("./model/Alumni");
const DEPARTMENTS = require("./constants/departments");
const fs = require("fs").promises;
const path = require("path");

const MONGO_URI = "mongodb://127.0.0.1:27017/AlumniPortalDB";

const indianFirstNames = [
  "Aarav", "Rahul", "Arjun", "Priya", "Ananya", "Neha", "Rohit", "Vikram", 
  "Siddharth", "Amit", "Aditya", "Kunal", "Manish", "Rohan", "Sanjay", "Vivek", 
  "Anil", "Sunil", "Rajesh", "Ramesh", "Suresh", "Karthik", "Manoj", "Mahesh", 
  "Prakash", "Kiran", "Ravi", "Vijay", "Nisha", "Pooja", "Sneha", "Swati", 
  "Kavita", "Meera", "Ayesha", "Gaurav", "Harsh", "Ishaan", "Yash", "Tanvi"
];
const indianLastNames = [
  "Sharma", "Verma", "Gupta", "Patel", "Singh", "Kumar", "Rao", "Desai", 
  "Joshi", "Kadam", "Patil", "Pawar", "Deshmukh", "Chavan", "Kale", "Bhat", 
  "Reddy", "Nair", "Menon", "Iyer", "Chaudhary", "Das", "Bose", "Ghosh", "Mishra"
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateName() {
  return `${getRandomItem(indianFirstNames)} ${getRandomItem(indianLastNames)}`;
}

// PRN Format: 78[7 digits]K e.g., 78071028K
function generatePRN() {
  return `78${Math.floor(1000000 + Math.random() * 9000000)}K`;
}

async function seedData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");
    
    let sampleDataPath = path.join(__dirname, "sampleData", "userSampleData.json");
    let sampleDataString = await fs.readFile(sampleDataPath, "utf-8");
    let sampleData = JSON.parse(sampleDataString);
    let newSampleDataEntries = [];

    const defaultPassword = "Password@123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    // Seed 20 Students
    console.log("Seeding 20 Students...");
    for (let i = 0; i < 20; i++) {
        let name = generateName();
        let prn = generatePRN();
        let email = `${name.split(' ')[0].toLowerCase()}${Math.floor(Math.random() * 1000)}@student.test`;
        
        let newUser = await User.create({
            role: "Student",
            name,
            prn_number: prn,
            email,
            password: hashedPassword
        });
        
        await Student.create({
            user: newUser._id,
            department: getRandomItem(DEPARTMENTS),
            batch: 2024 - Math.floor(Math.random() * 4),
            contact: `98${Math.floor(10000000 + Math.random() * 90000000)}`
        });
        
        newSampleDataEntries.push({
            role: "student",
            prn_number: prn,
            name,
            email
        });
    }

    // Seed 20 Alumni
    console.log("Seeding 20 Alumni...");
    for (let i = 0; i < 20; i++) {
        let name = generateName();
        let prn = generatePRN();
        let email = `${name.split(' ')[0].toLowerCase()}${Math.floor(Math.random() * 1000)}@alumni.test`;
        
        let newUser = await User.create({
            role: "Alumni",
            name,
            prn_number: prn,
            email,
            password: hashedPassword
        });
        
        await Alumni.create({
            user: newUser._id,
            department: getRandomItem(DEPARTMENTS),
            graduationYear: 2010 + Math.floor(Math.random() * 10),
            contact: `98${Math.floor(10000000 + Math.random() * 90000000)}`
        });
        
        newSampleDataEntries.push({
            role: "alumni",
            prn_number: prn,
            name,
            email
        });
    }

    sampleData.push(...newSampleDataEntries);
    await fs.writeFile(sampleDataPath, JSON.stringify(sampleData, null, 2));
    console.log("Updated userSampleData.json");

    console.log("Successfully seeded 20 students and 20 alumni. Password for all is Password@123");
    
    process.exit(0);

  } catch (err) {
    console.error("Error seeding data: ", err);
    process.exit(1);
  }
}

seedData();
