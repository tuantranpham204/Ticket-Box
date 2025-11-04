import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './header'
import Footer from './footer'
// We'd also have a Footer component
// import Footer from './Footer';

/**
 * Main application layout.
 * Includes the Header, Footer, and renders the current page.
 */
export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-white">
      <Header />
      <main className="flex-grow">
        <Outlet /> {/* This renders the current route's page (e.g., HomePage) */}
      </main>
      <Footer />
    </div>
  );
}

