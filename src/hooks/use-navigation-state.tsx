
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Storage keys
const LAST_ROUTE_KEY = 'app_last_route';
const PREVIOUS_ROUTE_KEY = 'app_previous_route';

/**
 * Hook to track and manage navigation state, allowing for restoring previous routes
 * and tracking navigation history.
 */
export function useNavigationState() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Store navigation state
  const storeNavigationState = (routePath: string) => {
    // Skip storing certain paths that shouldn't be remembered
    const skipPaths = ['/payment-success', '/reset-password'];
    if (skipPaths.includes(routePath)) return;

    const lastRoute = localStorage.getItem(LAST_ROUTE_KEY);
    
    // If we have a last route and it's different from current,
    // store it as previous before updating last route
    if (lastRoute && lastRoute !== routePath) {
      localStorage.setItem(PREVIOUS_ROUTE_KEY, lastRoute);
    }
    
    // Update the last route
    localStorage.setItem(LAST_ROUTE_KEY, routePath);
  };

  // Get previous route
  const getPreviousRoute = (): string => {
    return localStorage.getItem(PREVIOUS_ROUTE_KEY) || '/';
  };

  // Get last route - useful for restoring after refresh
  const getLastRoute = (): string => {
    return localStorage.getItem(LAST_ROUTE_KEY) || '/';
  };
  
  // Store current route on each navigation
  useEffect(() => {
    storeNavigationState(currentPath);
  }, [currentPath]);

  return {
    previousRoute: getPreviousRoute(),
    lastRoute: getLastRoute(),
    storeNavigationState,
  };
}
