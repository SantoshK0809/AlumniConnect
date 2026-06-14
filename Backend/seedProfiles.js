const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./model/registerUser/UserScehma");
const Student = require("./model/Student");
const Alumni = require("./model/Alumni");
const Teacher = require("./model/Teacher");
const DEPARTMENTS = require("./constants/departments");
const SPECIALIZATIONS = require("./constants/specializations");

const MONGO_URI = "mongodb://127.0.0.1:27017/AlumniPortalDB";

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function getRandomItems(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, arr.length));
}

// ── Rich Profile Data ──────────────────────────────────────────────

const studentBios = [
  "Passionate about full-stack development and open-source contributions. Currently exploring cloud-native architectures and microservices.",
  "AI/ML enthusiast with a love for building intelligent systems. Active participant in coding competitions and hackathons.",
  "Aspiring software engineer focused on backend systems and distributed computing. Love solving complex algorithmic problems.",
  "Creative developer with a keen eye for UI/UX design. Building beautiful and accessible web applications.",
  "Data science enthusiast working on real-world projects using Python and TensorFlow. Interested in NLP and computer vision.",
  "Cybersecurity researcher exploring vulnerability assessment and ethical hacking. CTF competition regular.",
  "Mobile app developer specializing in React Native and Flutter. Published 3 apps on the Play Store.",
  "DevOps enthusiast learning Kubernetes, Docker, and CI/CD pipelines. Automating everything I can!",
  "Embedded systems hobbyist who loves working with Arduino and Raspberry Pi. Building IoT solutions for smart campuses.",
  "Blockchain developer exploring DeFi protocols and smart contract security. Active contributor to Web3 communities.",
];

const alumniBios = [
  "Senior Software Engineer at Google working on distributed systems. Mentor for campus placement preparation.",
  "Product Manager at Microsoft with 5+ years in the tech industry. Passionate about bridging the gap between academia and industry.",
  "Co-founder of a fintech startup disrupting digital payments in India. Always looking to hire talented juniors from my alma mater.",
  "Data Scientist at Amazon, specializing in recommendation systems. Open to mentoring students interested in ML careers.",
  "Full-stack developer turned engineering manager at Flipkart. Advocate for clean code and engineering best practices.",
];

const teacherBios = [
  "Professor with 15+ years of experience in Computer Science. Research interests include machine learning, NLP, and knowledge graphs.",
  "Associate Professor specializing in cybersecurity and network protocols. Published 30+ research papers in international journals.",
  "Assistant Professor passionate about teaching data structures and algorithms. Mentor for ACM-ICPC teams.",
];

const skillsPool = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "C++",
  "MongoDB", "PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS", "GCP",
  "TensorFlow", "PyTorch", "Machine Learning", "Deep Learning", "NLP",
  "GraphQL", "REST APIs", "Git", "Linux", "System Design", "Data Structures",
  "Flutter", "React Native", "Next.js", "Express.js", "Django",
  "Cybersecurity", "Blockchain", "Solidity", "CI/CD", "Agile",
];

const studentProjects = [
  "Smart Campus IoT Dashboard — Real-time monitoring of campus facilities using MQTT and React",
  "AI-Powered Resume Screener — NLP-based tool that ranks resumes for HR teams",
  "E-Commerce Platform — Full-stack MERN application with payment gateway integration",
  "Attendance Tracker using Face Recognition — OpenCV + Flask based attendance system",
  "Chat Application with End-to-End Encryption — Socket.io based secure messaging app",
  "Weather Forecast ML Model — LSTM-based weather prediction trained on 10 years of data",
  "Code Collaboration IDE — Real-time collaborative code editor using WebRTC and Monaco Editor",
  "Expense Tracker PWA — Progressive web app for personal finance management",
  "Alumni Connect Portal — Platform connecting students with alumni for mentorship",
  "Autonomous Line-Following Robot — Arduino-based robot with PID control",
];

const achievementPool = [
  "Winner — Smart India Hackathon 2024",
  "1st Place — TechFest Coding Competition",
  "Published research paper at IEEE International Conference",
  "Google Summer of Code 2024 participant",
  "Dean's List — Academic Excellence Award",
  "Top 100 — ICPC Asia Regionals",
  "Best Project Award — Final Year Project Exhibition",
  "Microsoft Learn Student Ambassador",
  "AWS Certified Cloud Practitioner",
  "Open Source Contributor — 500+ GitHub contributions",
  "National Level Science Olympiad — Gold Medal",
  "Best Paper Award — National Technical Symposium",
];

const companies = [
  "Google", "Microsoft", "Amazon", "Flipkart", "Infosys", "TCS", "Wipro",
  "Accenture", "Deloitte", "Goldman Sachs", "JPMorgan Chase", "Razorpay",
  "Zomato", "PhonePe", "Paytm", "Adobe", "Atlassian", "Oracle",
];

