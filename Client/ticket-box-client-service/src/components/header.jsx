import React, { useState } from "react";
import { Search, Ticket, User, PlusCircle, ShoppingCart, Receipt, LogOut, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useUIStore } from "../store/useUiStore";
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout, hasRole } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <a href="/" className="text-3xl font-bold text-white">
            ticketbox
          </a>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              to="/category/1"
              className="text-sm font-medium text-gray-300 hover:text-white"
            >
              Music
            </Link>
            <Link
              to="/category/2"
              className="text-sm font-medium text-gray-300 hover:text-white"
            >
              Stage & Art
            </Link>
            <Link
              to="/category/3"
              className="text-sm font-medium text-gray-300 hover:text-white"
            >
              Sports
            </Link>
            <Link
              to="/category/4"
              className="text-sm font-medium text-gray-300 hover:text-white"
            >
              Other
            </Link>
          </nav>
        </div>

        <div className="hidden w-full max-w-xs lg:flex">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-full bg-gray-800 py-2.5 pl-10 pr-20 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search
              id="searchbar"
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            />
            <button
              onClick={handleSearch}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-gray-700 px-4 py-1.5 text-sm font-semibold hover:bg-gray-600"
            >
              Search
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/create-event"
            className="hidden items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 md:flex shadow-lg shadow-blue-500/20"
          >
            <PlusCircle className="h-5 w-5" />
            Create Event
          </Link>

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
              <Link
                to="/cart-tickets"
                title="Ticket Cart"
                className="flex items-center text-gray-400 hover:text-blue-400 transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
              </Link>
              <Link
                to="/order-history"
                title="Order History"
                className="flex items-center text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Receipt className="h-6 w-6" />
              </Link>

              {/* User Avatar Dropdown */}
              <div className="relative group p-0.5">
                <button className="flex items-center rounded-full border-2 border-transparent transition-all group-hover:border-blue-500/50">
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
                <div className="absolute right-0 top-full mt-1 w-48 scale-95 opacity-0 pointer-events-none transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 group-hover:pointer-events-auto">
                  <div className="mt-2 rounded-2xl border border-gray-800 bg-gray-900 p-2 shadow-2xl backdrop-blur-xl">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-900/10 hover:text-red-300"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => openAuthModal("login")}
                className="text-sm font-medium hover:text-blue-400"
              >
                Login
              </button>
              <button
                onClick={() => openAuthModal("register")}
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
