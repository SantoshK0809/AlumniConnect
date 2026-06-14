import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  EnvelopeIcon, 
  PhoneIcon,
  AcademicCapIcon, 
  BookOpenIcon,
  BriefcaseIcon,
  PencilSquareIcon,
  SparklesIcon,
  TrophyIcon,
  IdentificationIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";
import TeacherProfileForm from "./ProfileSetup";

const TeacherProfile = ({ externalProfile }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(externalProfile || null);
  const [loading, setLoading] = useState(!externalProfile);
  const [editing, setEditing] = useState(false);

  // -------- DUMMY TEACHER PROFILE (fallback) ----------
  const dummyTeacher = {
    name: "Swati Gaikwad",
    role: "teacher",
    email: "swati.gaikwad@college.edu",
    department: "Computer Engineering",
    emp_id: "TCH-001",
    designation: "Assistant Professor",
    experienceYears: 6,
    contact: "+91 9876543210",
    bio: "Dedicated educator passionate about teaching Data Structures and Python. Promised to bridging the gap between academia and industry.",
    specialization: ["Data Structures", "Python Programming", "Software Engineering"],
    publications: [
      "Research Paper on AI-based Student Analytics (2023)",
      "Deep Learning Approaches in Education (2022)",
    ],
    achievements: [
      "Best Faculty Award 2023",
      "NPTEL Gold Certificate in Python",
    ],
    skills: ["Python", "Machine Learning", "C++", "DBMS", "Teaching Methodology"],
    qualifications: "M.Tech in Computer Science & Engineering"
  };

  useEffect(() => {
    if (externalProfile) {
      setProfile(externalProfile);
      setLoading(false);
      return;
    }
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:4000/api/teacher/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProfile(res.data);
      } catch (err) {
        console.error("Backend offline → using dummy teacher profile.", err);
        setProfile(dummyTeacher);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [externalProfile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-slate-700 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (editing) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-slate-50/80 py-10"
      >
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => setEditing(false)}
            className="group mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Return to Faculty Profile
          </button>
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200 p-8 border border-slate-100">
            <TeacherProfileForm />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] selection:bg-slate-200">
      {/* Structural Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-100/20 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-100/20 blur-3xl opacity-50" />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
      >
        {/* Academic Header Card */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-300/40 overflow-hidden border border-white">
          <div className="h-64 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950" />
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            {profile?.coverImage?.url && (
              <img
                src={profile.coverImage.url}
                className="w-full h-full object-cover opacity-30"
                alt="Cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          <div className="px-12 pb-12">
            <div className="relative flex flex-col items-center md:flex-row md:items-end -mt-24 md:px-4">
              <motion.div 
                whileHover={{ y: -5 }}
                className="relative z-10"
              >
                {profile?.profileImage?.url ? (
                  <img
                    src={profile.profileImage.url}
                    alt="Profile"
                    className="w-44 h-44 rounded-3xl border-[8px] border-white object-cover shadow-2xl"
                  />
                ) : (
                  <div className="w-44 h-44 rounded-3xl border-[8px] border-white bg-slate-700 flex items-center justify-center text-6xl font-light text-white shadow-2xl tracking-tighter">
                    {profile?.name?.charAt(0)}
                  </div>
                )}
                <div className="absolute bottom-4 -right-2 bg-indigo-600 text-white p-2 rounded-xl shadow-lg border-4 border-white">
                  <IdentificationIcon className="w-6 h-6" />
                </div>
              </motion.div>

              <div className="mt-8 md:mt-0 md:ml-10 flex-1 text-center md:text-left">
                <h1 className="text-4xl font-black text-slate-900 leading-tight">
                  {profile?.name}
                </h1>
                <p className="text-indigo-600 font-bold text-lg mt-1">
                  {profile?.designation || "Faculty Member"}
                </p>
                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-6 text-slate-500 font-bold text-sm tracking-wide">
                  <span className="flex items-center gap-2">
                    <BriefcaseIcon className="w-5 h-5 text-slate-400" />
                    {profile?.experienceYears || 0} Years Experience
                  </span>
                  <span className="flex items-center gap-2">
                    <AcademicCapIcon className="w-5 h-5 text-slate-400" />
                    Dept. of {profile?.department || "Education"}
                  </span>
                </div>
              </div>

              {!externalProfile && (
                <div className="mt-8 md:mt-0">
                  <button
                    onClick={() => setEditing(true)}
                    className="px-8 py-4 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl font-black transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center gap-2"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                    Update Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Body */}
          <div className="lg:col-span-8 space-y-10">
            <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200 border border-slate-50">
              <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <SparklesIcon className="w-6 h-6 text-indigo-600" />
                Academic Philosophy
              </h3>
              <p className="text-xl text-slate-600 leading-relaxed font-medium italic border-l-4 border-indigo-100 pl-6 py-2">
                "{profile?.bio || "Committed to academic excellence and student success through innovative teaching methodologies."}"
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200 border border-slate-50">
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                  <BookOpenIcon className="w-6 h-6 text-indigo-600" />
                  Specializations
                </h3>
                <ul className="space-y-3">
                  {profile?.specialization?.map((spec, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 font-bold bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      {spec}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200 border border-slate-50">
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                  <TrophyIcon className="w-6 h-6 text-indigo-600" />
                  Key Publications
                </h3>
                <ul className="space-y-3">
                  {profile?.publications?.map((pub, i) => (
                    <li key={i} className="text-sm font-semibold text-slate-600 italic bg-blue-50/50 p-4 rounded-2xl border border-blue-50 leading-snug">
                      "{pub}"
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-10">
            <section className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-200 border border-slate-800 text-white">
              <h3 className="text-xl font-bold mb-8 underline decoration-indigo-500 decoration-4 underline-offset-8">Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <EnvelopeIcon className="w-6 h-6 text-indigo-400 mt-1" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Email</p>
                    <p className="text-sm font-bold truncate">{profile?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <PhoneIcon className="w-6 h-6 text-indigo-400 mt-1" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Direct Contact</p>
                    <p className="text-sm font-bold">{profile?.contact || "Faculity Extension"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <AcademicCapIcon className="w-6 h-6 text-indigo-400 mt-1" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Credentials</p>
                    <p className="text-sm font-bold leading-relaxed">{profile?.qualifications || "Senior Faculty"}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200 border border-slate-50">
              <h3 className="text-xl font-black text-slate-900 mb-6">Honors</h3>
              <div className="space-y-4">
                {profile?.achievements?.map((ach, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <TrophyIcon className="w-5 h-5 text-yellow-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">{ach}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherProfile;
