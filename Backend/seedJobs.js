const mongoose = require("mongoose");
const User = require("./model/registerUser/UserScehma");
const Job = require("./model/Job");

const MONGO_URI = "mongodb://127.0.0.1:27017/AlumniPortalDB";

const jobPostings = [
  {
    title: "Software Development Engineer",
    company: "Google India",
    location: "Bangalore, India",
    type: "Full-Time",
    description:
      "Join Google's core search infrastructure team. You'll design and build scalable distributed systems serving billions of requests daily. We're looking for engineers passionate about performance optimization, clean architecture, and collaborative problem-solving. You'll work with cutting-edge technologies including Go, C++, and our internal tooling stack.",
    salary: "₹18-30 LPA",
    skills: ["JavaScript", "Python", "System Design", "Data Structures", "C++"],
    applyLink: "https://careers.google.com",
    deadlineDays: 30,
  },
  {
    title: "Full Stack Developer Intern",
    company: "Flipkart",
    location: "Bangalore, India",
    type: "Internship",
    description:
      "6-month internship opportunity for pre-final and final year students. Work on real production features used by millions of customers. You'll gain hands-on experience with React, Node.js, microservices, and Agile methodologies. Strong performers will receive pre-placement offers.",
    salary: "₹40,000/month + Housing",
    skills: ["React", "Node.js", "MongoDB", "REST APIs", "Git"],
    applyLink: "https://flipkart.com/careers",
    deadlineDays: 15,
  },
  {
    title: "Data Scientist",
    company: "Amazon",
    location: "Hyderabad, India",
    type: "Full-Time",
    description:
      "Amazon's retail analytics team is hiring data scientists to build ML models that optimize pricing, inventory management, and demand forecasting. You'll work with terabytes of data using Python, Spark, and AWS services. PhD or Masters preferred but exceptional BTech candidates are welcome.",
    salary: "₹20-35 LPA",
    skills: ["Python", "Machine Learning", "TensorFlow", "Data Science", "AWS"],
    applyLink: "https://amazon.jobs",
    deadlineDays: 25,
  },
  {
    title: "Frontend Developer",
    company: "Razorpay",
    location: "Pune, India",
    type: "Full-Time",
    description:
      "Build the next generation of payment interfaces used by thousands of businesses. You'll craft pixel-perfect, accessible UIs using React, TypeScript, and our custom design system. We value developers who care deeply about user experience and write clean, testable code.",
    salary: "₹12-22 LPA",
    skills: ["React", "TypeScript", "JavaScript", "Next.js", "GraphQL"],
    applyLink: "https://razorpay.com/careers",
    deadlineDays: 20,
  },
  {
    title: "DevOps Engineer — Part Time",
    company: "PhonePe",
    location: "Remote",
    type: "Part-Time",
    description:
      "Part-time DevOps role perfect for students or professionals looking for flexible work. Manage CI/CD pipelines, Kubernetes clusters, and monitoring infrastructure. 20 hours/week with flexible scheduling. Experience with Docker, Terraform, and Linux administration required.",
    salary: "₹30,000/month",
    skills: ["Docker", "Kubernetes", "AWS", "Linux", "CI/CD"],
    applyLink: "https://phonepe.com/careers",
    deadlineDays: 10,
  },
  {
    title: "Machine Learning Research Intern",
    company: "Microsoft Research India",
    location: "Bangalore, India",
    type: "Internship",
    description:
      "Work alongside world-class researchers on cutting-edge NLP and computer vision problems. Publish papers at top-tier conferences like NeurIPS and ICML. This 6-month internship is ideal for students passionate about pushing the boundaries of AI. Strong mathematical foundations required.",
    salary: "₹60,000/month",
    skills: ["PyTorch", "Deep Learning", "NLP", "Python", "Machine Learning"],
    applyLink: "https://microsoft.com/research/careers",
    deadlineDays: 20,
  },
  {
    title: "Cybersecurity Analyst",
    company: "Deloitte",
    location: "Mumbai, India",
    type: "Full-Time",
    description:
      "Join our cybersecurity practice to help Fortune 500 clients protect their digital assets. You'll perform vulnerability assessments, penetration testing, and security audits. Certifications like CEH, OSCP, or CompTIA Security+ are a plus. Excellent opportunity for rapid career growth.",
    salary: "₹10-18 LPA",
    skills: ["Cybersecurity", "Linux", "Python", "Networking"],
    applyLink: "https://deloitte.com/careers",
    deadlineDays: 35,
  },
  {
    title: "Mobile App Developer (Contract)",
    company: "Zomato",
    location: "Delhi NCR, India",
    type: "Contract",
    description:
      "6-month contract to build new features for the Zomato consumer app. You'll work with React Native and our backend APIs to deliver smooth, performant mobile experiences. This role offers competitive pay and the possibility of conversion to full-time based on performance.",
    salary: "₹1,50,000/month",
    skills: ["React Native", "Flutter", "JavaScript", "REST APIs"],
    applyLink: "https://zomato.com/careers",
    deadlineDays: 12,
  },
  {
    title: "Backend Engineer",
    company: "Atlassian",
    location: "Bangalore, India",
    type: "Full-Time",
    description:
      "Design and build the backend services powering Jira and Confluence used by millions of teams worldwide. You'll work with Java, Spring Boot, PostgreSQL, and event-driven architectures. We're a fully distributed team that values autonomy, craftsmanship, and continuous learning.",
    salary: "₹22-38 LPA",
    skills: ["Java", "System Design", "PostgreSQL", "Docker", "Kubernetes"],
    applyLink: "https://atlassian.com/careers",
    deadlineDays: 28,
  },
  {
    title: "Teaching Assistant — Data Structures",
    company: "College of Engineering Pune",
    location: "Pune, India",
    type: "Part-Time",
    description:
      "Assist the Computer Science department in conducting lab sessions and tutorials for the Data Structures course. Ideal for final-year students or recent graduates with strong fundamentals. 10 hours/week during the semester. Builds excellent teaching and communication skills.",
    salary: "₹8,000/month",
    skills: ["Data Structures", "C++", "Java", "Python"],
    applyLink: "mailto:cs-dept@coep.ac.in",
    deadlineDays: 7,
  },
];

