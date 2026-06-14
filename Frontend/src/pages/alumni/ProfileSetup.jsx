import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import {
  departmentOptions,
  skillCategories,
} from "../../constants/profileOptions";
import server from "../../../environment.js";

const AlumniProfileForm = () => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    graduationYear: "",
    department: "",
    currentCompany: "",
    currentPosition: "",
    linkedin: "",
    contact: "",
    bio: "",
    skills: [],
    achievements: [],
    contributions: [],
    location: "",
  });

  const [achievementInput, setAchievementInput] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Add/Remove Skills
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


  const handleFileUpload = (e, setImage) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    const formData = new FormData();

    // Append simple text fields
    Object.entries(form).forEach(([key, value]) => {
      if (key !== "profileImage" && key !== "coverImage") {
        formData.append(key, value);
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
      const res = await fetch(`${server}/api/alumni/profile`, {
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
      className="max-w-2xl mx-auto bg-white shadow-lg p-6 mt-10 rounded-2xl"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-bold text-center mb-6">Alumni Profile</h2>

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

        {/* Graduation Year */}
        <div>
          <label className="font-medium">Graduation Year</label>
          <input
            type="text"
            name="graduationYear"
            value={form.graduationYear}
            onChange={handleChange}
            placeholder="e.g., 2022"
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>

        {/* Department */}
        <div>
          <label className="font-medium">Department / Branch</label>
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
            required
          >
            <option value="">Select Department</option>
            {departmentOptions.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Current Company */}
        <div>
          <label className="font-medium">Current Company</label>
          <input
            type="text"
            name="currentCompany"
            value={form.currentCompany}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Position */}
        <div>
          <label className="font-medium">Current Position</label>
          <input
            type="text"
            name="currentPosition"
            value={form.currentPosition}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label className="font-medium">LinkedIn URL</label>
          <input
            type="text"
            name="linkedin"
            value={form.linkedin}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/..."
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Contact */}
        <div>
          <label className="font-medium">Contact Number</label>
          <input
            type="text"
            name="contact"
            value={form.contact}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Skills */}
        <div>
          <label className="font-medium">Skills</label>

          {/* Selected Skills */}
          {form.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              {form.skills.map((skill) => (
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
          <div className="flex gap-2">
            <input
              type="text"
              value={achievementInput}
              onChange={(e) => setAchievementInput(e.target.value)}
              placeholder="Add an achievement"
              className="flex-1 p-2 border rounded-lg"
            />
            <button
              type="button"
              onClick={addAchievement}
              className="px-4 bg-gray-700 text-white rounded-lg"
            >
              Add
            </button>
          </div>
          <ul className="mt-2 list-disc pl-6">
            {form.achievements.map((ach, index) => (
              <li key={index}>{ach}</li>
            ))}
          </ul>
        </div>

        {/* Location */}
        <div>
          <label className="font-medium">Current Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Images */}
        <div>
          <label className="font-medium">Profile Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, setProfileImage)}
          />
        </div>

        <div>
          <label className="font-medium">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, setCoverImage)}
          />
        </div>

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
        >
          {loading ? "Saving..." : "Save Profile"}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default AlumniProfileForm;
