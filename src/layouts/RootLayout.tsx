
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AuthProvider from '@/context/auth/AuthProvider';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import logger from '@/utils/logger';

const RootLayout = () => {
  useEffect(() => {
    // Log app render once at startup
    logger.info('Application rendered', {
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  }, []);
  
  return (
    <AuthProvider>
      <TooltipProvider delayDuration={300}>
        <Outlet />
        <Toaster /> {/* Added Toaster here instead of in main.tsx to avoid duplication */}
      </TooltipProvider>
    </AuthProvider>
  );
};

export default RootLayout;
