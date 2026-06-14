const User = require("../model/registerUser/UserScehma");
const Student = require("../model/Student");
const Alumni = require("../model/Alumni");
const Job = require("../model/Job");
const { rankCandidates } = require("../utils/mlEngine");

exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // 1. Get current user's profile to build query document
    let userProfile;
    let targetRole;

    if (userRole === "Student") {
      userProfile = await Student.findOne({ user: userId });
      targetRole = "Alumni";
    } else if (userRole === "Alumni") {
      userProfile = await Alumni.findOne({ user: userId });
      targetRole = "Student";
    } else {
      return res.status(200).json({ profileRecommendations: [], jobRecommendations: [] });
    }

    if (!userProfile) {
      return res.status(200).json({ 
        profileRecommendations: [], 
        jobRecommendations: [], 
        message: "Complete your profile to get recommendations!" 
      });
    }

    const { department, skills } = userProfile;
    const userText = [department, ...(skills || [])].join(" ");
    const userDoc = { id: userId, text: userText };

    // 2. Fetch Candidate Profiles
    let recommendedProfiles;
    if (targetRole === "Alumni") {
      recommendedProfiles = await Alumni.find({ user: { $ne: userId } })
        .populate("user", "name email");
    } else {
      recommendedProfiles = await Student.find({ user: { $ne: userId } })
        .populate("user", "name email");
    }

    const profileDocs = recommendedProfiles.map(profile => ({
      id: String(profile._id),
      text: [profile.department, ...(profile.skills || [])].join(" "),
      originalObject: {
        ...profile.toObject(),
        name: profile.user?.name,
        email: profile.user?.email,
        role: targetRole
      }
    }));

    // 3. Fetch Candidate Jobs
    const candidateJobs = await Job.find({ isActive: true });
    
    const jobDocs = candidateJobs.map(job => ({
      id: String(job._id),
      text: [job.title, job.company, job.type, ...(job.skills || []), job.description].join(" "),
      originalObject: {
        ...job.toObject(),
        role: "Job"
      }
    }));

    // 4. Run ML Engine Scoring (TF-IDF + Cosine Similarity)
    const rankedProfiles = rankCandidates(userDoc, profileDocs);
    const rankedJobs = rankCandidates(userDoc, jobDocs);

    res.status(200).json({ 
      profileRecommendations: rankedProfiles.slice(0, 5),
      jobRecommendations: rankedJobs.slice(0, 5)
    });

  } catch (error) {
    console.error("Recommendation Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
