import React, { useState } from "react";
import { Search, Ticket, User, PlusCircle, ShoppingCart, Receipt } from "lucide-react";
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
            className="hidden items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-700 md:flex"
          >
            <PlusCircle className="h-4 w-4" />
            Create Event
          </Link>

          {hasRole("ROLE_APPROVER") && (
            <Link
              to="/approver-dashboard"
              className="hidden items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold hover:bg-purple-700 md:flex"
            >
              Approver
              Dashboard
            </Link>
          )}

          {user ? (
            <>
              <Link
                to="/cart-tickets"
                className="flex items-center gap-2 text-sm font-medium hover:text-blue-400 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden xl:inline">Ticket Cart</span>
              </Link>
              <Link
                to="/order-history"
                className="flex items-center gap-2 text-sm font-medium hover:text-blue-400 transition-colors"
              >
                <Receipt className="h-5 w-5" />
                <span className="hidden xl:inline">Order History</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm font-medium hover:text-blue-400 transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </>
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
