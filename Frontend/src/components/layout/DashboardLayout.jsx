import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";
import { Card } from "../ui/Card";
import NotificationDropdown from "../NotificationDropdown";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const role = user?.role?.toLowerCase();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    navigate(`/${role}/alumni-discovery?search=${trimmedQuery}`, {
      // headers:{
      //   // "Content-Type": "application/json",
      //   Authorization: `Bearer ${user?.token}`,
      // },
    });

    setSearchOpen(false);
  };

  // Sync active tab with URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/dashboard")) setActiveTab("dashboard");
    else if (path.includes("/feed")) setActiveTab("feed");
    else if (path.includes("/jobs")) setActiveTab("jobs");
    else if (path.includes("/directory")) setActiveTab("directory");
    else if (path.includes("/network")) setActiveTab("network");
    else if (path.includes("/messages")) setActiveTab("messages");
    else if (path.includes("/profile")) setActiveTab("profile");
    else if (path.includes("/manage")) setActiveTab("manage");
    else if (path.includes("/resume")) setActiveTab("resume");
  }, [location]);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate("/login");
  };

  const getRoleBasePath = () => {
    if (role === "admin") return "/teacher/admin";
    return `/${role}`;
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    const basePath = getRoleBasePath();
    navigate(`${basePath}/${tab === "connections" ? "directory" : tab}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link
              to={`${getRoleBasePath()}/dashboard`}
              className="flex items-center gap-2 group"
            >
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                <span className="text-white font-black text-xl italic">A</span>
              </div>
              <span className="text-2xl font-black text-gray-900 tracking-tight">
                Connect
              </span>
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {showMobileMenu ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {[
                { id: "dashboard", label: "Dashboard" },
                { id: "feed", label: "Feed" },
                { id: "jobs", label: "Jobs" },
                { id: "directory", label: "Directory" },
                { id: "network", label: "Network" },
                { id: "messages", label: "Messages" },
                { id: "resume", label: "Resume Analysis" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`px-5 py-2.5 cursor-pointer rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? "bg-indigo-50 text-indigo-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-full cursor-pointer hover:bg-gray-100 transition"
              >
                {searchOpen ? (
                  <XMarkIcon className="w-5 h-5 text-gray-700" />
                ) : (
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              {/* Notification Dropdown Component */}
              <NotificationDropdown />

              {/* Profile Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group"
                >
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900 leading-none">
                      {user?.name}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      {user?.role}
                    </p>
                  </div>
                  <div className="relative">
                    <img
                      src={
                        user?.profileImage?.url ||
                        "https://ui-avatars.com/api/?name=" + user?.name
                      }
                      alt={user?.name}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-md group-hover:ring-indigo-50 transition-all"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl shadow-indigo-200/50 border border-gray-100 z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => {
                        handleTabClick("profile");
                        setShowProfileMenu(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors"
                    >
                      My Profile
                    </button>
                    {(role === "teacher" || role === "admin") && (
                      <button
                        onClick={() => {
                          handleTabClick("manage");
                          setShowProfileMenu(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors"
                      >
                        Manage Users
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-1"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {searchOpen && (
            <div ref={searchRef} className="border-t bg-white">
              <div className="max-w-7xl mx-auto px-4 py-4 flex justify-center">
                <form
                  onSubmit={handleSearch}
                  className="w-full md:w-[70%] lg:w-[50%]"
                >
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search alumni by company, location, skills..."
                      className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition shadow-sm"
                    />

                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
              {[
                { id: "dashboard", label: "Dashboard" },
                { id: "feed", label: "Feed" },
                { id: "jobs", label: "Jobs" },
                { id: "directory", label: "Directory" },
                { id: "network", label: "Network" },
                { id: "messages", label: "Messages" },
                { id: "resume", label: "Resume Analysis" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    handleTabClick(tab.id);
                    setShowMobileMenu(false);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold text-left transition-all ${
                    activeTab === tab.id
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-full cursor-pointer hover:bg-gray-100 transition"
              >
                {searchOpen ? (
                  <XMarkIcon className="w-5 h-5 text-gray-700" />
                ) : (
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-700" />
                )}
              </button>
              <div className="flex items-center gap-3 px-4 py-2 mt-1 border-t border-gray-100">
                <NotificationDropdown />
                <button
                  onClick={() => {
                    handleTabClick("profile");
                    setShowMobileMenu(false);
                  }}
                  className="text-sm font-bold text-gray-700 hover:text-indigo-600"
                >
                  My Profile
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowMobileMenu(false);
                  }}
                  className="text-sm font-bold text-red-600 hover:text-red-700 ml-auto"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Content Area */}
        <main className="flex-1 bg-gray-50/50 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
