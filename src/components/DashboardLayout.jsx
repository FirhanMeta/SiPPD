import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../lib/AuthContext';

const DashboardLayout = ({ children }) => {
  const { user, profile } = useAuth(); // Assuming profile is fetched in context

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header userName={user?.email?.split('@')[0]} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;