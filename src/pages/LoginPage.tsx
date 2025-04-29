
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';

const LoginPage = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the intended destination from location state, or default routes by role
  const from = (location.state as any)?.from || '/';

  console.log("LoginPage render state:", { isAuthenticated, user, isLoading });

  useEffect(() => {
    // Only redirect if authentication is confirmed and loading is complete
    if (isAuthenticated && user && !isLoading) {
      console.log("LoginPage: User authenticated, redirecting based on role:", user.role);
      
      // Redirect based on user role
      let destination;
      switch (user.role) {
        case 'admin':
          destination = '/admin-dashboard';
          break;
        case 'seller':
          destination = '/seller-dashboard';
          break;
        case 'buyer':
          destination = '/products';
          break;
        default:
          destination = '/';
      }
      
      console.log(`Navigating to ${destination}`);
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate, from]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-agricream p-4">
      <div className="bg-white p-8 rounded-lg shadow-md border border-agrigreen-100 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-agrigreen-800">Welcome Back</h1>
          <p className="text-gray-600 mt-1">Sign in to your AgriConnect account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
