const mongoose = require("mongoose");
const User = require("../model/registerUser/UserScehma");
const Job = require("../model/Job");

// ── CREATE JOB ─────────────────────────────────────────────────────
async function handleCreateJob(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Only Teacher and Alumni can post jobs
    if (!["Teacher", "Alumni"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only Teachers and Alumni can post jobs.",
      });
    }

    const { title, company, location, type, description, salary, skills, applyLink, deadline } = req.body;

    if (!title || !company || !type || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, company, type, and description are required.",
      });
    }

    const job = await Job.create({
      postedBy: user._id,
      role: user.role,
      authorName: user.name,
      title: title.trim(),
      company: company.trim(),
      location: location?.trim() || "",
      type,
      description: description.trim(),
      salary: salary?.trim() || "",
      skills: Array.isArray(skills) ? skills : skills ? skills.split(",").map((s) => s.trim()) : [],
      applyLink: applyLink?.trim() || "",
      deadline: deadline || null,
    });

    return res.status(201).json({
      success: true,
      message: "Job posted successfully.",
      job,
    });
  } catch (err) {
    console.error("Error creating job:", err.message);
    return res.status(500).json({ success: false, message: "Something went wrong." });
  }
}

// ── GET ALL JOBS ───────────────────────────────────────────────────
async function handleGetAllJobs(req, res) {
  try {
    const { type, search, skills, active } = req.query;
    const filter = {};

    // Filter by job type
    if (type && type !== "All") {
      filter.type = type;
    }

    // Filter by active status (default: only active)
    if (active === "false") {
      // show all
    } else {
      filter.isActive = true;
    }

    // Search by title, company, or description
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { title: regex },
        { company: regex },
        { description: regex },
      ];
    }

    // Filter by skills
    if (skills) {
      const skillsArr = skills.split(",").map((s) => s.trim());
      filter.skills = { $in: skillsArr };
    }

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .populate("postedBy", "name role");

    return res.status(200).json({
      success: true,
      message: `Found ${jobs.length} jobs.`,
      jobs,
    });
  } catch (err) {
    console.error("Error fetching jobs:", err.message);
    return res.status(500).json({ success: false, message: "Something went wrong." });
  }
}

// ── GET JOB BY ID ──────────────────────────────────────────────────
async function handleGetJobById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid job ID." });
    }

    const job = await Job.findById(id).populate("postedBy", "name role");

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    return res.status(200).json({ success: true, job });
  } catch (err) {
    console.error("Error fetching job:", err.message);
    return res.status(500).json({ success: false, message: "Something went wrong." });
  }
}

// ── UPDATE JOB ─────────────────────────────────────────────────────
async function handleUpdateJob(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid job ID." });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    // Only the poster can update
    if (job.postedBy.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized to update this job." });
    }

    const allowedFields = ["title", "company", "location", "type", "description", "salary", "skills", "applyLink", "deadline", "isActive"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === "skills" && typeof req.body[field] === "string") {
          updates[field] = req.body[field].split(",").map((s) => s.trim());
        } else {
          updates[field] = req.body[field];
        }
      }
    }

    const updatedJob = await Job.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });

    return res.status(200).json({
      success: true,
      message: "Job updated successfully.",
      job: updatedJob,
    });
  } catch (err) {
    console.error("Error updating job:", err.message);
    return res.status(500).json({ success: false, message: "Something went wrong." });
  }
}

// ── DELETE JOB ─────────────────────────────────────────────────────
async function handleDeleteJob(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid job ID." });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    // Only the poster or Admin can delete
    if (job.postedBy.toString() !== userId && userRole !== "Admin") {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this job." });
    }

    await Job.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting job:", err.message);
    return res.status(500).json({ success: false, message: "Something went wrong." });
  }
}

module.exports = {
  handleCreateJob,
  handleGetAllJobs,
  handleGetJobById,
  handleUpdateJob,
  handleDeleteJob,
};
