import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import {
  departmentOptions,
  courseOptions,
  skillCategories,
} from "../../constants/profileOptions";
import server from "../../../environment.js";

const StudentProfileForm = ({ initialData = {} }) => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    department: initialData.department || "",
    address: initialData.address || "",
    currentYear: initialData.currentYear || "",
    bio: initialData.bio || "",
    skills: Array.isArray(initialData.skills) ? initialData.skills.flatMap(s => typeof s === 'string' ? s.split(',').map(skill => skill.trim()) : s).filter(Boolean) : (initialData.skills ? initialData.skills.split(',').map(skill => skill.trim()).filter(Boolean) : []),
    achievements: Array.isArray(initialData.achievements) ? initialData.achievements : [],
    projects: Array.isArray(initialData.projects) ? initialData.projects : [],
    batch: initialData.batch || "",
    course: initialData.course || "",
    contact: initialData.contact || "",
  });

  const [achievementInput, setAchievementInput] = useState("");
  const [projectInput, setProjectInput] = useState({ title: "", description: "" });
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleSkill = (skill) => {
    setForm((prev) => {
      const exists = prev.skills.includes(skill);
      if (exists) {
        return {
          ...prev,
          skills: prev.skills.filter((s) => s !== skill),
        };
      }
      return {
        ...prev,
        skills: [...prev.skills, skill],
      };
    });
  };

  // Filter skill categories based on search
  const filteredSkillCategories = useMemo(() => {
    if (!skillSearch.trim()) return skillCategories;
    const query = skillSearch.toLowerCase();
    const filtered = {};
    Object.entries(skillCategories).forEach(([category, skills]) => {
      const matchingSkills = skills.filter((s) =>
        s.toLowerCase().includes(query)
      );
      if (matchingSkills.length > 0) {
        filtered[category] = matchingSkills;
      }
    });
    return filtered;
  }, [skillSearch]);


  // Add Achievement
  const addAchievement = () => {
    if (!achievementInput.trim()) return;
    setForm({
      ...form,
      achievements: [...form.achievements, achievementInput],
    });
    setAchievementInput("");
  };

  const removeAchievement = (idx) => {
    const updated = [...form.achievements];
    updated.splice(idx, 1);
    setForm({ ...form, achievements: updated });
  };

  // Add Project
  const addProject = () => {
    if (!projectInput.title.trim() || !projectInput.description.trim()) return;
    setForm({
      ...form,
      projects: [...form.projects, projectInput],
    });
    setProjectInput({ title: "", description: "" });
  };

  const removeProject = (idx) => {
    const updated = [...form.projects];
    updated.splice(idx, 1);
    setForm({ ...form, projects: updated });
  };


  const handleFileUpload = (e, setImage) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    const formData = new FormData();

    // Append fields
    Object.entries(form).forEach(([key, value]) => {
      if (key !== "profileImage" && key !== "coverImage") {
        if (key === "skills" || key === "achievements" || key === "projects") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      }
    });

    // Append files
    if (profileImage) formData.append("profileImage", profileImage);
    if (coverImage) formData.append("coverImage", coverImage);

    // Debug log
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      const res = await fetch(`${server}/api/student/profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      console.log("SERVER:", data);

      if (!res.ok) {
        alert(data.message || "Failed to save profile");
        return;
      }

      // Update AuthContext if profileImage was updated
      if (data.profile?.profileImage) {
        login({
          ...user,
          profileImage: data.profile.profileImage
        });
      }

      alert("Saved successfully! Refresh to see changes on the profile page.");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }

    setLoading(false);
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-2xl mt-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-2xl font-bold mb-5 text-center">
        Complete Your Profile
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Bio */}
        <div>
          <label className="font-medium">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
            placeholder="Write anything special which defines you."
          />
        </div>

        {/* Current Year */}
        <div>
          <label className="font-medium">Current Year</label>
          <input
            name="currentYear"
            value={form.currentYear}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
            placeholder="Which year currently you are in ?"
          />
        </div>

        {/* Course */}
        <div>
          <label className="block font-medium mb-1">Course</label>
          <select
            name="course"
            value={form.course}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          >
            <option value="">Select Course</option>
            {courseOptions.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div>
          <label className="block font-medium mb-1">Department / Branch</label>
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          >
            <option value="">Select Department</option>
            {departmentOptions.map((dept, i) => (
              <option key={i} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Address */}
        <div>
          <label className="block font-medium mb-1">Address</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            placeholder="Enter your address"
          />
        </div>

        {/* Batch */}
        <div>
          <label className="block font-medium mb-1">Batch</label>
          <input
            type="text"
            name="batch"
            value={form.batch}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            placeholder="2022–2025"
            required
          />
        </div>

        {/* Contact */}
        <div>
          <label className="block font-medium mb-1">Contact Number</label>
          <input
            type="text"
            name="contact"
            value={form.contact}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            placeholder="Enter phone number"
          />
        </div>

        {/* Skills */}
        <div>
          <label className="font-medium">Skills</label>

          {/* Selected Skills */}
          {form.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              {(Array.isArray(form.skills) ? form.skills : []).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className="text-blue-500 hover:text-blue-700 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Skill Search */}
          <input
            type="text"
            value={skillSearch}
            onChange={(e) => setSkillSearch(e.target.value)}
            placeholder="Search skills..."
            className="w-full p-2 border rounded-lg mb-3"
          />

          {/* Categorized Skills */}
          <div className="max-h-64 overflow-y-auto border rounded-lg p-3 space-y-4">
            {Object.entries(filteredSkillCategories).map(([category, skills]) => (
              <div key={category}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  {category}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {skills.map((skill) => (
                    <label
                      key={skill}
                      className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5"
                    >
                      <input
                        type="checkbox"
                        checked={form.skills.includes(skill)}
                        onChange={() => toggleSkill(skill)}
                        className="rounded"
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(filteredSkillCategories).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                No skills match your search
              </p>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <label className="font-medium">Achievements</label>
          {form.achievements.length > 0 && (
            <ul className="list-disc pl-5 mb-3 text-sm space-y-1">
              {form.achievements.map((ach, idx) => (
                <li key={idx} className="flex justify-between items-start">
                  <span>{ach}</span>
                  <button type="button" onClick={() => removeAchievement(idx)} className="text-red-500 font-bold ml-2">×</button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={achievementInput}
              onChange={(e) => setAchievementInput(e.target.value)}
              className="flex-1 p-2 border rounded-lg"
              placeholder="E.g., Hackathon Winner 2023"
            />
            <button
              type="button"
              onClick={addAchievement}
              className="bg-gray-100 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200"
            >
              Add
            </button>
          </div>
        </div>

        {/* Featured Projects */}
        <div>
          <label className="font-medium">Featured Projects</label>
          {form.projects.length > 0 && (
            <div className="mb-4 space-y-3">
              {form.projects.map((proj, idx) => (
                <div key={idx} className="border p-3 rounded-lg relative bg-gray-50">
                  <button type="button" onClick={() => removeProject(idx)} className="absolute top-2 right-2 text-red-500 font-bold text-lg leading-none">×</button>
                  <h4 className="font-bold text-sm text-gray-800">{proj.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{proj.description}</p>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-2 border p-3 rounded-lg bg-gray-50">
            <input
              type="text"
              value={projectInput.title}
              onChange={(e) => setProjectInput({ ...projectInput, title: e.target.value })}
              className="w-full p-2 border rounded-lg"
              placeholder="Project Title"
            />
            <textarea
              value={projectInput.description}
              onChange={(e) => setProjectInput({ ...projectInput, description: e.target.value })}
              className="w-full p-2 border rounded-lg"
              placeholder="Project Description"
              rows={2}
            />
            <button
              type="button"
              onClick={addProject}
              className="w-full bg-gray-200 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Add Project
            </button>
          </div>
        </div>

        {/* Profile Image */}
        <div>
          <label className="block font-medium mb-1">Profile Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, setProfileImage)}
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="block font-medium mb-1">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, setCoverImage)}
          />
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
          whileTap={{ scale: 0.96 }}
        >
          {loading ? "Submitting..." : "Save Profile"}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default StudentProfileForm;
