import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon, 
  CalendarIcon, 
  BookOpenIcon, 
  BriefcaseIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowRightIcon,
  SparklesIcon,
  NewspaperIcon,
  ShieldCheckIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import { Card } from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import server from "../../../environment.js";

const RoleDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [profileRecommendations, setProfileRecommendations] = useState([]);
  const [jobRecommendations, setJobRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const role = user?.role?.toLowerCase();

  useEffect(() => {
    const fetchData = async () => {
      if (!role) return;
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch Dashboard Data
        const dashboardRes = await axios.get(`${server}/api/${role}/dashboard`, { headers });
        if (dashboardRes.data && dashboardRes.data.data) {
          setDashboardData(dashboardRes.data.data);
        }

        // Fetch Recommendations (Only for Student/Alumni)
        if (role === 'student' || role === 'alumni') {
          const recRes = await axios.get(`${server}/api/recommendations`, { headers });
          setProfileRecommendations(recRes.data.profileRecommendations || []);
          setJobRecommendations(recRes.data.jobRecommendations || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard/recommendations:', err);
        setError('Integration error: Could not sync real-time data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [role]);

  const dashboardConfigs = {
    student: {
      theme: "indigo",
      welcomeMessage: (name) => `Welcome, ${name}!`,
      subtitle: (prn) => `Academic Journey • PRN: ${prn}`,
      actions: [
        {
          title: "Alumni Network",
          description: "Connect with graduates for career guidance",
          buttonText: "Find Mentors",
          onClick: () => navigate('/student/directory'),
          icon: <UserGroupIcon className="w-6 h-6" />,
          color: "bg-indigo-50 text-indigo-600"
        },
        {
          title: "Campus Feed",
          description: "Stay updated with workshops and seminars",
          buttonText: "Explore Feed",
          onClick: () => navigate('/student/feed'),
          icon: <CalendarIcon className="w-6 h-6" />,
          color: "bg-blue-50 text-blue-600"
        },
        {
          title: "Mentor Hub",
          description: "See the status of your mentorship requests",
          buttonText: "My Mentors",
          onClick: () =>  navigate("/student/mentor-requests"),
          icon: <AcademicCapIcon className="w-6 h-6" />,
          color: "bg-teal-50 text-teal-600"
        },
        {
          title: "My Portfolio",
          description: "Access your shared projects and skills",
          buttonText: "View Profile",
          onClick: () => navigate('/student/profile'),
          icon: <BookOpenIcon className="w-6 h-6" />,
          color: "bg-purple-50 text-purple-600"
        }
      ]
    },
    alumni: {
      theme: "emerald",
      welcomeMessage: (name) => `Welcome back, ${name}!`,
      subtitle: (year) => `Distinguished Alumni • Class of ${year}`,
      actions: [
        {
          title: "Directory",
          description: "Post job opportunities or internships",
          buttonText: "Find People",
          onClick: () => navigate('/alumni/directory'),
          icon: <BriefcaseIcon className="w-6 h-6" />,
          color: "bg-emerald-50 text-emerald-600"
        },
        {
          title: "Mentor Hub",
          description: "Shape the future of current students",
          buttonText: "Guide Juniors",
          onClick: () =>  navigate("/alumni/mentor-requests"),
          icon: <AcademicCapIcon className="w-6 h-6" />,
          color: "bg-teal-50 text-teal-600"
        },
       
        {
          title: "Alumni Feed",
          description: "Reconnect with your own batchmates",
          buttonText: "Networking",
          onClick: () => navigate('/alumni/feed'),
          icon: <UserGroupIcon className="w-6 h-6" />,
          color: "bg-green-50 text-green-600"
        }
      ]
    },
    teacher: {
      theme: "blue",
      welcomeMessage: (name) => `Greetings, Prof. ${name}!`,
      subtitle: (department) => `Faculty Leader • Dept. of ${department}`,
      actions: [
        {
          title: "Directory",
          description: "Connect with current students and alumni",
          buttonText: "Search",
          onClick: () => navigate('/teacher/directory'),
          icon: <IdentificationIcon className="w-6 h-6" />,
          color: "bg-blue-50 text-blue-600"
        },
        {
          title: "Research Portal",
          description: "Publish updates or share publications",
          buttonText: "Add Record",
          onClick: () => navigate('/teacher/profile'),
          icon: <NewspaperIcon className="w-6 h-6" />,
          color: "bg-indigo-50 text-indigo-600"
        },
        {
          title: "Department Feed",
          description: "View department-wide updates",
          buttonText: "View Feed",
          onClick: () => navigate('/teacher/feed'),
          icon: <ChartBarIcon className="w-6 h-6" />,
          color: "bg-cyan-50 text-cyan-600"
        }
      ]
    },
    admin: {
      theme: "slate",
      welcomeMessage: (name) => `Command Center • ${name}`,
      subtitle: () => `System Administrator Oversight`,
      actions: [
        {
          title: "User Control",
          description: "Full moderation of all portal accounts",
          buttonText: "Audit Users",
          onClick: () => navigate('/teacher/admin/manage'),
          icon: <ShieldCheckIcon className="w-6 h-6" />,
          color: "bg-slate-100 text-slate-800"
        },
        {
          title: "Directory",
          description: "View all users in the system",
          buttonText: "Search",
          onClick: () => navigate('/teacher/admin/directory'),
          icon: <ChartBarIcon className="w-6 h-6" />,
          color: "bg-gray-100 text-gray-800"
        }
      ]
    }
  };

    // if (role) fetchDashboardData();
  // }, [role]);

  const currentConfig = dashboardConfigs[role] || dashboardConfigs.student;

  const getRoleBasePath = () => {
    if (role === "admin") return "/teacher/admin";
    return `/${role}`;
  };

  const handleStatClick = (label) => {
    const l = label.toLowerCase();
    const basePath = getRoleBasePath();
    if (l.includes("post")) navigate(`${basePath}/feed`);
    else if (l.includes("connection")) navigate(`${basePath}/directory`);
    else navigate(`${basePath}/profile`);
  };

  const themeMap = {
    student: {
      bg: 'bg-indigo-600', bgHover: 'hover:bg-indigo-700', bgLight: 'bg-indigo-50',
      bgBlur: 'bg-indigo-400/10', bgBlurHover: 'bg-indigo-500/10', bgGlow: 'bg-indigo-500/5', bgGlowHover: 'bg-indigo-500/10',
      text: 'text-indigo-600', textHover: 'group-hover:text-indigo-600',
      shadow: 'shadow-indigo-200', pulse: 'text-indigo-500',
      statBg: 'bg-indigo-50', statText: 'text-indigo-600',
      statBgHover: 'group-hover:bg-indigo-600',
    },
    alumni: {
      bg: 'bg-emerald-600', bgHover: 'hover:bg-emerald-700', bgLight: 'bg-emerald-50',
      bgBlur: 'bg-emerald-400/10', bgBlurHover: 'bg-emerald-500/10', bgGlow: 'bg-emerald-500/5', bgGlowHover: 'bg-emerald-500/10',
      text: 'text-emerald-600', textHover: 'group-hover:text-emerald-600',
      shadow: 'shadow-emerald-200', pulse: 'text-emerald-500',
      statBg: 'bg-emerald-50', statText: 'text-emerald-600',
      statBgHover: 'group-hover:bg-emerald-600',
    },
    teacher: {
      bg: 'bg-blue-600', bgHover: 'hover:bg-blue-700', bgLight: 'bg-blue-50',
      bgBlur: 'bg-blue-400/10', bgBlurHover: 'bg-blue-500/10', bgGlow: 'bg-blue-500/5', bgGlowHover: 'bg-blue-500/10',
      text: 'text-blue-600', textHover: 'group-hover:text-blue-600',
      shadow: 'shadow-blue-200', pulse: 'text-blue-500',
      statBg: 'bg-blue-50', statText: 'text-blue-600',
      statBgHover: 'group-hover:bg-blue-600',
    },
    admin: {
      bg: 'bg-slate-600', bgHover: 'hover:bg-slate-700', bgLight: 'bg-slate-50',
      bgBlur: 'bg-slate-400/10', bgBlurHover: 'bg-slate-500/10', bgGlow: 'bg-slate-500/5', bgGlowHover: 'bg-slate-500/10',
      text: 'text-slate-600', textHover: 'group-hover:text-slate-600',
      shadow: 'shadow-slate-200', pulse: 'text-slate-500',
      statBg: 'bg-slate-50', statText: 'text-slate-600',
      statBgHover: 'group-hover:bg-slate-600',
    },
  };

  const theme = themeMap[role] || themeMap.student;

  if (loading) {
    return (
      <div className="p-10 max-w-7xl mx-auto space-y-10">
        <div className="h-16 w-1/3 bg-gray-200 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 selection:bg-indigo-100">
      {/* Header with Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-8 rounded-[2.5rem] bg-white shadow-xl shadow-gray-200/50 border border-white overflow-hidden"
      >
        <div className={`absolute top-0 right-0 w-64 h-64 ${theme.bgBlur} blur-[100px] -mr-32 -mt-32 rounded-full`} />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              {currentConfig.welcomeMessage(user?.name || 'User')}
              <SparklesIcon className={`w-8 h-8 ${theme.pulse} animate-pulse`} />
            </h1>
            <p className="text-gray-500 font-bold mt-2 tracking-wide uppercase text-xs">
              {currentConfig.subtitle(
                role === 'student' ? user?.prn_number || 'STD-2025-XX'
                : role === 'alumni' ? user?.graduation_year || 'GRAD-XX'
                : user?.department || 'Faculty'
              )}
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate(`${getRoleBasePath()}/feed`)}
              className={`px-6 py-3 ${theme.bg} ${theme.bgHover} text-white rounded-2xl font-black shadow-lg ${theme.shadow} transition-all active:scale-95 text-sm`}
            >
              Go to Feed
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats with Hover Interactions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {dashboardData?.stats?.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8 }}
            onClick={() => handleStatClick(stat.label)}
            className="group relative bg-white p-8 rounded-[2rem] shadow-lg shadow-gray-100/50 border border-gray-100 hover:border-indigo-100 transition-all cursor-pointer overflow-hidden"
          >
             <div className={`absolute -bottom-4 -right-4 w-24 h-24 ${theme.bgGlow} blur-2xl ${theme.bgGlowHover} transition-colors`} />
             <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3">{stat.label}</h3>
             <div className="flex items-end justify-between">
               <span className={`text-4xl font-black text-gray-900 ${theme.textHover} transition-colors`}>
                 {stat.value.toLocaleString()}
               </span>
               <div className={`p-2 rounded-xl ${theme.statBg} ${theme.statText} ${theme.statBgHover} group-hover:text-white transition-all`}>
                  <ChartBarIcon className="w-5 h-5" />
               </div>
             </div>
          </motion.div>
        ))}
      </div>

      {/* Recommendations Section */}
      {(role === 'student' || role === 'alumni') && (
        <div className="space-y-12">
          {/* People Recommendations */}
          <div className="space-y-6">
            <div className="flex justify-between items-center ml-2">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-amber-500" />
                Recommended Connections
              </h2>
              <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-amber-100">
                AI Powered
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profileRecommendations.length > 0 ? (
                profileRecommendations.map((rec, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -5 }}
                    onClick={() => navigate(`/profile/${rec.role?.toLowerCase()}/${rec.user?._id || rec.user}`)}
                    className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-white hover:border-amber-100 transition-all cursor-pointer flex items-center gap-4 relative overflow-hidden"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 font-black text-xl shrink-0">
                      {rec.name?.charAt(0)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-black text-gray-900 truncate pr-8">{rec.name}</h4>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{rec.role}</p>
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {rec.skills?.slice(0, 2).map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-50 text-[10px] font-bold text-gray-400 rounded-lg whitespace-nowrap">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* ML Score Badge */}
                    <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                      {rec.matchPercentage}%
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="md:col-span-2 lg:col-span-3 p-8 bg-gray-50/50 rounded-[2.5rem] text-center border-2 border-dashed border-gray-100">
                  <p className="text-gray-400 font-bold italic">Complete your profile skills to see connection matches!</p>
                </div>
              )}
            </div>
          </div>

          {/* Job Recommendations */}
          <div className="space-y-6">
            <div className="flex justify-between items-center ml-2">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <BriefcaseIcon className="w-5 h-5 text-emerald-500" />
                Recommended Jobs
              </h2>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-100">
                AI Powered
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobRecommendations.length > 0 ? (
                jobRecommendations.slice(0, 3).map((job, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -5 }}
                    onClick={() => navigate(`${getRoleBasePath()}/jobs?jobId=${job._id}`)}
                    className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-white hover:border-emerald-100 transition-all cursor-pointer flex flex-col gap-4 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-lg shrink-0">
                        {job.company?.charAt(0)}
                      </div>
                      <div className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                        {job.matchPercentage}% Match
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 truncate text-lg leading-tight">{job.title}</h4>
                      <p className="text-xs text-gray-500 font-bold tracking-wide mt-1">{job.company}</p>
                      <div className="mt-3 flex gap-1 flex-wrap">
                        <span className="px-2 py-0.5 bg-gray-50 text-[10px] font-bold text-gray-400 rounded-lg">
                          {job.type}
                        </span>
                        {job.skills?.slice(0, 2).map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-50 text-[10px] font-bold text-gray-400 rounded-lg whitespace-nowrap">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="md:col-span-2 lg:col-span-3 p-8 bg-gray-50/50 rounded-[2.5rem] text-center border-2 border-dashed border-gray-100">
                  <p className="text-gray-400 font-bold italic">Add skills to your profile to get tailored job recommendations!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Quick Actions - Primary Focus */}
        <div className="lg:col-span-12">
           <h2 className="text-xl font-black text-gray-900 mb-8 ml-2 flex items-center gap-2">
             <SparklesIcon className="w-5 h-5 text-indigo-600" />
             Essential Actions
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {currentConfig.actions.map((action, index) => (
               <motion.div
                 key={index}
                 whileHover={{ scale: 1.02 }}
                 onClick={action.onClick}
                 className="group p-8 bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-white hover:border-indigo-50 transition-all cursor-pointer"
               >
                 <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                   {action.icon}
                 </div>
                 <h3 className="text-xl font-black text-gray-900 mb-2">{action.title}</h3>
                 <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6 h-10 overflow-hidden">
                   {action.description}
                 </p>
                 <span className={`inline-flex items-center gap-2 text-sm font-black text-${theme}-600 group-hover:gap-4 transition-all`}>
                   {action.buttonText}
                   <ArrowRightIcon className="w-4 h-4" />
                 </span>
               </motion.div>
             ))}
           </div>
        </div>

        {/* Unified Activity Stream */}
        <div className="lg:col-span-12">
           <div className="flex justify-between items-center mb-8 ml-2">
             <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
               <ClockIcon className="w-5 h-5 text-blue-600" />
               Live Community Stream
             </h2>
             <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest shadow-sm">
               Real-time Sync
             </span>
           </div>
           
           <Card className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-white overflow-hidden divide-y divide-gray-50">
             {dashboardData?.activities?.length > 0 ? (
               dashboardData.activities.map((activity, index) => (
                 <motion.div 
                   key={index}
                   whileHover={{ bg: 'rgba(0,0,0,0.02)' }}
                   onClick={() => handleStatClick(activity.type)}
                   className="cursor-pointer"
                 >
                   <ActivityItem activity={activity} index={index} />
                 </motion.div>
               ))
             ) : (
               <div className="p-10 text-center text-gray-400 font-bold italic">
                 No recent activity detected in your network.
               </div>
             )}
           </Card>
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ activity, index }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.1 * index }}
    className="p-5 hover:bg-gray-50/50 transition-colors group"
  >
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-xl bg-gray-100 text-gray-400 group-hover:bg-white group-hover:shadow-sm transition-all`}>
        {activity.type === 'post' ? <NewspaperIcon className="w-5 h-5 text-indigo-500" /> : 
         activity.type === 'connection' ? <UserGroupIcon className="w-5 h-5 text-blue-500" /> :
         <ClockIcon className="w-5 h-5" />}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-gray-900 leading-tight">{activity.title}</h4>
        <p className="text-xs text-gray-500 mt-0.5 font-medium">{activity.description}</p>
      </div>
      <div className="text-right">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
          {typeof activity.timestamp === 'string' ? activity.timestamp : new Date(activity.timestamp).toLocaleDateString()}
        </span>
      </div>
    </div>
  </motion.div>
);

export default RoleDashboard;