
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import RegisterForm from '@/components/auth/RegisterForm';

const RegisterPage = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if authentication is confirmed and loading is complete
    if (isAuthenticated && user && !isLoading) {
      console.log("RegisterPage: User authenticated, redirecting based on role:", user.role);
      
      // Redirect based on user role
      switch (user.role) {
        case 'admin':
          navigate('/admin-dashboard', { replace: true });
          break;
        case 'seller':
          navigate('/seller-dashboard', { replace: true });
          break;
        case 'buyer':
          navigate('/buyer-dashboard', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-agricream p-4">
      <div className="bg-white p-8 rounded-lg shadow-md border border-agrigreen-100 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-agrigreen-800">Create an Account</h1>
          <p className="text-gray-600 mt-1">Join AgriConnect Mart today</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
