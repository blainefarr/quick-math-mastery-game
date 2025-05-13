
import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/context/auth/useAuth';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

const RootLayout = () => {
  return (
    <AuthProvider>
      <TooltipProvider delayDuration={300}>
        <Toaster />
        <Outlet />
      </TooltipProvider>
    </AuthProvider>
  );
};

export default RootLayout;
