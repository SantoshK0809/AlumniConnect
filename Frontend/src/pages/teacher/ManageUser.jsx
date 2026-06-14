import React, { useState, useEffect, useMemo, useRef } from 'react';
import { fetchAllUsers, deleteUser, uploadCsv } from '../../api/adminApi';
import { 
  UserGroupIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  UserIcon,
  ExclamationTriangleIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const fileInputRef = useRef(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingCsv(true);
      setUploadStatus(null);
      const res = await uploadCsv(file);
      setUploadStatus({ type: 'success', message: res.message });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setUploadStatus({ type: 'error', message: err.response?.data?.message || err.message || 'Upload failed' });
    } finally {
      setUploadingCsv(false);
    }
  };

  const TABS = ['All', 'Student', 'Alumni', 'Teacher'];

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchAllUsers();
      // Flatten users from {students: [], alumni: [], teachers: []} to one array
      const allUsers = [
        ...(data.users.students || []),
        ...(data.users.alumni || []),
        ...(data.users.teachers || [])
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setUsers(allUsers);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'All' || user.role === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [users, searchTerm, activeTab]);

  const getRoleIcon = (role) => {
    switch(role) {
      case 'Student': return <AcademicCapIcon className="w-5 h-5 text-blue-500" />;
      case 'Alumni': return <BriefcaseIcon className="w-5 h-5 text-purple-500" />;
      case 'Teacher': return <UserIcon className="w-5 h-5 text-emerald-500" />;
      default: return <UserGroupIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'Student': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Alumni': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Teacher': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <UserGroupIcon className="w-8 h-8 text-indigo-600" />
            User Management
          </h1>
          <p className="text-slate-500 mt-2">View and manage all registered users on the platform.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            {uploadingCsv ? (
               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
               <ArrowUpTrayIcon className="w-5 h-5" />
            )}
            {uploadingCsv ? 'Uploading...' : 'Upload Validation CSV'}
          </button>
        </div>
      </div>

      {/* Upload Status Alert */}
      {uploadStatus && (
        <div className={`p-4 rounded-xl mb-6 font-medium flex items-center justify-between ${uploadStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          <span>{uploadStatus.message}</span>
          <button onClick={() => setUploadStatus(null)} className="opacity-70 hover:opacity-100 font-bold">✕</button>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Tabs */}
        <div className="flex bg-slate-50 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-96">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium">
                    <div className="flex justify-center mb-4">
                      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{user.name}</p>
                          <p className="text-xs font-medium text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${getRoleBadge(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-600">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {deleteConfirm === user._id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            Sure?
                          </span>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(user._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete User"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUser;
