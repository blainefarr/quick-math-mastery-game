
import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useNavigationState } from '@/hooks/use-navigation-state';
import useAuth from '@/context/auth/useAuth';

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { lastRoute, isPageRefresh, getNavigationSource } = useNavigationState();
  const { isLoggedIn, isLoadingProfile } = useAuth();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Handle route restoration after refresh
  useEffect(() => {
    // Only run this effect once when component mounts
    const navigationSource = getNavigationSource();
    const isRefreshed = isPageRefresh();
    
    console.log('Navigation check:', {
      currentPath: location.pathname, 
      lastRoute, 
      navigationSource, 
      isRefreshed
    });
    
    // Determine if we should restore a route
    // Either we're at the homepage after a refresh OR we've directly hit the base URL after refresh
    const shouldRestoreRoute = 
      (isRefreshed || navigationSource === 'refresh') && 
      (location.pathname === '/' || location.pathname === '') && 
      lastRoute && lastRoute !== '/';
    
    if (shouldRestoreRoute) {
      // Check if it's a route that should only be accessed when logged in
      const authRequiredRoutes = ['/account', '/progress', '/goals', '/leaderboard'];
      const needsAuth = authRequiredRoutes.some(route => lastRoute.startsWith(route));
      
      // Only navigate to auth-required routes if logged in
      if (!needsAuth || isLoggedIn) {
        // Wait for auth check to complete
        if (!isLoadingProfile) {
          console.log('Restoring route after refresh:', lastRoute);
          navigate(lastRoute, { replace: true });
        }
      }
    }
  }, [lastRoute, navigate, location.pathname, isLoggedIn, isLoadingProfile, isPageRefresh, getNavigationSource]);

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
