import React from 'react';
import { useForm } from 'react-hook-form';
import { useLoginMutation } from '../hooks/useAuthHook';
import { useUIStore } from '../store/useUiStore';

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { toggleAuthModalView } = useUIStore();
  const loginMutation = useLoginMutation();

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center text-3xl font-bold text-green-500">Login</h2>
      <form onSubmit={handleSubmit( onSubmit )} className="mt-4 flex flex-col gap-4">
        <input
          {...register('username', { required: 'Email/Username is required' })}
          placeholder="Email or username"
          className="w-full rounded-lg border p-3"
          aria-invalid={errors.username ? "true" : "false"}
        />
        {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}

        <input
          {...register('password', { required: 'Password is required' })}
          type="password"
          placeholder="Password"
          className="w-full rounded-lg border p-3"
          aria-invalid={errors.password ? "true" : "false"}
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        
        <a href="#" className="text-right text-sm text-blue-500 hover:underline">
          Forgot password?
        </a>

        <button 
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full rounded-lg bg-green-500 p-3 text-lg font-bold text-white hover:bg-green-600 disabled:opacity-50"
        >
          {loginMutation.isPending ? 'Logging in...' : 'Continue'}
        </button>
      </form>
      
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300"></span>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or</span>
        </div>
      </div>
      <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 p-3 font-semibold hover:bg-gray-50">
        <img src="https://www.google.com/favicon.ico" alt="Google" className="h-5 w-5" />
        Sign in with Google
      </button>

      {/* Toggle to Register */}
      <p className="mt-4 text-center text-sm">
        Don't have an account?{' '}
        <button
          onClick={toggleAuthModalView}
          className="font-semibold text-blue-500 hover:underline"
        >
          Register now
        </button>
      </p>
    </div>
  );
}
