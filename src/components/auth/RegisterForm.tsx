
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { register: registerUser, isLoading } = useAuth();
  const [role, setRole] = useState<UserRole>('buyer');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterFormInputs>();
  const password = watch('password');

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      console.log("Registering with data:", { email: data.email, role });
      await registerUser(data.email, data.password, data.name, role);
      
      toast({
        title: 'Registration successful',
        description: 'Your account has been created. You will be redirected to your dashboard.',
      });
      
      // The AuthContext will handle redirection based on role
      // No need to navigate here since LoginPage will handle it based on isAuthenticated state
    } catch (error) {
      console.error('Registration error:', error);
      // Error toast is shown in the AuthContext
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

      <Button
        type="submit"
        className="w-full bg-agrigreen-600 hover:bg-agrigreen-700"
        disabled={isSubmitting || isLoading}
      >
        {isSubmitting || isLoading ? 'Creating Account...' : 'Create Account'}
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