async function seedJobs() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for Job Seeding...\n");

    // Find alumni and teacher users to assign as posters
    const alumni = await User.find({ role: "Alumni" }).limit(5);
    const teachers = await User.find({ role: "Teacher" }).limit(3);
    const posters = [...alumni, ...teachers];

    if (posters.length === 0) {
      console.error("No Alumni or Teacher users found. Run seedProfiles.js first!");
      process.exit(1);
    }

    console.log(`Found ${posters.length} eligible posters (${alumni.length} alumni + ${teachers.length} teachers)\n`);

    // Clear existing jobs
    await Job.deleteMany({});
    console.log("Cleared existing jobs.\n");

    let created = 0;
    for (let i = 0; i < jobPostings.length; i++) {
      const posting = jobPostings[i];
      const poster = posters[i % posters.length];
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + posting.deadlineDays);

      await Job.create({
        postedBy: poster._id,
        role: poster.role,
        authorName: poster.name,
        title: posting.title,
        company: posting.company,
        location: posting.location,
        type: posting.type,
        description: posting.description,
        salary: posting.salary,
        skills: posting.skills,
        applyLink: posting.applyLink,
        deadline,
        isActive: true,
      });

      console.log(`  ✓ ${posting.title} at ${posting.company} — by ${poster.name} (${poster.role})`);
      created++;
    }

    console.log(`\n═══════════════════════════════════════════`);
    console.log(`  Job Seeding Complete! ${created} jobs created.`);
    console.log(`═══════════════════════════════════════════`);

    process.exit(0);
  } catch (err) {
    console.error("Job seeding failed:", err);
    process.exit(1);
  }
}

seedJobs();
