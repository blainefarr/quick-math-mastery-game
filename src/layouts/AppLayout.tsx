
import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import useAuth from '@/context/auth/useAuth';
import { useToast } from '@/hooks/use-toast';

const AppLayout = () => {
  const { isLoggedIn, isLoading, rememberCurrentRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!isLoading) {
      // Remember the current route for refresh purposes
      rememberCurrentRoute();
      
      // Only redirect if not logged in
      if (!isLoggedIn) {
        toast({
          title: "Login Required",
          description: "Please log in to access this page",
        });
        navigate('/', { replace: true });
      }
    }
  }, [isLoggedIn, isLoading, navigate, toast, rememberCurrentRoute, location.pathname]);
  
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default AppLayout;
