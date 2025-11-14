import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './header'
import Footer from './footer'

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

