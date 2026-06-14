const mongoose = require("mongoose");
const User = require("./model/registerUser/UserScehma");
const Post = require("./model/Posts");
const Student = require("./model/Student");
const Alumni = require("./model/Alumni");

const MONGO_URI = "mongodb://127.0.0.1:27017/AlumniPortalDB";

const eventPosts = [
  "Excited to announce the upcoming Alumni Meet 2026! Join us for a day of networking and nostalgia.",
  "Don't miss out on the 'Tech Innovations' seminar happening next week. Free entry for all students and alumni!",
  "We are hosting a Hackathon next month. Gather your teams and get ready to code!",
  "Join us for the Annual Sports Day! Let's see which batch takes home the trophy this year.",
  "Hosting a webinar on 'Future of AI in Software Engineering'. Register now to secure your spot!"
];

const placementPosts = [
  "Congratulations to the class of 2024 for a stellar placement season! Over 500 students placed in top MNCs.",
  "Google is visiting our campus next month for a recruitment drive! Ensure your resumes are updated.",
  "We are hiring! Looking for fresh graduates for Junior Developer roles at my current company.",
  "A quick guide to acing your technical interviews: focus on algorithms, system design, and communicate clearly.",
  "Thrilled to share that I have just accepted an offer from Microsoft! Thanks to my professors and peers for the support."
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedPosts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for Posts Seeding...");
    
    // Find some users to act as authors (Alumni and Teachers mostly)
    const alumniUsers = await User.find({ role: 'Alumni' }).limit(5);
    const teacherUsers = await User.find({ role: 'Teacher' }).limit(3);
    const studentUsers = await User.find({ role: 'Student' }).limit(2);
    
    const possibleAuthors = [...alumniUsers, ...teacherUsers, ...studentUsers];
    
    if (possibleAuthors.length === 0) {
      console.error("No users found to create posts. Please seed users first.");
      process.exit(1);
    }
    
    console.log(`Found ${possibleAuthors.length} users to author posts.`);
    
    let createdPosts = 0;
    
    // Create 10 Event Posts
    for(let i=0; i<10; i++) {
      const author = getRandomItem(possibleAuthors);
      // Try to find if author has profile image
      let profileImage = null;
      if (author.role === 'Student') {
        const student = await Student.findOne({ user: author._id });
        if(student) profileImage = student.profileImage?.url || null;
      } else if (author.role === 'Alumni') {
        const alumni = await Alumni.findOne({ user: author._id });
        if(alumni) profileImage = alumni.profileImage?.url || null;
      }
      
      await Post.create({
        user: author._id,
        role: author.role,
        authorName: author.name,
        authorProfileImage: profileImage,
        content: getRandomItem(eventPosts),
      });
      createdPosts++;
    }

    // Create 10 Placement Posts
    for(let i=0; i<10; i++) {
      const author = getRandomItem(possibleAuthors);
      let profileImage = null;
      if (author.role === 'Student') {
        const student = await Student.findOne({ user: author._id });
        if(student) profileImage = student.profileImage?.url || null;
      } else if (author.role === 'Alumni') {
        const alumni = await Alumni.findOne({ user: author._id });
        if(alumni) profileImage = alumni.profileImage?.url || null;
      }
      
      await Post.create({
        user: author._id,
        role: author.role,
        authorName: author.name,
        authorProfileImage: profileImage,
        content: getRandomItem(placementPosts),
      });
      createdPosts++;
    }

    console.log(`Successfully seeded ${createdPosts} random placement and event posts!`);
    
    process.exit(0);

  } catch (err) {
    console.error("Error seeding posts: ", err);
    process.exit(1);
  }
}

seedPosts();