const positions = [
  "Software Engineer", "Senior Software Engineer", "Tech Lead",
  "Data Scientist", "Product Manager", "Engineering Manager",
  "DevOps Engineer", "Full Stack Developer", "ML Engineer",
  "Frontend Developer", "Backend Developer", "Solutions Architect",
];

const locations = [
  "Mumbai, India", "Bangalore, India", "Hyderabad, India", "Pune, India",
  "Delhi NCR, India", "Chennai, India", "Kolkata, India", "Ahmedabad, India",
  "San Francisco, USA", "Seattle, USA", "London, UK", "Singapore",
];

const qualifications = [
  "Ph.D. in Computer Science — IIT Bombay",
  "Ph.D. in Artificial Intelligence — IISc Bangalore",
  "M.Tech in Information Security — IIT Delhi",
  "Ph.D. in Data Science — NIT Trichy",
  "M.Tech in VLSI Design — COEP Pune",
];

const designations = [
  "Professor", "Associate Professor", "Assistant Professor",
  "Head of Department", "Dean of Engineering",
];

const alumniContributions = [
  "Donated ₹5,00,000 to the college scholarship fund",
  "Conducted placement preparation workshops for 200+ students",
  "Established industry-academia partnership with current employer",
  "Mentored 15+ students through career transitions",
  "Sponsored annual hackathon and coding competitions",
  "Guest lecture series on modern software engineering practices",
];

// ── Alumni & Teacher names for new records ─────────────────────────

const alumniNames = [
  "Vikram Desai", "Sneha Nair", "Kunal Bose", "Meera Iyer", "Rohan Chaudhary",
];
const teacherNames = [
  "Dr. Rajesh Mishra", "Dr. Kavita Bhat", "Prof. Sanjay Reddy",
];

// ── Main seed function ─────────────────────────────────────────────

