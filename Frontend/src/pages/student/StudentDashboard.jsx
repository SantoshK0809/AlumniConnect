import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';

const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
      
      {/* Welcome Section */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Welcome, {user?.name}!</h2>
        <p className="text-gray-600">PRN: {user?.prn_number}</p>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <h3 className="font-semibold mb-2">Alumni Network</h3>
          <p className="text-gray-600 mb-4">Connect with alumni from your field</p>
          <button className="text-blue-600 hover:text-blue-800">Browse Directory →</button>
        </Card>
        
        <Card>
          <h3 className="font-semibold mb-2">Upcoming Events</h3>
          <p className="text-gray-600 mb-4">See what's happening on campus</p>
          <button className="text-blue-600 hover:text-blue-800">View Events →</button>
        </Card>

        <Card>
          <h3 className="font-semibold mb-2">Your Profile</h3>
          <p className="text-gray-600 mb-4">Update your information</p>
          <button className="text-blue-600 hover:text-blue-800">Edit Profile →</button>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {/* Add your activity items here */}
        </div>
      </Card>
    </div>
  );
};

export default StudentDashboard;
