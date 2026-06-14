import axios from "axios";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function AlumniProfessionalProfile() {
  const [alumniData, setAlumniData] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlumniData();
  }, []);

  const fetchAlumniData = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:4000/api/alumni/achievements/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Fetched alumni profile data:", res.data);
      setAlumniData(res.data.data);
    } catch (error) {
      console.log("Error fetching alumni profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-lg font-medium text-slate-700">
          Loading Professional Profile...
        </div>
      </div>
    );
  }

  // =========================================
  // NO PROFILE
  // =========================================

  if (!alumniData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center px-6">
        <div className="max-w-2xl w-full bg-white border border-slate-200 shadow-xl rounded-3xl p-10 text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 14l9-5-9-5-9 5 9 5zm0 0v6"
              />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Build Your Professional Alumni Profile
          </h1>

          <p className="mt-5 text-slate-600 leading-8 text-lg">
            Showcase your professional journey, achievements, technical skills,
            and help students connect with alumni working across industries and
            companies.
          </p>

          <div className="mt-10">
            <Link
              to="/alumni/professional-profile/edit"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Create Professional Profile
            </Link>
          </div>

          <p className="mt-5 text-sm text-slate-400">
            It only takes a few minutes to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    // <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900 p-4 md:p-8">
    <div className="min-h-screen text-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}

        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-5">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  {alumniData?.currentRole || "Professional Alumni"}
                </h1>

                <p className="text-slate-600 mt-2 text-lg">
                  {alumniData?.currentCompany}

                  {alumniData?.currentLocation &&
                    ` • ${alumniData.currentLocation}`}
                </p>
              </div>

              {/* TAGS */}

              <div className="flex flex-wrap gap-3">
                {alumniData?.professionalStatus && (
                  <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    {alumniData.professionalStatus}
                  </span>
                )}

                {alumniData?.employmentType && (
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {alumniData.employmentType}
                  </span>
                )}

                {alumniData?.workMode && (
                  <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    {alumniData.workMode}
                  </span>
                )}

                {alumniData?.industry && (
                  <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {alumniData.industry}
                  </span>
                )}
              </div>

              {/* PROFILE COMPLETENESS */}

              <div className="max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-500">Profile Completeness</p>

                  <p className="text-sm font-medium text-slate-700">
                    {alumniData?.profileCompleteness || 0}%
                  </p>
                </div>

                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{
                      width: `${alumniData?.profileCompleteness || 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="flex flex-col items-start lg:items-end gap-4">
              <Link
                to="/alumni/professional-profile/edit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium transition"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* GRID */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* LEFT SIDE */}

          <div className="xl:col-span-2 space-y-8">
            {/* EXPERIENCE */}

            <div className="bg-white rounded-3xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Experience</h2>

                <span className="text-sm text-slate-500">
                  {alumniData?.experience?.length || 0} Experiences
                </span>
              </div>

              {alumniData?.experience?.length > 0 ? (
                <div className="space-y-6">
                  {alumniData.experience.map((exp, index) => (
                    <div
                      key={index}
                      className="border border-slate-200 rounded-2xl p-5 bg-slate-50"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold">{exp.role}</h3>

                          <p className="text-blue-600 mt-1 font-medium">
                            {exp.companyName}
                          </p>

                          <p className="text-slate-500 mt-1 text-sm">
                            {exp.location}

                            {exp.workMode && ` • ${exp.workMode}`}
                          </p>

                          {exp.employmentType && (
                            <p className="text-slate-500 text-sm mt-1">
                              {exp.employmentType}
                            </p>
                          )}
                        </div>

                        <div className="text-sm text-slate-500">
                          {exp.startDate
                            ? new Date(exp.startDate).getFullYear()
                            : ""}

                          {" - "}

                          {exp.currentlyWorking
                            ? "Present"
                            : exp.endDate
                              ? new Date(exp.endDate).getFullYear()
                              : ""}
                        </div>
                      </div>

                      {exp.description && (
                        <p className="text-slate-600 mt-5 leading-7">
                          {exp.description}
                        </p>
                      )}

                      {exp.skillsUsed?.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-5">
                          {exp.skillsUsed.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">
                  No experience added yet.
                </div>
              )}
            </div>

            {/* ACHIEVEMENTS */}

            <div className="bg-white rounded-3xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Achievements</h2>

                <span className="text-sm text-slate-500">
                  {alumniData?.achievements?.length || 0} Achievements
                </span>
              </div>

              {alumniData?.achievements?.length > 0 ? (
                <div className="space-y-5">
                  {alumniData.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="border border-slate-200 rounded-2xl p-5 bg-slate-50"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold">
                            {achievement.title}
                          </h3>

                          {achievement.achievementType && (
                            <p className="text-emerald-600 mt-1 text-sm font-medium">
                              {achievement.achievementType}
                            </p>
                          )}
                        </div>

                        <span className="text-sm text-slate-500">
                          {achievement.date
                            ? new Date(achievement.date).toLocaleDateString()
                            : ""}
                        </span>
                      </div>

                      {achievement.description && (
                        <p className="text-slate-600 mt-4 leading-7">
                          {achievement.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">
                  No achievements added yet.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}

          <div className="space-y-8">
            {/* SKILLS */}

            <div className="bg-white rounded-3xl p-6 border border-slate-200">
              <h2 className="text-2xl font-bold mb-5">Skills</h2>

              {alumniData?.skills?.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {alumniData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500">No skills added yet.</div>
              )}
            </div>

            {/* EDUCATION */}

            <div className="bg-white rounded-3xl p-6 border border-slate-200">
              <h2 className="text-2xl font-bold mb-5">Education</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm">Degree</p>

                  <p className="font-medium mt-1">
                    {alumniData?.education?.degree || "Not Added"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 text-sm">Department</p>

                  <p className="font-medium mt-1">
                    {alumniData?.education?.department || "Not Added"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 text-sm">Graduation Year</p>

                  <p className="font-medium mt-1">
                    {alumniData?.education?.graduationYear || "Not Added"}
                  </p>
                </div>
              </div>
            </div>

            {/* PROFILE PREFERENCES */}

            <div className="bg-white rounded-3xl p-6 border border-slate-200">
              <h2 className="text-2xl font-bold mb-5">Profile Preferences</h2>

              <div className="space-y-4">
                <PreferenceItem
                  label="Allow Direct Messages"
                  value={alumniData?.visibilityControls?.allowDirectMessages}
                />

                <PreferenceItem
                  label="Show Email"
                  value={alumniData?.visibilityControls?.showEmail}
                />

                <PreferenceItem
                  label="Show Phone"
                  value={alumniData?.visibilityControls?.showPhone}
                />

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-sm">Profile Visibility</span>

                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {alumniData?.visibilityControls?.profileVisibility ||
                      "Public"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreferenceItem({ label, value }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
      <span className="text-sm">{label}</span>

      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          value ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
        }`}
      >
        {value ? "Enabled" : "Disabled"}
      </span>
    </div>
  );
}
