
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AuthProvider from '@/context/auth/AuthProvider';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import logger from '@/utils/logger';

// Define gtag and clarity functions for TypeScript
declare global {
  interface Window {
    gtag: (command: string, action: string, params?: any) => void;
    dataLayer: any[];
    clarity: (command: string, value: string, options?: any) => void;
  }
}

const RootLayout = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Log app render once at startup
    logger.info('Application rendered', {
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  }, []);
  
  // Track page views when routes change
  useEffect(() => {
    // Send page view to Google Analytics
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname + location.search
      });
      
      // Log the page view in our own logger
      logger.debug('Page view tracked', { 
        path: location.pathname,
        search: location.search
      });
    }
    
    // Send page view to Microsoft Clarity
    if (window.clarity) {
      window.clarity('set', 'page_view', location.pathname);
      logger.debug('Clarity page view tracked', { path: location.pathname });
    }
  }, [location]);
  
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
