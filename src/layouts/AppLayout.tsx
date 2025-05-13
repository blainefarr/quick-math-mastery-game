
import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useNavigationState } from '@/hooks/use-navigation-state';
import useAuth from '@/context/auth/useAuth';

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { lastRoute } = useNavigationState();
  const { isLoggedIn, isLoading } = useAuth();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Handle route restoration after refresh
  useEffect(() => {
    // Check if we're on the homepage after a refresh
    const isDirectNavigation = performance.navigation && 
      performance.navigation.type === 1 && // 1 is TYPE_RELOAD
      location.pathname === '/';
    
    // If we're refreshed to homepage but actually had a previous specific route,
    // navigate back there (unless we're not logged in and it's a protected route)
    if (isDirectNavigation && lastRoute && lastRoute !== '/') {
      // Check if it's a route that should only be accessed when logged in
      const authRequiredRoutes = ['/account', '/progress', '/goals', '/leaderboard'];
      const needsAuth = authRequiredRoutes.some(route => lastRoute.startsWith(route));
      
      // Only navigate to auth-required routes if logged in
      if (!needsAuth || isLoggedIn) {
        // Wait for auth check to complete
        if (!isLoading) {
          navigate(lastRoute);
        }
      }
    }
  }, [lastRoute, navigate, location.pathname, isLoggedIn, isLoading]);

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
