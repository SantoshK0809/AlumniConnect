import axios from "axios";
import { useEffect, useState } from "react";
import server from "../../../environment.js";

import { useNavigate } from "react-router-dom";

export default function EditAlumniProfessionalProfile() {
  const [loading, setLoading] = useState(true);

  const [isExistingProfile, setIsExistingProfile] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    professionalStatus: "Working",

    currentCompany: "",
    currentRole: "",
    currentLocation: "",
    industry: "",

    employmentType: "Full-time",
    workMode: "Hybrid",

    skills: [],

    education: {
      degree: "",
      department: "",
      graduationYear: "",
    },

    visibilityControls: {
      profileVisibility: "Public",
      showEmail: false,
      showPhone: false,
      allowDirectMessages: true,
    },

    experience: [],

    achievements: [],
  });

  // =========================================
  // FETCH PROFILE
  // =========================================

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        // "http://localhost:4000/api/alumni/achievements/profile",
        `${server}/api/alumni/achievements/profile`,
        {
          // withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (response.data?.success) {
        const profile = response.data.data;

        setIsExistingProfile(true);

        setFormData({
          professionalStatus: profile.professionalStatus || "Working",

          currentCompany: profile.currentCompany || "",

          currentRole: profile.currentRole || "",

          currentLocation: profile.currentLocation || "",

          industry: profile.industry || "",

          employmentType: profile.employmentType || "Full-time",

          workMode: profile.workMode || "Hybrid",

          skills: profile.skills || [],

          education: {
            degree: profile.education?.degree || "",

            department: profile.education?.department || "",

            graduationYear: profile.education?.graduationYear || "",
          },

          visibilityControls: {
            profileVisibility:
              profile.visibilityControls?.profileVisibility || "Public",

            showEmail: profile.visibilityControls?.showEmail || false,

            showPhone: profile.visibilityControls?.showPhone || false,

            allowDirectMessages:
              profile.visibilityControls?.allowDirectMessages ?? true,
          },

          experience: profile.experience || [],

          achievements: profile.achievements || [],
        });
      }
    } catch (error) {
      // New alumni profile does not exist yet
      if (error.response?.status === 404) {
        setIsExistingProfile(false);
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // COMMON INPUT CHANGE
  // =========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================
  // EDUCATION CHANGE
  // =========================================

  const handleEducationChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,

      education: {
        ...prev.education,

        [name]: value,
      },
    }));
  };

  // =========================================
  // VISIBILITY CHANGE
  // =========================================

  const handleVisibilityChange = (field) => {
    setFormData((prev) => ({
      ...prev,

      visibilityControls: {
        ...prev.visibilityControls,

        [field]: !prev.visibilityControls[field],
      },
    }));
  };

  // =========================================
  // EXPERIENCE
  // =========================================

  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = [...formData.experience];

    updatedExperience[index][field] = value;

    setFormData((prev) => ({
      ...prev,

      experience: updatedExperience,
    }));
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,

      experience: [
        ...prev.experience,

        {
          companyName: "",
          role: "",
          location: "",

          employmentType: "Full-time",

          workMode: "Onsite",

          startDate: "",
          endDate: "",

          currentlyWorking: false,

          description: "",

          skillsUsed: [],
        },
      ],
    }));
  };

  const removeExperience = (index) => {
    const updatedExperience = formData.experience.filter(
      (_, idx) => idx !== index,
    );

    setFormData((prev) => ({
      ...prev,

      experience: updatedExperience,
    }));
  };

  // =========================================
  // ACHIEVEMENTS
  // =========================================

  const handleAchievementChange = (index, field, value) => {
    const updatedAchievements = [...formData.achievements];

    updatedAchievements[index][field] = value;

    setFormData((prev) => ({
      ...prev,

      achievements: updatedAchievements,
    }));
  };

  const addAchievement = () => {
    setFormData((prev) => ({
      ...prev,

      achievements: [
        ...prev.achievements,

        {
          title: "",
          achievementType: "",
          date: "",
          description: "",
        },
      ],
    }));
  };

  const removeAchievement = (index) => {
    const updatedAchievements = formData.achievements.filter(
      (_, idx) => idx !== index,
    );

    setFormData((prev) => ({
      ...prev,

      achievements: updatedAchievements,
    }));
  };

  // =========================================
  // SUBMIT
  // =========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isExistingProfile) {
        await axios.patch(
          "http://localhost:4000/api/alumni/achievements/profile",
          formData,
          {
            // withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
      } else {
        await axios.post(
          "http://localhost:4000/api/alumni/achievements/profile",
          formData,
          {
            // withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
      }

      alert("Professional profile saved successfully");
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-700 text-lg font-medium">
        Loading Professional Profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate("/alumni/profile")}>
          <button className="w-full md:w-auto text-gray-400 hover:text-gray-800 cursor-pointer font-medium py-2 px-4 rounded-lg transition-colors">
            ← Go Back
          </button>
        </button>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* HEADER */}

          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Edit Professional Profile
                </h1>

                <p className="text-slate-600 mt-2">
                  Update your professional information and achievements.
                </p>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium transition"
              >
                {isExistingProfile ? "Save Changes" : "Create Profile"}
              </button>
            </div>
          </div>

          {/* PROFESSIONAL INFO */}

          <SectionCard title="Professional Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Professional Status"
                name="professionalStatus"
                value={formData.professionalStatus}
                onChange={handleChange}
                options={[
                  "Working",
                  "Higher Studies",
                  "Entrepreneur",
                  "Seeking Opportunities",
                  "Career Break",
                ]}
              />

              <InputField
                label="Current Company"
                name="currentCompany"
                value={formData.currentCompany}
                onChange={handleChange}
              />

              <InputField
                label="Current Role"
                name="currentRole"
                value={formData.currentRole}
                onChange={handleChange}
              />

              <InputField
                label="Location"
                name="currentLocation"
                value={formData.currentLocation}
                onChange={handleChange}
              />

              <InputField
                label="Industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
              />

              <SelectField
                label="Employment Type"
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                options={[
                  "Full-time",
                  "Internship",
                  "Part-time",
                  "Freelance",
                  "Contract",
                  "Founder",
                ]}
              />

              <SelectField
                label="Work Mode"
                name="workMode"
                value={formData.workMode}
                onChange={handleChange}
                options={["Remote", "Hybrid", "Onsite"]}
              />
            </div>
          </SectionCard>

          {/* SKILLS */}

          <SectionCard title="Skills">
            <TagInput
              label="Skills"
              value={formData.skills}
              setFormData={setFormData}
              field="skills"
            />
          </SectionCard>

          {/* EDUCATION */}

          <SectionCard title="Education">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField
                label="Degree"
                name="degree"
                value={formData.education.degree}
                onChange={handleEducationChange}
              />

              <InputField
                label="Department"
                name="department"
                value={formData.education.department}
                onChange={handleEducationChange}
              />

              <InputField
                label="Graduation Year"
                name="graduationYear"
                value={formData.education.graduationYear}
                onChange={handleEducationChange}
              />
            </div>
          </SectionCard>

          {/* EXPERIENCE */}

          <SectionCard title="Experience">
            <div className="space-y-6">
              {formData.experience.map((exp, index) => (
                <div
                  key={index}
                  className="border border-slate-200 rounded-2xl p-5 bg-slate-50"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Experience #{index + 1}
                    </h3>

                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField
                      label="Company Name"
                      value={exp.companyName}
                      onChange={(e) =>
                        handleExperienceChange(
                          index,
                          "companyName",
                          e.target.value,
                        )
                      }
                    />

                    <InputField
                      label="Role"
                      value={exp.role}
                      onChange={(e) =>
                        handleExperienceChange(index, "role", e.target.value)
                      }
                    />

                    <InputField
                      label="Location"
                      value={exp.location}
                      onChange={(e) =>
                        handleExperienceChange(
                          index,
                          "location",
                          e.target.value,
                        )
                      }
                    />

                    <SelectField
                      label="Employment Type"
                      value={exp.employmentType}
                      onChange={(e) =>
                        handleExperienceChange(
                          index,
                          "employmentType",
                          e.target.value,
                        )
                      }
                      options={[
                        "Full-time",
                        "Internship",
                        "Part-time",
                        "Freelance",
                        "Contract",
                        "Founder",
                      ]}
                    />

                    <SelectField
                      label="Work Mode"
                      value={exp.workMode}
                      onChange={(e) =>
                        handleExperienceChange(
                          index,
                          "workMode",
                          e.target.value,
                        )
                      }
                      options={["Remote", "Hybrid", "Onsite"]}
                    />

                    <InputField
                      label="Start Date"
                      type="date"
                      value={exp.startDate}
                      onChange={(e) =>
                        handleExperienceChange(
                          index,
                          "startDate",
                          e.target.value,
                        )
                      }
                    />

                    {!exp.currentlyWorking && (
                      <InputField
                        label="End Date"
                        type="date"
                        value={exp.endDate}
                        onChange={(e) =>
                          handleExperienceChange(
                            index,
                            "endDate",
                            e.target.value,
                          )
                        }
                      />
                    )}
                  </div>

                  <div className="mt-5">
                    <TextAreaField
                      label="Description"
                      value={exp.description}
                      onChange={(e) =>
                        handleExperienceChange(
                          index,
                          "description",
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <div className="mt-5">
                    <TagInput
                      label="Skills Used"
                      value={exp.skillsUsed}
                      setFormData={setFormData}
                      field="skillsUsed"
                      nested
                      nestedIndex={index}
                      nestedField="experience"
                    />
                  </div>

                  <div className="flex items-center gap-3 mt-5">
                    <input
                      type="checkbox"
                      checked={exp.currentlyWorking}
                      onChange={(e) =>
                        handleExperienceChange(
                          index,
                          "currentlyWorking",
                          e.target.checked,
                        )
                      }
                    />

                    <label className="text-sm font-medium text-slate-700">
                      Currently Working Here
                    </label>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addExperience}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl border border-slate-200 text-slate-700 font-medium transition"
              >
                + Add Experience
              </button>
            </div>
          </SectionCard>

          {/* ACHIEVEMENTS */}

          <SectionCard title="Achievements">
            <div className="space-y-6">
              {formData.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="border border-slate-200 rounded-2xl p-5 bg-slate-50"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Achievement #{index + 1}
                    </h3>

                    <button
                      type="button"
                      onClick={() => removeAchievement(index)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField
                      label="Title"
                      value={achievement.title}
                      onChange={(e) =>
                        handleAchievementChange(index, "title", e.target.value)
                      }
                    />

                    <SelectField
                      label="Achievement Type"
                      value={achievement.achievementType}
                      onChange={(e) =>
                        handleAchievementChange(
                          index,
                          "achievementType",
                          e.target.value,
                        )
                      }
                      options={[
                        "Award",
                        "Promotion",
                        "Certification",
                        "Hackathon",
                        "Research Paper",
                        "Patent",
                        "Speaker",
                        "Leadership",
                        "Startup",
                        "Open Source",
                        "Other",
                      ]}
                    />

                    <InputField
                      label="Date"
                      type="date"
                      value={achievement.date}
                      onChange={(e) =>
                        handleAchievementChange(index, "date", e.target.value)
                      }
                    />
                  </div>

                  <div className="mt-5">
                    <TextAreaField
                      label="Description"
                      value={achievement.description}
                      onChange={(e) =>
                        handleAchievementChange(
                          index,
                          "description",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addAchievement}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl border border-slate-200 text-slate-700 font-medium transition"
              >
                + Add Achievement
              </button>
            </div>
          </SectionCard>

          {/* VISIBILITY */}

          <SectionCard title="Profile Visibility">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Profile Visibility"
                value={formData.visibilityControls.profileVisibility}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,

                    visibilityControls: {
                      ...prev.visibilityControls,

                      profileVisibility: e.target.value,
                    },
                  }))
                }
                options={["Public", "AlumniOnly", "Private"]}
              />

              <PreferenceToggle
                label="Allow Direct Messages"
                value={formData.visibilityControls.allowDirectMessages}
                onClick={() => handleVisibilityChange("allowDirectMessages")}
              />

              <PreferenceToggle
                label="Show Email"
                value={formData.visibilityControls.showEmail}
                onClick={() => handleVisibilityChange("showEmail")}
              />

              <PreferenceToggle
                label="Show Phone"
                value={formData.visibilityControls.showPhone}
                onClick={() => handleVisibilityChange("showPhone")}
              />
            </div>
          </SectionCard>
        </form>
      </div>
    </div>
  );
}

// =========================================
// REUSABLE COMPONENTS
// =========================================

function SectionCard({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">{title}</h2>

      {children}
    </div>
  );
}

function InputField({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>

      <input
        {...props}
        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition bg-white"
      />
    </div>
  );
}

function TextAreaField({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>

      <textarea
        rows={5}
        {...props}
        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition resize-none bg-white"
      />
    </div>
  );
}

function SelectField({ label, options, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>

      <select
        {...props}
        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition bg-white"
      >
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function PreferenceToggle({ label, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition"
    >
      <span className="font-medium text-slate-700">{label}</span>

      <div
        className={`px-4 py-2 rounded-full text-sm font-semibold ${
          value ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
        }`}
      >
        {value ? "Enabled" : "Disabled"}
      </div>
    </button>
  );
}

function TagInput({
  label,
  value,
  setFormData,
  field,
  nested = false,
  nestedIndex = null,
  nestedField = null,
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    if (!input.trim()) return;

    if (nested) {
      setFormData((prev) => {
        const updatedNested = [...prev[nestedField]];

        updatedNested[nestedIndex][field] = [
          ...updatedNested[nestedIndex][field],
          input.trim(),
        ];

        return {
          ...prev,

          [nestedField]: updatedNested,
        };
      });
    } else {
      setFormData((prev) => ({
        ...prev,

        [field]: [...prev[field], input.trim()],
      }));
    }

    setInput("");
  };

  const removeTag = (index) => {
    if (nested) {
      setFormData((prev) => {
        const updatedNested = [...prev[nestedField]];

        updatedNested[nestedIndex][field] = updatedNested[nestedIndex][
          field
        ].filter((_, idx) => idx !== index);

        return {
          ...prev,

          [nestedField]: updatedNested,
        };
      });
    } else {
      setFormData((prev) => ({
        ...prev,

        [field]: prev[field].filter((_, idx) => idx !== index),
      }));
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-3">
        {label}
      </label>

      <div className="flex gap-3 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Add ${label}`}
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100"
        />

        <button
          type="button"
          onClick={addTag}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {value?.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100"
          >
            <span className="text-sm text-blue-700">{item}</span>

            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
