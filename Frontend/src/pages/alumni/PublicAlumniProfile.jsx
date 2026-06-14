import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MentorshipRequestModal from "../../features/mentorship/components/MentorshipRequestModal";

const PublicAlumniProfile = () => {
  const { userId } = useParams();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:4000/api/discovery/profile/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        console.log(
          "Profile data for searched user from backend",
          response.data,
        );
        setProfileData(response.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleMessage = () => {
    navigate(`/messages/${user._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg font-medium">Loading profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white shadow-md rounded-2xl p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Profile Not Found
          </h2>

          <p className="text-gray-500">
            This alumni profile does not exist or may have been removed.
          </p>
        </div>
      </div>
    );
  }

  const user = profileData.user || {};

  const profile = profileData.profile || {};

  const professionalProfile = profileData.professionalProfile || {};

  const profileImg = profile?.profileImage?.url;

  const education = professionalProfile.education || {};

  const experience = professionalProfile.experience || [];

  const achievements = professionalProfile.achievements || [];

  const skills = professionalProfile.skills || [];

  const displayName =
    user.name || user.email?.split("@")[0] || "Unknown Alumni";

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-10 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* HERO SECTION */}

        <div className="bg-white rounded-3xl shadow-md overflow-hidden">
          {/* COVER */}

          <div className="h-36 sm:h-36 bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 relative">
            {profile?.coverImage?.url && (
              <img
                src={profile.coverImage.url}
                alt="cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* PROFILE CONTENT */}

          <div className="px-4 sm:px-8 pb-6 relative">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              {/* LEFT SIDE */}

              <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-14 sm:-mt-16">
                <div className="w-28 h-8 sm:w-36 sm:h-36 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg flex items-center justify-center text-4xl font-bold text-gray-700">
                  {profileImg ? (
                    <img
                      src={profileImg}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    displayName[0]?.toUpperCase()
                  )}
                </div>

                <div className="pt-2 sm:pb-2">
                  <h1 className="text-2xl sm:text-4xl font-bold text-white">
                    {displayName}
                  </h1>

                  {professionalProfile.currentRole && (
                    <p className="text-lg text-gray-700 mt-3 font-medium">
                      {professionalProfile.currentRole}
                    </p>
                  )}

                  {professionalProfile.currentCompany && (
                    <p className="text-gray-500 mt-1">
                      {professionalProfile.currentCompany}
                    </p>
                  )}

                  {professionalProfile.currentLocation && (
                    <p className="text-sm text-gray-500 mt-1">
                      {professionalProfile.currentLocation}
                    </p>
                  )}
                </div>
              </div>

              {/* RIGHT SIDE */}

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <button
                  onClick={handleMessage}
                  className="w-full sm:w-auto px-3 py-2 cursor-pointer bg-white border-2 border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl font-medium transition"
                >
                  Message Alumni
                </button>
                <button
                  onClick={() => setOpen(true)}
                  className="w-full sm:w-auto px-3 py-2 cursor-pointer bg-white border-2 border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl font-medium transition"
                >
                  Request Mentorship
                </button>
              </div>
            </div>
          </div>
        </div>

        {open && (
          <MentorshipRequestModal
            open={open}
            setOpen={setOpen}
            alumniId={userId}
          />
        )}

        {/* ABOUT */}

        {professionalProfile.bio && (
          <div className="bg-white rounded-3xl shadow-md p-5 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">About</h2>

            <p className="text-gray-600 leading-relaxed text-[15px] sm:text-base">
              {professionalProfile.bio}
            </p>
          </div>
        )}

        {/* PROFESSIONAL DETAILS */}

        <div className="bg-white rounded-3xl shadow-md p-5 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Professional Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {professionalProfile.industry && (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Industry</p>
                <p className="font-semibold text-gray-800">
                  {professionalProfile.industry}
                </p>
              </div>
            )}

            {professionalProfile.employmentType && (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Employment Type</p>
                <p className="font-semibold text-gray-800">
                  {professionalProfile.employmentType}
                </p>
              </div>
            )}

            {professionalProfile.workMode && (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Work Mode</p>
                <p className="font-semibold text-gray-800">
                  {professionalProfile.workMode}
                </p>
              </div>
            )}

            {professionalProfile.professionalStatus && (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">
                  Professional Status
                </p>
                <p className="font-semibold text-gray-800">
                  {professionalProfile.professionalStatus}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SKILLS */}

        {skills.length > 0 && (
          <div className="bg-white rounded-3xl shadow-md p-5 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">Skills</h2>

            <div className="flex flex-wrap gap-3">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* EXPERIENCE */}

        {experience.length > 0 && (
          <div className="bg-white rounded-3xl shadow-md p-5 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Experience
            </h2>

            <div className="space-y-5">
              {experience.map((exp, index) => (
                <div
                  key={index}
                  className="border border-gray-100 rounded-2xl p-5 bg-gray-50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {exp.role}
                      </h3>

                      <p className="text-gray-700 font-medium mt-1">
                        {exp.company}
                      </p>

                      {exp.location && (
                        <p className="text-sm text-gray-500 mt-1">
                          {exp.location}
                        </p>
                      )}
                    </div>

                    {(exp.startDate || exp.endDate) && (
                      <div className="text-sm text-gray-500 whitespace-nowrap">
                        {/* {exp.startDate} - {exp.endDate || "Present"} */}
                        {new Date(exp.startDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        -{" "}
                        {new Date(exp.endDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    )}
                  </div>

                  {exp.description && (
                    <p className="text-gray-600 mt-4 leading-relaxed text-sm sm:text-base">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EDUCATION */}

        {(education.degree || education.department) && (
          <div className="bg-white rounded-3xl shadow-md p-5 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Education</h2>

            <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50">
              {education.degree && (
                <h3 className="text-lg font-semibold text-gray-900">
                  {education.degree}
                </h3>
              )}

              {education.department && (
                <p className="text-gray-700 mt-1 font-medium">
                  {education.department}
                </p>
              )}

              {education.graduationYear && (
                <p className="text-sm text-gray-500 mt-2">
                  {education.graduationYear}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ACHIEVEMENTS */}

        {/* {achievements.length > 0 && (
          <div className="bg-white rounded-3xl shadow-md p-5 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Achievements
            </h2>

            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4"
                >
                  <p className="text-gray-700 font-medium">
                    🏆 {achievement}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* ACHIEVEMENTS */}

        {achievements.length > 0 && (
          <div className="bg-white rounded-3xl shadow-md p-5 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Achievements
            </h2>

            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        🏆 {achievement.title}
                      </h3>

                      {achievement.achievementType && (
                        <p className="text-sm text-yellow-700 font-medium mt-1">
                          {achievement.achievementType}
                        </p>
                      )}
                    </div>

                    {/* {achievement.date && (
                      <p className="text-sm text-gray-500 whitespace-nowrap">
                        {achievement.date}
                      </p>
                    )} */}
                    {achievement.date && (
                      <p className="text-sm text-gray-500 whitespace-nowrap">
                        {new Date(achievement.date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </p>
                    )}
                  </div>

                  {achievement.description && (
                    <p className="text-gray-600 mt-3 leading-relaxed">
                      {achievement.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicAlumniProfile;
