
import React from 'react';
import { Outlet } from 'react-router-dom';
import AuthProvider from '@/context/auth/AuthProvider';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

const RootLayout = () => {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Outlet />
      </TooltipProvider>
    </AuthProvider>
  );
};

export default RootLayout;
