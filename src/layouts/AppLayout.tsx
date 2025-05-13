
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
    const isRefresh = isPageRefresh();
    
    // Check if we're on the homepage after a refresh
    const isHomepage = location.pathname === '/';
    const hasLastRoute = lastRoute && lastRoute !== '/';
    
    // If we're refreshed to homepage but actually had a previous specific route,
    // navigate back there (unless we're not logged in and it's a protected route)
    if ((isRefresh || navigationSource === 'refresh') && isHomepage && hasLastRoute) {
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
