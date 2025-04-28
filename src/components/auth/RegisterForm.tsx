import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface RegisterFormInputs {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm = () => {
  const { register: registerUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole>('buyer');
  const { toast } = useToast();
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, reset } = useForm<RegisterFormInputs>();
  const password = watch('password');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      setIsLoading(true);
      setRegistrationError(null);
      console.log("Starting registration with data:", { email: data.email, role });
      
      await registerUser(data.email, data.password, data.name, role);
      
      console.log("Registration completed successfully");
      toast({
        title: 'Registration successful',
        description: 'Your account has been created. Redirecting to your dashboard...',
      });
      
    } catch (error: any) {
      console.error('Registration error:', error);
      setRegistrationError(error?.message || 'Registration failed. Please try again.');
      
      // Display appropriate toast message
      if (error?.message?.includes('already registered')) {
        toast({
          title: 'Registration failed',
          description: 'This email is already registered. Please try logging in instead.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Registration failed',
          description: error?.message || 'An error occurred during registration. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="Enter your full name"
          {...register('name', {
            required: 'Full name is required',
          })}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
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
        <Label htmlFor="role">I am a</Label>
        <Select
          value={role}
          onValueChange={(value) => setRole(value as UserRole)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buyer">Buyer (Consumer)</SelectItem>
            <SelectItem value="seller">Seller (Farmer)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
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
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: value =>
              value === password || 'The passwords do not match',
          })}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      {registrationError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{registrationError}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-agrigreen-600 hover:bg-agrigreen-700"
        disabled={isSubmitting || isLoading || authLoading}
      >
        {isLoading || authLoading ? 'Creating Account...' : 'Create Account'}
      </Button>

      <div className="text-center mt-4">
        <p>
          Already have an account?{' '}
          <a href="/login" className="text-agrigreen-600 hover:text-agrigreen-800">
            Login
          </a>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;
