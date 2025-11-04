import React from 'react';
import { X } from 'lucide-react';
import { useUIStore } from '../store/useUiStore';
import LoginForm from './loginForm';
import RegisterForm from './registerForm';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalView } = useUIStore();

  if (!isAuthModalOpen) return null;

  return (
    // Backdrop
    <div 
      onClick={closeAuthModal} 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      {/* Modal Container */}
      <div 
        onClick={(e) => e.stopPropagation()} // Prevent closing on modal click
        className="relative w-full max-w-md rounded-2xl bg-white p-8 text-gray-900 shadow-xl"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-800"
        >
          <X className="h-6 w-6" />
        </button>
        
        {/* Mascot Image (from screenshot) */}
        <img 
          src="https://placehold.co/100x100/34d399/ffffff?text=LOGO"
          alt="Mascot"
          className="mx-auto mb-4 h-24 w-24 rounded-full border-4 border-green-400 object-cover" 
        />
        
        {/* Dynamic Content */}
        {authModalView === 'login' ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}