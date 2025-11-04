import React from 'react';
import { useForm } from 'react-hook-form';
import { useRegisterMutation } from '../hooks/useAuthHook';
import { useUIStore } from '../store/useUiStore';

export default function RegisterForm() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { toggleAuthModalView } = useUIStore();
  const registerMutation = useRegisterMutation();
  
  // Watch password field for confirm password validation
  const password = watch('password');

  const onSubmit = (data) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center text-3xl font-bold text-green-500">Register</h2>
      <form onSubmit={handleSubmit( onSubmit )} className="mt-4 flex flex-col gap-4">
        
        <input
          {...register('fullName', { required: 'Full Name is required' })}
          placeholder="Full Name"
          className="w-full rounded-lg border p-3"
        />
        {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}

        <input
          {...register('username', { required: 'Username is required' })}
          placeholder="Username"
          className="w-full rounded-lg border p-3"
        />
        {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}

        <input
          {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }})}
          placeholder="Email"
          className="w-full rounded-lg border p-3"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

        <input
          {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' }})}
          type="password"
          placeholder="Password"
          className="w-full rounded-lg border p-3"
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        
        <input
          {...register('confirmPassword', { 
            required: 'Please confirm your password', 
            validate: value => value == password || 'Passwords do not match'
          })}
          type="password"
          placeholder="Confirm Password"
          className="w-full rounded-lg border p-3"
        />
        {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}

        <button 
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full rounded-lg bg-green-500 p-3 text-lg font-bold text-white hover:bg-green-600 disabled:opacity-50"
        >
          {registerMutation.isPending ? 'Creating account...' : 'Register'}
        </button>
      </form>
      
      {/* Toggle to Login */}
      <p className="mt-4 text-center text-sm">
        Already have an account?{' '}
        <button
          onClick={toggleAuthModalView}
          className="font-semibold text-blue-500 hover:underline"
        >
          Login
        </button>
      </p>
    </div>
  );
}
