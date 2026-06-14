const User = require("../model/registerUser/UserScehma");
const Student = require("../model/Student");
const Alumni = require("../model/Alumni");
const Job = require("../model/Job");
const { rankCandidates } = require("../utils/mlEngine");

// ML API Configuration
const ML_API_URL = process.env.ML_API_URL || "http://localhost:5000";
const ML_API_TIMEOUT = parseInt(process.env.ML_API_TIMEOUT) || 10000;

/**
 * Call the Python ML API with retry logic
 */
async function callMLAPI(endpoint, method = "GET", body = null, maxRetries = 2) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), ML_API_TIMEOUT);

      const options = {
        method,
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const url = `${ML_API_URL}${endpoint}`;
      const response = await fetch(url, options);
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`ML API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  throw lastError;
}

/**
 * Check if ML API is available
 */
async function isMLServiceAvailable() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${ML_API_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * GET /api/recommendations
 * Main recommendation endpoint — tries ML API first, falls back to JS TF-IDF
 */
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // 1. Get current user's profile
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
        message: "Complete your profile to get recommendations!",
      });
    }

    // 2. Try ML API first for profile recommendations
    let profileRecommendations = [];
    let mlSource = "fallback";

    const mlAvailable = await isMLServiceAvailable();

    if (mlAvailable && userRole === "Student") {
      try {
        const mlResult = await callMLAPI("/api/recommendations/alumni", "POST", {
          student_id: String(userProfile._id),
          limit: 5,
          min_score: 0,
        });

        if (mlResult.success && mlResult.recommendations?.length > 0) {
          profileRecommendations = mlResult.recommendations.map((rec) => ({
            _id: rec.alumni_id,
            user: { _id: rec.user_id, name: rec.name, email: rec.email },
            name: rec.name,
            email: rec.email,
            department: rec.department,
            skills: rec.skills || [],
            currentCompany: rec.currentCompany,
            currentPosition: rec.currentPosition,
            role: "Alumni",
            mlScore: rec.recommendationScore / 100,
            matchPercentage: Math.round(rec.recommendationScore),
          }));
          mlSource = "python-ml";
        }
      } catch (mlError) {
        console.warn("ML API call failed, using fallback:", mlError.message);
      }
    }

    // 3. Fallback to JS TF-IDF engine if ML didn't return results
    if (profileRecommendations.length === 0) {
      const { department, skills } = userProfile;
      const userText = [department, ...(skills || [])].join(" ");
      const userDoc = { id: userId, text: userText };

      let recommendedProfiles;
      if (targetRole === "Alumni") {
        recommendedProfiles = await Alumni.find({ user: { $ne: userId } }).populate(
          "user",
          "name email"
        );
      } else {
        recommendedProfiles = await Student.find({ user: { $ne: userId } }).populate(
          "user",
          "name email"
        );
      }

      const profileDocs = recommendedProfiles.map((profile) => ({
        id: String(profile._id),
        text: [profile.department, ...(profile.skills || [])].join(" "),
        originalObject: {
          ...profile.toObject(),
          name: profile.user?.name,
          email: profile.user?.email,
          role: targetRole,
        },
      }));

      profileRecommendations = rankCandidates(userDoc, profileDocs);
    }

    // 4. Job recommendations (always use JS TF-IDF — ML model doesn't cover jobs)
    const { department, skills } = userProfile;
    const userText = [department, ...(skills || [])].join(" ");
    const userDoc = { id: userId, text: userText };

    const candidateJobs = await Job.find({ isActive: true });
    const jobDocs = candidateJobs.map((job) => ({
      id: String(job._id),
      text: [job.title, job.company, job.type, ...(job.skills || []), job.description].join(" "),
      originalObject: {
        ...job.toObject(),
        role: "Job",
      },
    }));

    const rankedJobs = rankCandidates(userDoc, jobDocs);

    res.status(200).json({
      profileRecommendations: profileRecommendations.slice(0, 5),
      jobRecommendations: rankedJobs.slice(0, 5),
      mlSource,
    });
  } catch (error) {
    console.error("Recommendation Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/recommendations/alumni
 * ML-powered alumni recommendations (proxied to Python service)
 */
exports.getMLAlumniRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, min_score = 0, filter_department } = req.query;

    // Get student profile to find student_id
    const studentProfile = await Student.findOne({ user: userId });
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    const mlResult = await callMLAPI("/api/recommendations/alumni", "POST", {
      student_id: String(studentProfile._id),
      limit: parseInt(limit),
      min_score: parseFloat(min_score),
      filter_department,
    });

    res.status(200).json({ success: true, data: mlResult });
  } catch (error) {
    console.error("ML Alumni Recommendations Error:", error);
    res.status(500).json({ success: false, message: "ML service unavailable" });
  }
};

/**
 * GET /api/recommendations/analytics
 * Recommendation analytics from ML service
 */
exports.getRecommendationAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const studentProfile = await Student.findOne({ user: userId });
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    const mlResult = await callMLAPI("/api/recommendations/analytics", "POST", {
      student_id: String(studentProfile._id),
    });

    res.status(200).json({ success: true, data: mlResult });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ success: false, message: "ML service unavailable" });
  }
};

/**
 * GET /api/recommendations/similar-alumni/:alumniId
 * Find similar alumni for networking
 */
exports.getSimilarAlumni = async (req, res) => {
  try {
    const { alumniId } = req.params;
    const { limit = 10 } = req.query;

    const mlResult = await callMLAPI(
      `/api/recommendations/similar-alumni?alumni_id=${alumniId}&limit=${limit}`
    );

    res.status(200).json({ success: true, data: mlResult });
  } catch (error) {
    console.error("Similar Alumni Error:", error);
    res.status(500).json({ success: false, message: "ML service unavailable" });
  }
};

/**
 * GET /api/recommendations/model/stats
 * Get ML model statistics
 */
exports.getModelStats = async (req, res) => {
  try {
    const mlResult = await callMLAPI("/api/model/stats");
    res.status(200).json({ success: true, data: mlResult });
  } catch (error) {
    console.error("Model Stats Error:", error);
    res.status(500).json({ success: false, message: "ML service unavailable" });
  }
};

/**
 * POST /api/recommendations/model/retrain
 * Trigger model retraining (Admin only)
 */
exports.retrainModel = async (req, res) => {
  try {
    const mlResult = await callMLAPI("/api/model/retrain", "POST");
    res.status(200).json({
      success: true,
      message: mlResult.message || "Model retraining initiated",
    });
  } catch (error) {
    console.error("Retrain Error:", error);
    res.status(500).json({ success: false, message: "ML service unavailable" });
  }
};

/**
 * GET /api/recommendations/health
 * Check ML service health
 */
exports.getMLHealth = async (req, res) => {
  try {
    const available = await isMLServiceAvailable();
    if (available) {
      const health = await callMLAPI("/health");
      res.status(200).json({ success: true, mlService: "connected", ...health });
    } else {
      res.status(200).json({
        success: true,
        mlService: "disconnected",
        fallback: "JS TF-IDF engine active",
      });
    }
  } catch (error) {
    res.status(200).json({
      success: true,
      mlService: "disconnected",
      fallback: "JS TF-IDF engine active",
    });
  }
};
