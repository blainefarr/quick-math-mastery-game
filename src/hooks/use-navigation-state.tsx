
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Storage keys
const LAST_ROUTE_KEY = 'app_last_route';
const PREVIOUS_ROUTE_KEY = 'app_previous_route';
const NAVIGATION_SOURCE_KEY = 'app_navigation_source';
const PAGE_REFRESH_KEY = 'app_page_refresh';

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

  // Check if current navigation is a page refresh
  const isPageRefresh = (): boolean => {
    // Use sessionStorage to detect page refreshes more reliably
    // than the deprecated performance.navigation API
    const wasRefreshed = sessionStorage.getItem(PAGE_REFRESH_KEY) === 'true';
    sessionStorage.removeItem(PAGE_REFRESH_KEY);
    
    // Before unload, we'll set a flag in sessionStorage
    if (typeof window !== 'undefined' && !window.onbeforeunload) {
      window.onbeforeunload = () => {
        sessionStorage.setItem(PAGE_REFRESH_KEY, 'true');
        return undefined;
      };
    }
    
    return wasRefreshed;
  };

  // Get previous route
  const getPreviousRoute = (): string => {
    return localStorage.getItem(PREVIOUS_ROUTE_KEY) || '/';
  };

  // Get last route - useful for restoring after refresh
  const getLastRoute = (): string => {
    return localStorage.getItem(LAST_ROUTE_KEY) || '/';
  };
  
  // Mark navigation source (for distinguishing between refresh and other navigations)
  const markNavigationSource = (source: 'refresh' | 'direct' | 'internal') => {
    localStorage.setItem(NAVIGATION_SOURCE_KEY, source);
  };
  
  // Get navigation source
  const getNavigationSource = (): string => {
    return localStorage.getItem(NAVIGATION_SOURCE_KEY) || 'direct';
  };
  
  // Store current route on each navigation
  useEffect(() => {
    // Mark the navigation source
    if (isPageRefresh()) {
      markNavigationSource('refresh');
    } else {
      markNavigationSource('internal');
    }
    storeNavigationState(currentPath);
  }, [currentPath]);

  return {
    previousRoute: getPreviousRoute(),
    lastRoute: getLastRoute(),
    storeNavigationState,
    isPageRefresh,
    getNavigationSource,
    markNavigationSource
  };
}
