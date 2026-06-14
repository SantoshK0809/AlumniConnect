import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import StudentFeed from '../../pages/student/Feed';
import TeacherFeed from '../../pages/teacher/Feed';
import AlumniProfile from '../../pages/alumni/Profile';
import StudentProfile from '../../pages/student/Profile';
import { Card } from '../ui/Card';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('feed');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useAuth();

  // Helper function to get the correct feed component based on role
  const getFeedComponent = () => {
    switch(user?.role?.toLowerCase()) {
      case 'teacher':
        return TeacherFeed;
      case 'student':
      default:
        return StudentFeed;
    }
  };

  // Helper function to get the correct profile component based on role
  const getProfileComponent = () => {
    switch(user?.role?.toLowerCase()) {
      case 'alumni':
        return AlumniProfile;
      case 'student':
      default:
        return StudentProfile;
    }
  };

  console.log("NAVBAR USER OBJECT →", user);


  return (
    <div className="flex h-screen bg-gray-50">
      {/* Header */}
      <div className="w-full flex flex-col">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">Alumni Connect</h1>
            
            {/* Navigation */}
            <div className="flex items-center space-x-8">
              <button
                onClick={() => setActiveTab('feed')}
                className={`px-3 py-2 font-medium ${activeTab === 'feed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Feed
              </button>
              <button
                onClick={() => setActiveTab('directory')}
                className={`px-3 py-2 font-medium ${activeTab === 'directory' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Alumni Directory
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`px-3 py-2 font-medium ${activeTab === 'messages' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Messages
              </button>
              <button
                onClick={() => setActiveTab('resume')}
                className={`px-3 py-2 font-medium ${activeTab === 'resume' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Resume
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-3 py-2 font-medium relative ${activeTab === 'notifications' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Notifications
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">5</span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                >
                  <img
                    src={user?.profileImage?.url  || `https://ui-avatars.com/api/?name=${user?.name}`}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setShowProfileMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setShowProfileMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 border-t"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'feed' && React.createElement(getFeedComponent())}
          {activeTab === 'directory' && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Alumni Directory</h2>
              <p className="text-gray-600">Coming soon: Browse and connect with alumni</p>
            </Card>
          )}
          {activeTab === 'messages' && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Messages</h2>
              <p className="text-gray-600">Your messages will appear here</p>
            </Card>
          )}
          {activeTab === 'notifications' && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Notifications</h2>
              <p className="text-gray-600">Your notifications will appear here</p>
            </Card>
          )}
          {activeTab === 'profile' && React.createElement(getProfileComponent())}
        </div>
      </div>
    </div>
  );
}
