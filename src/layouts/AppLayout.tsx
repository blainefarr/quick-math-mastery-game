
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';

const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
