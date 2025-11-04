import React from 'react';
import { Search, Ticket, User, PlusCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUiStore';

export default function Header() {
  const { user, logout } = useAuthStore();
  const { openAuthModal } = useUIStore();

  return (
    <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Left Side: Logo & Categories */}
        <div className="flex items-center gap-8">
          <a href="/" className="text-3xl font-bold text-white">
            ticketbox
          </a>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#" className="text-sm font-medium text-gray-300 hover:text-white">Music</a>
            <a href="#" className="text-sm font-medium text-gray-300 hover:text-white">Stage & Art</a>
            <a href="#" className="text-sm font-medium text-gray-300 hover:text-white">Sports</a>
            <a href="#" className="text-sm font-medium text-gray-300 hover:text-white">Other</a>
          </nav>
        </div>

        {/* Center: Search Bar (Matches Screenshot) */}
        <div className="hidden w-full max-w-sm lg:flex">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-full bg-gray-800 py-2.5 pl-10 pr-20 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <button className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-gray-700 px-4 py-1.5 text-sm font-semibold hover:bg-gray-600">
              Search
            </button>
          </div>
        </div>

        {/* Right Side: Auth & User */}
        <div className="flex items-center gap-4">
          <button className="hidden items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-700 md:flex">
            <PlusCircle className="h-4 w-4" />
            Create Event
          </button>
          
          {user ? (
            <>
              <a href="/my-tickets" className="flex items-center gap-2 text-sm font-medium hover:text-blue-400">
                <Ticket className="h-5 w-5" />
                My Tickets
              </a>
              <button onClick={logout} className="flex items-center gap-2 text-sm font-medium hover:text-blue-400">
                <User className="h-5 w-5" />
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => openAuthModal('login')}
                className="text-sm font-medium hover:text-blue-400"
              >
                Login
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="rounded-full bg-gray-700 px-4 py-2 text-sm font-semibold hover:bg-gray-600"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

