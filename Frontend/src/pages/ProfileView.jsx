import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import StudentProfile from "./student/Profile";
import AlumniProfile from "./alumni/Profile";
import TeacherProfile from "./teacher/Profile";
import PublicAlumniProfile from "./alumni/PublicAlumniProfile";

const ProfileView = () => {
  const { role, userId } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `/api/profile/public/${role}/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        // Fetch connection status relative to the current user
        let connectionInfo = { status: "NONE", isRequester: false };
        try {
          const connRes = await axios.get(`/api/directory?search=${res.data.name}&role=${role}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const foundUser = connRes.data.users.find(u => String(u._id) === String(userId));
          if (foundUser) {
            connectionInfo = { 
              status: foundUser.connectionStatus, 
              isRequester: foundUser.isRequester 
            };
          }
        } catch (connErr) {
          console.warn("Could not fetch connection status for profile", connErr);
        }

        setProfileData({ ...res.data, ...connectionInfo });
      } catch (err) {
        console.error("Error fetching public profile:", err);
        setError("Could not load profile. User may not exist or profile is private.");
      } finally {
        setLoading(false);
      }
    };

    if (role && userId) fetchPublicProfile();
  }, [role, userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50 p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">{error}</h2>
        <button 
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Render the appropriate profile component in "view-only" mode
  // Note: We need to pass the fetched data to these components or modify them to accept data/userId
  // For now, I'll pass the profileData as a prop called 'externalProfile'
  
  if (role.toLowerCase() === "student") {
    return <StudentProfile externalProfile={profileData} />;
  } else if (role.toLowerCase() === "alumni") {
    return <PublicAlumniProfile externalProfile={profileData} />;
  } else if (role.toLowerCase() === "teacher") {
    return <TeacherProfile externalProfile={profileData} />;
  }

  return (
    <div className="p-10 text-center">
      <h2 className="text-2xl font-bold">Profile not found for role: {role}</h2>
    </div>
  );
};

export default ProfileView;
