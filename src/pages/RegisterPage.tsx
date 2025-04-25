
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import RegisterForm from '@/components/auth/RegisterForm';

const RegisterPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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
