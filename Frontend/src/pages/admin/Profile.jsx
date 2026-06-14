import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { 
  EnvelopeIcon, 
  PhoneIcon,
  ShieldCheckIcon, 
  UserGroupIcon,
  ChartBarIcon,
  KeyIcon,
  IdentificationIcon,
  ArrowLeftIcon,
  CogIcon,
  ServerIcon,
  ClipboardDocumentCheckIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";

const AdminProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // -------- DUMMY ADMIN PROFILE ----------
  const dummyAdmin = {
    name: user?.name || "System Admin",
    role: "admin",
    email: user?.email || "admin@alumniconnect.com",
    adminId: "ADM-999",
    department: "IT Infrastructure",
    designation: "System Administrator",
    accessLevel: "Full Access",
    contact: "+91 88888 77777",
    bio: "Chief System Administrator responsible for platform stability, user security, and data integrity of the AluminiConnect network.",
    responsibilities: [
      "User Authentication & Security",
      "Database Maintenance",
      "Module Integration",
      "System Performance Monitoring"
    ],
    stats: {
      usersManaged: "2,450+",
      systemUptime: "99.9%",
      pendingReviews: 12
    }
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:4000/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Map backend stats to profile format
        const statsData = res.data.data.stats;
        setProfile({
          ...dummyAdmin,
          name: user?.name,
          email: user?.email,
          stats: {
            usersManaged: statsData.find(s => s.label === "Total Users")?.value || 0,
            systemUptime: "99.9%",
            pendingReviews: 5 // Placeholder for now
          }
        });
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setProfile(dummyAdmin);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Decorative System Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-slate-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto py-12 px-4"
      >
        {/* Admin Header Section */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden border border-white">
          <div className="h-48 bg-slate-900 relative">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
             <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-transparent" />
          </div>

          <div className="px-12 pb-12">
            <div className="relative flex flex-col items-center md:flex-row md:items-end -mt-20 gap-8">
              <motion.div whileHover={{ scale: 1.05 }} className="relative">
                <div className="w-40 h-40 rounded-3xl border-[6px] border-white bg-slate-800 flex items-center justify-center text-5xl font-black text-white shadow-2xl">
                  {profile.name.charAt(0)}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-2 rounded-xl shadow-lg border-4 border-white">
                  <ShieldCheckIcon className="w-6 h-6" />
                </div>
              </motion.div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <h1 className="text-4xl font-black text-slate-900">{profile.name}</h1>
                  <span className="inline-flex px-4 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-widest rounded-full border border-indigo-100 w-fit mx-auto md:mx-0">
                    Administrator
                  </span>
                </div>
                <p className="text-slate-500 font-bold mt-2 flex items-center justify-center md:justify-start gap-2 italic">
                  <KeyIcon className="w-4 h-4" />
                  {profile.designation} • {profile.accessLevel}
                </p>
              </div>

              <button 
                onClick={() => navigate('/teacher/admin/manage')}
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black transition-all shadow-xl active:scale-95 flex items-center gap-2"
              >
                <CogIcon className="w-5 h-5" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-100 border border-slate-50">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <ClipboardDocumentCheckIcon className="w-6 h-6 text-indigo-600" />
                Statement of Responsibility
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed font-medium italic border-l-4 border-indigo-50 pl-6">
                "{profile.bio}"
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-100 border border-slate-50">
                  <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                    <UserGroupIcon className="w-5 h-5 text-indigo-600" />
                    Core Domains
                  </h3>
                  <div className="space-y-3">
                    {profile.responsibilities.map((res, i) => (
                      <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 font-bold text-slate-700 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        {res}
                      </div>
                    ))}
                  </div>
               </section>

               <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-100 border border-slate-50">
                  <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5 text-indigo-600" />
                    System Metrics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-50 text-center">
                       <p className="text-2xl font-black text-indigo-700">{profile.stats.usersManaged}</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase">Users</p>
                    </div>
                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-50 text-center">
                       <p className="text-2xl font-black text-emerald-700">{profile.stats.systemUptime}</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase">Uptime</p>
                    </div>
                  </div>
               </section>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
             <section className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-800 text-white">
                <h3 className="text-lg font-black mb-8 underline decoration-indigo-500 decoration-4 underline-offset-8">Admin Contact</h3>
                <div className="space-y-6">
                   <div className="flex items-start gap-4">
                      <EnvelopeIcon className="w-6 h-6 text-indigo-400 mt-1" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure Email</p>
                        <p className="text-sm font-bold truncate">{profile.email}</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-4">
                      <PhoneIcon className="w-6 h-6 text-indigo-400 mt-1" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Internal Comms</p>
                        <p className="text-sm font-bold">{profile.contact}</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-4">
                      <ServerIcon className="w-6 h-6 text-indigo-400 mt-1" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">ID Reference</p>
                        <p className="text-sm font-bold">{profile.adminId}</p>
                      </div>
                   </div>
                </div>
             </section>

             <motion.div 
               whileHover={{ y: -5 }}
               className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-50 text-center"
             >
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                   <p className="text-2xl font-black text-red-600">{profile.stats.pendingReviews}</p>
                </div>
                <h4 className="text-sm font-black text-slate-900 uppercase">Pending Approvals</h4>
                <p className="text-xs text-slate-400 font-bold mt-1">Reviewing community requests</p>
                <button 
                  onClick={() => navigate('/teacher/admin/manage')}
                  className="w-full mt-6 py-3 bg-red-600 text-white rounded-xl font-black text-xs shadow-lg shadow-red-100 active:scale-95"
                >
                  Launch Review Queue
                </button>
             </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminProfile;
