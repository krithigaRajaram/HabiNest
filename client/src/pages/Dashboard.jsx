import React from 'react';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  return (
    <div className="flex flex-col h-screen bg-amber-50">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-amber-900">Welcome to your Dashboard</h2>
          <p className="text-lg text-green-600">Registration was successful!</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;