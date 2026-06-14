import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  EnvelopeIcon, 
  MapPinIcon, 
  AcademicCapIcon, 
  BriefcaseIcon,
  PencilSquareIcon,
  SparklesIcon,
  CodeBracketIcon,
  TrophyIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";
import axios from "axios";
import { useConnections } from "../../hooks/useConnections";
import StudentProfileForm from "./ProfileSetup";

const dummyProfile = {
  name: "John Doe",
  batch: 2024,
  address: "Pune, India",
  email: "john@example.com",
  currentYear: "2nd Year",
  bio: "Passionate about technology and innovation.",
  skills: ["React", "Node.js", "MongoDB", "JavaScript"],
  projects: [
    { title: "Portfolio Site", description: "Personal portfolio built with React" },
    { title: "Chat App", description: "Real-time messaging application" }
  ],
  achievements: ["Dean's List 2023", "Hackathon Winner"],
  connections: 45,
  posts: 12,
  profileViews: 234,
};

const ProfilePage = ({ externalProfile }) => {
  const navigate = useNavigate();
  const { sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest, loading: connLoading } = useConnections();
  const [profile, setProfile] = useState(externalProfile || null);
  const [loading, setLoading] = useState(!externalProfile);
  const [editing, setEditing] = useState(false);

  const handleConnect = async () => {
    try {
      const targetId = profile.user?._id || profile._id;
      await sendConnectionRequest(targetId);
      setProfile(prev => ({ ...prev, status: "PENDING", isRequester: true }));
    } catch (err) {
      console.error("Connect error in Student Profile:", err);
    }
  };

  const handleAccept = async () => {
    try {
      await acceptConnectionRequest(profile.user?._id || profile._id);
      setProfile(prev => ({ ...prev, status: "ACCEPTED", connections: (prev.connections || 0) + 1 }));
    } catch (err) {}
  };

  const handleReject = async () => {
    try {
      await rejectConnectionRequest(profile.user?._id || profile._id);
      setProfile(prev => ({ ...prev, status: "NONE" }));
    } catch (err) {}
  };

  // ... dummy data ...

  useEffect(() => {
    if (externalProfile) {
      setProfile(externalProfile);
      setLoading(false);
      return;
    }
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
// ... same fetchProfile logic
        const res = await axios.get(
          "/api/student/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProfile(res.data);
      } catch (err) {
        console.error("Backend offline → using dummy student profile.", err);
        setProfile(dummyProfile);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (editing) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gray-50/50 backdrop-blur-sm py-10"
      >
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => setEditing(false)}
            className="group mb-8 flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Profile
          </button>
          <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100 p-8">
            <StudentProfileForm />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-indigo-100">
      {/* Mesh Gradient Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
      >
        {/* Main Header Card */}
        <div className="relative bg-white rounded-[2rem] shadow-2xl shadow-indigo-200/40 overflow-hidden border border-white/50 backdrop-blur-xl">
          {/* Cover Image Area */}
          <div className="h-48 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 animate-gradient-x" />
            {profile?.coverImage?.url && (
              <img
                src={profile.coverImage.url}
                className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                alt="Cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
          </div>

          {/* Profile Quick Info */}
          <div className="px-8 pb-10">
            <div className="relative flex flex-col sm:flex-row items-end -mt-16 sm:px-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative z-10 p-1 bg-white rounded-full shadow-lg"
              >
                {profile?.profileImage?.url ? (
                  <img
                    src={profile.profileImage.url}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-white object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white uppercase tracking-wider">
                    {profile?.name?.charAt(0)}
                  </div>
                )}
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-sm" />
              </motion.div>

              <div className="mt-6 sm:mt-0 sm:ml-6 flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {profile?.name}
                  </h1>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Student
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-4 text-gray-500 font-medium text-sm">
                  <span className="flex items-center gap-1.5">
                    <AcademicCapIcon className="w-4 h-4 text-indigo-500" />
                    {profile.batch ? `Class of ${profile?.batch}` : "Student"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPinIcon className="w-4 h-4 text-indigo-500" />
                    {profile?.address || "Pune, India"}
                  </span>
                </div>
              </div>

              {externalProfile && (
                <div className="mt-6 sm:mt-0 flex gap-3">
                  <button
                    onClick={() => navigate(`/${user.role.toLowerCase()}/messages`, { state: { selectedUser: profile } })}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200"
                  >
                    Message
                  </button>

                  {profile.status === "ACCEPTED" ? (
                    <span className="px-6 py-2.5 bg-green-100 text-green-700 rounded-xl font-bold flex items-center gap-2 border border-green-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Connected
                    </span>
                  ) : profile.status === "PENDING" ? (
                    profile.isRequester ? (
                      <button className="px-6 py-2.5 bg-gray-200 text-gray-500 rounded-xl font-bold border border-gray-100" disabled>
                        Pending
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleAccept}
                          className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold"
                          disabled={connLoading}
                        >
                          Accept
                        </button>
                        <button
                          onClick={handleReject}
                          className="px-6 py-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl font-bold"
                          disabled={connLoading}
                        >
                          Reject
                        </button>
                      </div>
                    )
                  ) : (
                    <button
                      onClick={handleConnect}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200"
                      disabled={connLoading}
                    >
                      Connect
                    </button>
                  )}
                </div>
              )}

              {!externalProfile && (
                <div className="mt-6 sm:mt-0 flex gap-3">
                  <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-95"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                    Edit Profile
                  </button>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="mt-12 grid grid-cols-3 divide-x divide-gray-100 bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
              {[
                { label: "Connections", value: profile?.connections || 0, color: "text-indigo-600" },
                { label: "Posts", value: profile?.posts || 0, color: "text-blue-600" },
                { label: "Views", value: profile?.profileViews || 0, color: "text-purple-600" },
              ].map((stat, idx) => (
                <div key={idx} className="text-center px-4">
                  <p className={`text-2xl font-bold ${stat.color} tracking-tight`}>
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Content Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - About & Info */}
          <div className="lg:col-span-1 space-y-8">
            <section className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-6">
                <SparklesIcon className="w-5 h-5 text-indigo-600" />
                About Me
              </h3>
              <p className="text-gray-600 leading-relaxed font-normal italic">
                "{profile?.bio || "No bio added yet."}"
              </p>
              
              <div className="mt-8 pt-8 border-t border-gray-50 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <EnvelopeIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email</p>
                    <p className="text-sm font-semibold text-gray-700">{profile?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <AcademicCapIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Current Year</p>
                    <p className="text-sm font-semibold text-gray-700">{profile?.currentYear || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl p-8 shadow-xl shadow-indigo-100/30 border border-gray-100">
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-6">
                <CodeBracketIcon className="w-5 h-5 text-indigo-600" />
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile?.skills?.map((s, i) => (
                  <motion.span
                    key={i}
                    whileHover={{ y: -2 }}
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold border border-indigo-100/50 shadow-sm"
                  >
                    {s}
                  </motion.span>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Projects & Achievements */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-8 border-b border-gray-50 pb-4">
                <BriefcaseIcon className="w-5 h-5 text-indigo-600" />
                Featured Projects
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile?.projects?.map((p, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="group p-6 rounded-[1.5rem] bg-gray-50 hover:bg-white hover:shadow-xl hover:shadow-indigo-100 transition-all border border-transparent hover:border-indigo-100"
                  >
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <CodeBracketIcon className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">{p?.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium line-clamp-2">
                      {p?.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-8 border-b border-gray-50 pb-4">
                <TrophyIcon className="w-5 h-5 text-indigo-600" />
                Major Achievements
              </h3>
              <div className="space-y-4">
                {profile?.achievements?.map((a, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100/20"
                  >
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <SparklesIcon className="w-5 h-5 text-yellow-500" />
                    </div>
                    <p className="text-gray-700 font-semibold pt-1 text-sm">{a}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
