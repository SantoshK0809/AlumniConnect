import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import {
  departmentOptions,
  specializationOptions,
} from "../../constants/profileOptions";
import server from "../../../environment.js";

const TeacherProfileForm = () => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    designation: "",
    contact: "",
    department: "",
    profileImage: "",
    coverImage: "",
    achievements: "",
    specialization: [],
    experienceYears: "",
    qualifications: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [specSearch, setSpecSearch] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Multi-select specialization
  const handleSpecialization = (value) => {
    setForm((prev) => {
      const exists = prev.specialization.includes(value);
      if (exists) {
        return {
          ...prev,
          specialization: prev.specialization.filter((sp) => sp !== value),
        };
      }
      return {
        ...prev,
        specialization: [...prev.specialization, value],
      };
    });
  };

  // Filter specializations based on search
  const filteredSpecializations = useMemo(() => {
    if (!specSearch.trim()) return specializationOptions;
    const query = specSearch.toLowerCase();
    return specializationOptions.filter((s) =>
      s.toLowerCase().includes(query)
    );
  }, [specSearch]);

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
      const res = await fetch(`${server}/api/teacher/profile`, {
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
      className="max-w-2xl mx-auto bg-white p-6 mt-10 shadow-xl rounded-2xl"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Teacher Profile Form
      </h2>

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

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Designation */}
        <div>
          <label className="font-medium">Designation</label>
          <input
            type="text"
            name="designation"
            value={form.designation}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
            placeholder="Assistant Professor"
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
            placeholder="Enter contact number"
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

        {/* Specialization */}
        <div>
          <label className="font-medium">Specialization</label>

          {/* Selected Specializations */}
          {form.specialization.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              {form.specialization.map((sp) => (
                <span
                  key={sp}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                >
                  {sp}
                  <button
                    type="button"
                    onClick={() => handleSpecialization(sp)}
                    className="text-indigo-500 hover:text-indigo-700 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search */}
          <input
            type="text"
            value={specSearch}
            onChange={(e) => setSpecSearch(e.target.value)}
            placeholder="Search specializations..."
            className="w-full p-2 border rounded-lg mb-3"
          />

          <div className="max-h-52 overflow-y-auto border rounded-lg p-3">
            <div className="grid grid-cols-2 gap-1">
              {filteredSpecializations.map((sp) => (
                <label
                  key={sp}
                  className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5"
                >
                  <input
                    type="checkbox"
                    checked={form.specialization.includes(sp)}
                    onChange={() => handleSpecialization(sp)}
                    className="rounded"
                  />
                  <span>{sp}</span>
                </label>
              ))}
            </div>
            {filteredSpecializations.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                No specializations match your search
              </p>
            )}
          </div>
        </div>

        {/* Experience */}
        <div>
          <label className="font-medium">Experience (Years)</label>
          <input
            type="number"
            name="experienceYears"
            value={form.experienceYears}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
            placeholder="e.g., 5"
          />
        </div>

        {/* Qualifications */}
        <div>
          <label className="font-medium">Qualifications</label>
          <textarea
            name="qualifications"
            value={form.qualifications}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
            placeholder="M.Tech, PhD etc."
          />
        </div>

        {/* Achievements */}
        <div>
          <label className="font-medium">Achievements</label>
          <textarea
            name="achievements"
            value={form.achievements}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
            placeholder="Show case your achievements"
          />
        </div>

        {/* Profile Image */}
        <div>
          <label className="font-medium">Profile Image</label>
          <input
            type="file"
            name="profileImage"
            onChange={(e) => handleFileUpload(e, setProfileImage)}
            accept="image/*"
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="font-medium">Cover Image</label>
          <input
            type="file"
            name="coverImage"
            onChange={(e) => handleFileUpload(e, setCoverImage)}
            accept="image/*"
          />
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.96 }}
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
        >
          {loading ? "Saving..." : "Save Profile"}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default TeacherProfileForm;
