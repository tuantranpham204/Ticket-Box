import React, { useState, useRef } from "react";
import { Search, Ticket, User, PlusCircle, ShoppingCart, Receipt, LogOut, LayoutDashboard, Briefcase } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useUIStore } from "../store/useUiStore";
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout, hasRole } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef(null);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    // Delay closing to allow "catch up"
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300); // 300ms delay
  };

  return (
    <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <a href="/" className="text-3xl font-bold text-white tracking-tighter hover:text-blue-400 transition-colors">
            ticketbox
          </a>
          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/category/1" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Music</Link>
            <Link to="/category/2" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Stage & Art</Link>
            <Link to="/category/3" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Sports</Link>
            <Link to="/category/4" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Other</Link>
          </nav>
        </div>

        <div className="hidden w-full max-w-xs lg:flex">
          <div className="relative w-full group">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-full bg-gray-800/50 border border-gray-700/50 py-2.5 pl-10 pr-20 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-gray-800 transition-all"
            />
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            <button
              onClick={handleSearch}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-gray-700 px-4 py-1.5 text-sm font-semibold hover:bg-gray-600 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <Link
              to="/event-organizer"
              className="hidden items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 md:flex shadow-lg shadow-blue-500/20"
            >
              <Briefcase className="h-5 w-5" />
              Event Organizer
            </Link>
          )}

          {hasRole("ROLE_APPROVER") && (
            <Link
              to="/approver-dashboard"
              className="hidden items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-sm font-bold hover:bg-purple-700 transition-all active:scale-95 md:flex shadow-lg shadow-purple-500/20"
            >
              <LayoutDashboard className="h-5 w-5" />
              Approver
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-4 ml-2 bg-gray-800/40 p-1.5 px-3 rounded-full border border-gray-700/50">
              <Link to="/cart-tickets" title="Ticket Cart" className="flex items-center text-gray-400 hover:text-blue-400 transition-colors">
                <ShoppingCart className="h-6 w-6" />
              </Link>
              <Link to="/order-history" title="Order History" className="flex items-center text-gray-400 hover:text-blue-400 transition-colors">
                <Receipt className="h-6 w-6" />
              </Link>

              {/* User Avatar Dropdown */}
              <div
                className="relative p-0.5"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button className={`flex items-center rounded-full border-2 transition-all ${isDropdownOpen ? 'border-blue-500' : 'border-transparent'}`}>
                  <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-800 shadow-md">
                    {user.avatar?.url ? (
                      <img src={user.avatar.url} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-blue-600/10 text-blue-500">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 z-50 animate-bounce-in">
                    <div className="mt-2 rounded-2xl border border-gray-700/50 bg-gray-900/90 p-2 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
                      <div className="px-4 py-2 border-b border-gray-800 mb-1">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Logged in as</p>
                        <p className="text-sm font-bold text-white truncate">{user.username}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User className="h-4 w-4 text-blue-400" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-900/10 hover:text-red-300"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => openAuthModal("login")}
                className="text-sm font-medium hover:text-blue-400 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => openAuthModal("register")}
                className="rounded-full bg-gray-700 px-6 py-2.5 text-sm font-bold hover:bg-gray-600 transition-all active:scale-95 shadow-lg"
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
