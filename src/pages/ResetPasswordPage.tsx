
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ResetPasswordFormInputs {
  password: string;
  confirmPassword: string;
}

const ResetPasswordPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ResetPasswordFormInputs>();
  const password = watch('password');

  // Check if we have the reset token in the URL
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (!hashParams.get('access_token')) {
      toast({
        title: 'Invalid reset link',
        description: 'This password reset link is invalid or has expired.',
        variant: 'destructive',
      });
      setTimeout(() => navigate('/forgot-password'), 2000);
    }
  }, [navigate, toast]);

  const onSubmit = async (data: ResetPasswordFormInputs) => {
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) {
        throw error;
      }

      setResetComplete(true);
      toast({
        title: 'Password reset successful',
        description: 'Your password has been updated. You can now log in with your new password.',
      });
      
      // After a short delay, redirect to login
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Password reset failed',
        description: error?.message || 'Failed to reset password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-agricream p-4">
      <div className="bg-white p-8 rounded-lg shadow-md border border-agrigreen-100 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-agrigreen-800">Create New Password</h1>
          <p className="text-gray-600 mt-1">
            {resetComplete 
              ? 'Your password has been reset successfully!' 
              : 'Enter your new password below'}
          </p>
        </div>

        {!resetComplete ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                New Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
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

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match',
                })}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-agrigreen-600 hover:bg-agrigreen-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating Password...' : 'Reset Password'}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-100 rounded-md text-center">
              <p className="text-agrigreen-700">
                Your password has been reset successfully! Redirecting to login...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
