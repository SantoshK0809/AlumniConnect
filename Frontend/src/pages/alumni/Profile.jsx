import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  EnvelopeIcon, 
  MapPinIcon, 
  AcademicCapIcon, 
  BriefcaseIcon,
  BuildingOfficeIcon,
  PencilSquareIcon,
  SparklesIcon,
  TrophyIcon,
  HandRaisedIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";
import { useConnections } from "../../hooks/useConnections";
import AlumniProfileForm from "./ProfileSetup";
import AlumniAchievement from "../../components/achievement/AlumniAchievement";

const AlumniProfile = ({ externalProfile }) => {
  const { user } = useAuth();
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
      console.error("Connect error in Alumni Profile:", err);
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
          "/api/alumni/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Fetched alumni personal profile data:", res.data);
        setProfile(res.data);
      } catch (err) {
        console.error("Backend offline → using dummy alumni profile.", err);
        setProfile(dummyAlumni);
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
          className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (editing) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-slate-50 py-10"
      >
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => setEditing(false)}
            className="group mb-8 flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors font-semibold"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Profile
          </button>
          <div className="bg-white rounded-3xl shadow-2xl shadow-emerald-100 p-8 border border-emerald-50">
            <AlumniProfileForm />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] selection:bg-emerald-100">
      {/* Subtle Background Decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-200/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-200/20 blur-3xl rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
      >
        {/* Main Header Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-300/50 overflow-hidden border border-white">
          <div className="h-56 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-800" />
            {profile?.coverImage?.url && (
              <img
                src={profile.coverImage.url}
                className="w-full h-full object-cover opacity-50 mix-blend-overlay"
                alt="Cover"
              />
            )}
            <div className="absolute bottom-4 right-6 text-white/80 text-xs font-bold tracking-widest uppercase">
              Alumni Network Certified
            </div>
          </div>

          <div className="px-10 pb-10">
            <div className="relative flex flex-col md:flex-row items-end -mt-20 md:px-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative z-10"
              >
                {profile?.profileImage?.url ? (
                  <img
                    src={profile.profileImage.url}
                    alt="Profile"
                    className="w-40 h-40 rounded-[2.5rem] border-[6px] border-white object-cover shadow-2xl"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-[2.5rem] border-[6px] border-white bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-5xl font-black text-white shadow-2xl">
                    {profile?.name?.charAt(0)}
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-emerald-50">
                  <SparklesIcon className="w-6 h-6 text-emerald-600" />
                </div>
              </motion.div>

              <div className="mt-8 md:mt-0 md:ml-8 flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    {profile?.name}
                  </h1>
                  <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 w-fit self-center">
                    Verified Alumni
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-5 text-slate-500 font-semibold text-sm">
                  <span className="flex items-center gap-2">
                    <AcademicCapIcon className="w-5 h-5 text-emerald-500" />
                    {profile.graduationYear ? `Class of ${profile?.graduationYear}` : "Graduate"}
                  </span>
                  <span className="flex items-center gap-2">
                    <BuildingOfficeIcon className="w-5 h-5 text-emerald-500" />
                    {profile?.currentCompany || "Open for Opportunities"}
                  </span>
                </div>
              </div>

              {externalProfile && (
                <div className="mt-8 md:mt-0 flex gap-3">
                  <button
                    onClick={() => navigate(`/${user.role.toLowerCase()}/messages`, { state: { selectedUser: profile } })}
                    className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-xl shadow-slate-200"
                  >
                    Message
                  </button>

                  {profile.status === "ACCEPTED" ? (
                    <span className="px-8 py-3.5 bg-emerald-50 text-emerald-700 rounded-2xl font-bold flex items-center gap-2 border border-emerald-100 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Connected
                    </span>
                  ) : profile.status === "PENDING" ? (
                    profile.isRequester ? (
                      <button className="px-8 py-3.5 bg-slate-100 text-slate-400 rounded-2xl font-bold border border-slate-200" disabled>
                        Pending
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleAccept}
                          className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg"
                          disabled={connLoading}
                        >
                          Accept
                        </button>
                        <button
                          onClick={handleReject}
                          className="px-8 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl font-bold border border-rose-100"
                          disabled={connLoading}
                        >
                          Reject
                        </button>
                      </div>
                    )
                  ) : (
                    <button
                      onClick={handleConnect}
                      className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-xl shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-95"
                      disabled={connLoading}
                    >
                      Connect
                    </button>
                  )}
                </div>
              )}

              {!externalProfile && (
                <div className="mt-8 md:mt-0">
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all shadow-xl shadow-slate-200 active:scale-95"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                    Edit Profile
                  </button>
                </div>
              )}
            </div>

            {/* Stats Bar */}
            <div className="mt-12 flex justify-around p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
              {[
                { label: "Network", value: profile?.connections || 0, color: "text-emerald-600", clickable: !externalProfile, action: () => navigate("/alumni/network") },
                { label: "Articles", value: profile?.post || 0, color: "text-teal-600" },
                { label: "Visits", value: profile?.profileViews || 0, color: "text-slate-600" },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className={`text-center group ${stat.clickable ? 'cursor-pointer hover:bg-slate-200 rounded-xl transition-colors p-2' : 'cursor-default'}`}
                  onClick={stat.clickable ? stat.action : undefined}
                >
                  <p className={`text-3xl font-black ${stat.color} transition-transform group-hover:scale-110`}>
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Sections */}
        {/* <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10"> */}
          {/* Sidebar */}
          {/* <div className="lg:col-span-4 space-y-8">
            <section className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3 underline decoration-emerald-200 decoration-4 underline-offset-4">
                <HandRaisedIcon className="w-6 h-6 text-emerald-600" />
                Expertise
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {profile?.skills?.map((skill, i) => (
                  <span key={i} className="px-4 py-2 bg-slate-50 text-slate-700 font-bold rounded-xl text-sm border border-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-100 transition-colors cursor-default">
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <MapPinIcon className="w-6 h-6 text-emerald-600" />
                Contact Info
              </h3>
              <div className="space-y-5">
                <div className="flex items-center gap-4 group">
                  <div className="p-3 bg-emerald-50 rounded-2xl group-hover:bg-emerald-100 transition-colors">
                    <EnvelopeIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal Email</p>
                    <p className="text-sm font-bold text-slate-700">{profile?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="p-3 bg-teal-50 rounded-2xl group-hover:bg-teal-100 transition-colors">
                    <MapPinIcon className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Location</p>
                    <p className="text-sm font-bold text-slate-700">{profile?.address || "Hiring Office"}</p>
                  </div>
                </div>
              </div>
            </section>
          </div> */}

          <AlumniAchievement className=" gap-3" />

          {/* Main Column */}
          {/* <div className="lg:col-span-8 space-y-8">
            <section className="bg-white rounded-[2rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-50">
              <h3 className="text-2xl font-black text-slate-900 mb-6">Professional Bio</h3>
              <p className="text-lg text-slate-600 leading-relaxed font-medium italic">
                "{profile?.bio || "A dedicated professional with a track record of excellence and a passion for community building."}"
              </p>
              
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-50">
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Industry Role</p>
                  <p className="text-xl font-bold text-slate-800">{profile?.currentPosition || "Consultant"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Department</p>
                  <p className="text-xl font-bold text-slate-800">{profile?.department || "Technology"}</p>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3 text-emerald-600">
                  <TrophyIcon className="w-6 h-6" />
                  Milestones
                </h3>
                <ul className="space-y-4">
                  {profile?.achievements?.map((ach, i) => (
                    <li key={i} className="flex gap-4 p-4 rounded-2xl bg-emerald-50/20 border border-emerald-50 font-semibold text-slate-700 text-sm">
                      <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      {ach}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3 text-teal-600">
                  <BriefcaseIcon className="w-6 h-6" />
                  Legacy Giving
                </h3>
                <ul className="space-y-4">
                  {profile?.contributions?.map((con, i) => (
                    <li key={i} className="flex gap-4 p-4 rounded-2xl bg-teal-50/20 border border-teal-50 font-semibold text-slate-700 text-sm">
                      <div className="mt-1 w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div> */}
        {/* </div> */}
      </motion.div>
    </div>
  );
};

export default AlumniProfile;
