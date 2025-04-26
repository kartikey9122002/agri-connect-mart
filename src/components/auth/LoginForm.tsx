
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface LoginFormInputs {
  email: string;
  password: string;
}

const LoginForm = () => {
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const [loginError, setLoginError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setLoginError(null);
      console.log("Attempting login with:", data.email);
      await login(data.email, data.password);
      
      console.log("Login successful, redirecting will be handled by LoginPage");
      
      // No navigation here - let the LoginPage handle redirection based on role
    } catch (error: any) {
      console.error('Login form error:', error);
      setLoginError(error?.message || 'Login failed. Please try again.');
      
      toast({
        title: 'Login failed',
        description: error?.message || 'An error occurred during login. Please check your credentials and try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Invalid email address',
            },
          })}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <a href="/forgot-password" className="text-sm text-agrigreen-600 hover:text-agrigreen-800">
            Forgot Password?
          </a>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      {loginError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{loginError}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-agrigreen-600 hover:bg-agrigreen-700"
        disabled={isSubmitting || isLoading}
      >
        {isSubmitting || isLoading ? 'Logging in...' : 'Login'}
      </Button>
      
      <div className="text-center mt-4">
        <p>
          Don't have an account?{' '}
          <a href="/register" className="text-agrigreen-600 hover:text-agrigreen-800">
            Register
          </a>
        </p>
      </div>
      
      <div className="text-center p-4 bg-green-50 rounded-lg mt-6 border border-green-100">
        <h4 className="font-medium text-agrigreen-800 mb-2">Demo Accounts:</h4>
        <p className="text-sm text-gray-600 mb-1">Admin: admin@agri.com</p>
        <p className="text-sm text-gray-600 mb-1">Seller: seller@agri.com</p>
        <p className="text-sm text-gray-600">Buyer: buyer@agri.com</p>
        <p className="text-xs text-gray-500 mt-2">Use password '123456' to login</p>
      </div>
    </form>
  );
};

export default LoginForm;
