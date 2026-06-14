import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useConnections } from '../hooks/useConnections';
import { Card } from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';

const Directory = () => {
  const { user } = useAuth();
  const { sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest, loading: connLoading } = useConnections();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // Determine available roles based on user role
  const getAvailableRoles = () => {
    const role = user?.role?.toLowerCase();
    if (role === 'student') return ['alumni'];
    if (role === 'alumni') return ['student'];
    if (role === 'teacher' || role === 'admin') return ['student', 'alumni'];
    return [];
  };

  const availableRoles = getAvailableRoles();

  useEffect(() => {
    if (availableRoles.length > 0 && !selectedRole) {
      setSelectedRole(availableRoles[0]);
    }
  }, [availableRoles, selectedRole]);

  useEffect(() => {
    if (selectedRole) {
      fetchDirectory();
    }
  }, [selectedRole, searchTerm]);

  const fetchDirectory = async () => {
    try {
      setLoading(true);
      const API = (await import('../api/index')).default;
      const response = await API.get(`/directory?role=${selectedRole}&search=${searchTerm}`);

      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Error fetching directory:', err);
      setError('Failed to load directory');
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = (userItem) => {
    // Navigate to messages with pre-selected user object
    navigate(`/${user.role.toLowerCase()}/messages`, { state: { selectedUser: userItem } });
  };

  const handleViewProfile = (userItem) => {
    // Navigate to user's public profile based on their role
    if (userItem && userItem.role) {
      navigate(`/profile/${userItem.role.toLowerCase()}/${userItem._id}`);
    } else {
      console.warn("User role missing for profile navigation");
    }
  };

  const handleConnect = async (targetId) => {
    try {
      await sendConnectionRequest(targetId);
      setUsers(prev => prev.map(u => 
        String(u._id) === String(targetId) ? { ...u, connectionStatus: "PENDING", isRequester: true } : u
      ));
    } catch (err) {
      console.error("Connect error in Directory:", err);
    }
  };

  const handleAccept = async (userId) => {
    try {
      await acceptConnectionRequest(userId);
      setUsers(prev => prev.map(u => 
        u._id === userId ? { ...u, connectionStatus: "ACCEPTED" } : u
      ));
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleReject = async (userId) => {
    try {
      await rejectConnectionRequest(userId);
      setUsers(prev => prev.map(u => 
        u._id === userId ? { ...u, connectionStatus: "NONE" } : u
      ));
    } catch (err) {
      // Error handled in hook
    }
  };

  if (availableRoles.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You do not have permission to access the directory.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Directory</h1>
        <p className="text-gray-600">Connect with fellow community members</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {availableRoles.map(role => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}s
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="p-4">
              <div className="animate-pulse flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchDirectory}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </Card>
      ) : users.length === 0 ? (
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search criteria.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {users.map(userItem => (
            <Card key={userItem._id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userItem.name)}&background=random`}
                    alt={userItem.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{userItem.name}</h3>
                    <p className="text-gray-600 capitalize">{userItem.role}</p>
                    {userItem.prn_number && (
                      <p className="text-sm text-gray-500">PRN: {userItem.prn_number}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewProfile(userItem)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    View Profile
                  </button>

                  <button
                    onClick={() => handleMessage(userItem)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                  >
                    Message
                  </button>

                  {userItem.connectionStatus === "ACCEPTED" ? (
                    <span className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded font-bold flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Connected
                    </span>
                  ) : userItem.connectionStatus === "PENDING" ? (
                    userItem.isRequester ? (
                      <button
                        className="px-3 py-1 text-sm bg-gray-300 text-gray-600 rounded cursor-not-allowed font-medium"
                        disabled
                      >
                        Pending
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAccept(userItem._id)}
                          className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 font-bold"
                          disabled={connLoading}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(userItem._id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                          disabled={connLoading}
                        >
                          Reject
                        </button>
                      </div>
                    )
                  ) : (
                    <button
                      onClick={() => handleConnect(userItem._id)}
                      className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 font-bold"
                      disabled={connLoading}
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Directory;