async function seedProfiles() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for Profile Seeding...\n");

    const hashedPassword = await bcrypt.hash("Password@123", 10);

    // ── 1. Update existing Student profiles ────────────────────────
    const students = await Student.find({});
    console.log(`Found ${students.length} existing students. Enriching profiles...`);

    for (let i = 0; i < students.length; i++) {
      const s = students[i];
      await Student.updateOne(
        { _id: s._id },
        {
          $set: {
            bio: studentBios[i % studentBios.length],
            skills: getRandomItems(skillsPool, 5 + Math.floor(Math.random() * 4)),
            projects: getRandomItems(studentProjects, 2 + Math.floor(Math.random() * 3)),
            achievements: getRandomItems(achievementPool, 1 + Math.floor(Math.random() * 3)),
            contact: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
            course: getRandomItem(["B.Tech", "M.Tech", "B.E."]),
            currentYear: getRandomItem(["First Year", "Second Year", "Third Year", "Final Year"]),
            address: getRandomItem(["Pune, Maharashtra", "Mumbai, Maharashtra", "Nagpur, Maharashtra", "Nashik, Maharashtra"]),
            verified: true,
          },
        }
      );
    }
    console.log(`✓ Updated ${students.length} student profiles.\n`);

    // ── 2. Create & enrich Alumni profiles ─────────────────────────
    let existingAlumni = await User.find({ role: "Alumni" });
    if (existingAlumni.length === 0) {
      console.log("No alumni found. Creating 5 alumni users...");
      for (let i = 0; i < alumniNames.length; i++) {
        const name = alumniNames[i];
        const email = `${name.split(" ")[0].toLowerCase()}${i}@alumni.demo`;
        const prn = `78100${1000 + i}K`;

        const user = await User.create({
          role: "Alumni",
          name,
          prn_number: prn,
          email,
          password: hashedPassword,
          connectionsCount: Math.floor(Math.random() * 50),
        });

        await Alumni.create({
          user: user._id,
          department: DEPARTMENTS[i % DEPARTMENTS.length],
          graduationYear: 2015 + Math.floor(Math.random() * 8),
          bio: alumniBios[i % alumniBios.length],
          currentCompany: getRandomItem(companies),
          currentPosition: getRandomItem(positions),
          location: getRandomItem(locations),
          linkedin: `https://linkedin.com/in/${name.split(" ")[0].toLowerCase()}-${name.split(" ")[1].toLowerCase()}`,
          contact: `97${Math.floor(10000000 + Math.random() * 90000000)}`,
          skills: getRandomItems(skillsPool, 6 + Math.floor(Math.random() * 5)),
          achievements: getRandomItems(achievementPool, 2 + Math.floor(Math.random() * 3)),
          contributions: getRandomItems(alumniContributions, 1 + Math.floor(Math.random() * 3)),
          verified: true,
        });

        console.log(`  Created alumni: ${name} (${email})`);
      }
    } else {
      console.log(`Found ${existingAlumni.length} alumni. Enriching profiles...`);
      const alumniProfiles = await Alumni.find({});
      for (let i = 0; i < alumniProfiles.length; i++) {
        await Alumni.updateOne(
          { _id: alumniProfiles[i]._id },
          {
            $set: {
              bio: alumniBios[i % alumniBios.length],
              currentCompany: getRandomItem(companies),
              currentPosition: getRandomItem(positions),
              location: getRandomItem(locations),
              linkedin: `https://linkedin.com/in/alumni-${i + 1}`,
              contact: `97${Math.floor(10000000 + Math.random() * 90000000)}`,
              skills: getRandomItems(skillsPool, 6 + Math.floor(Math.random() * 5)),
              achievements: getRandomItems(achievementPool, 2 + Math.floor(Math.random() * 3)),
              contributions: getRandomItems(alumniContributions, 1 + Math.floor(Math.random() * 3)),
              verified: true,
            },
          }
        );
      }
    }
    console.log(`✓ Alumni profiles done.\n`);

    // ── 3. Create & enrich Teacher profiles ────────────────────────
    let existingTeachers = await User.find({ role: "Teacher" });
    if (existingTeachers.length === 0) {
      console.log("No teachers found. Creating 3 teacher users...");
      for (let i = 0; i < teacherNames.length; i++) {
        const name = teacherNames[i];
        const cleanName = name.replace("Dr. ", "").replace("Prof. ", "");
        const email = `${cleanName.split(" ")[0].toLowerCase()}${i}@teacher.demo`;
        const empId = `EMP${2001 + i}`;

        const user = await User.create({
          role: "Teacher",
          name,
          emp_id: empId,
          email,
          password: hashedPassword,
          connectionsCount: Math.floor(Math.random() * 30),
        });

        await Teacher.create({
          user: user._id,
          department: DEPARTMENTS[i % DEPARTMENTS.length],
          designation: designations[i % designations.length],
          bio: teacherBios[i % teacherBios.length],
          contact: `96${Math.floor(10000000 + Math.random() * 90000000)}`,
          specialization: getRandomItems(SPECIALIZATIONS, 2 + Math.floor(Math.random() * 2)),
          experienceYears: 5 + Math.floor(Math.random() * 20),
          qualifications: qualifications[i % qualifications.length],
          achievements: getRandomItems(achievementPool, 2 + Math.floor(Math.random() * 2)),
          verified: true,
        });

        console.log(`  Created teacher: ${name} (${email})`);
      }
    } else {
      console.log(`Found ${existingTeachers.length} teachers. Enriching profiles...`);
      const teacherProfiles = await Teacher.find({});
      for (let i = 0; i < teacherProfiles.length; i++) {
        await Teacher.updateOne(
          { _id: teacherProfiles[i]._id },
          {
            $set: {
              designation: designations[i % designations.length],
              bio: teacherBios[i % teacherBios.length],
              contact: `96${Math.floor(10000000 + Math.random() * 90000000)}`,
              specialization: getRandomItems(SPECIALIZATIONS, 2 + Math.floor(Math.random() * 2)),
              experienceYears: 5 + Math.floor(Math.random() * 20),
              qualifications: qualifications[i % qualifications.length],
              achievements: getRandomItems(achievementPool, 2 + Math.floor(Math.random() * 2)),
              verified: true,
            },
          }
        );
      }
    }
    console.log(`✓ Teacher profiles done.\n`);

    // ── Summary ────────────────────────────────────────────────────
    const finalStudents = await Student.countDocuments();
    const finalAlumni = await Alumni.countDocuments();
    const finalTeachers = await Teacher.countDocuments();

    console.log("═══════════════════════════════════════════");
    console.log("  Profile Seeding Complete!");
    console.log("═══════════════════════════════════════════");
    console.log(`  Students : ${finalStudents} (enriched)`);
    console.log(`  Alumni   : ${finalAlumni} (with company, skills, bio)`);
    console.log(`  Teachers : ${finalTeachers} (with specialization, quals)`);
    console.log("───────────────────────────────────────────");
    console.log("  Password for all: Password@123");
    console.log("  Alumni emails  : vikram0@alumni.demo, sneha1@alumni.demo, ...");
    console.log("  Teacher emails : rajesh0@teacher.demo, kavita1@teacher.demo, ...");
    console.log("═══════════════════════════════════════════");

    process.exit(0);
  } catch (err) {
    console.error("Profile seeding failed:", err);
    process.exit(1);
  }
}

seedProfiles();
