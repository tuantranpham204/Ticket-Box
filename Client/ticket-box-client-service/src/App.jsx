import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/layout';
import AuthModal from './components/authModal';

// --- Auth Stores ---
// Make sure this path matches your store file
// (e.g., './store/authStore.js' or './store/authStore.jsx')
import { useAuthStore } from './store/useAuthStore'; 

// --- Page Components ---
// We lazy-load pages to improve initial load time
const HomePage = React.lazy(() => import('./pages/homePage'));

// Add other pages here as you build them
const EventDetailPage = React.lazy(() => import('./pages/eventDetailPage'));
// const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false, // Good default for stability
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* AuthModal is placed outside routes so it can overlay any page */}
        <AuthModal />
        
        {/* Toaster provides notifications for login success/failure */}
        <Toaster richColors position="top-right" />

        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* All routes are nested under the main Layout (Header, etc.) */}
            <Route path="/" element={<Layout />}>
              
              {/* --- Public Routes --- */}
              <Route index element={<HomePage />} />
              <Route path="event/:eventId" element={<EventDetailPage />} />
             
              
              {/* --- Protected Routes (Example) --- */}
              {/* Uncomment these as you build the components */}
              {/* <Route path="/my-tickets" element={
                <RoleBasedRoute roles={['ROLE_USER']}>
                  <MyTicketsPage />
                </RoleBasedRoute>
              } /> */}
              {/* <Route path="/admin" element={
                <RoleBasedRoute roles={['ROLE_ADMIN', 'ROLE_APPROVER']}>
                  <AdminDashboard />
                </RoleBasedRoute>
              } /> */}

              {/* --- Catch-all (404) Route --- */}
              {/* Any path not matched above will redirect to the home page */}
              <Route path="*" element={<Navigate to="/" replace />} />
              
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

// --- Helper Components ---

/**
 * A simple loading spinner component for React.Suspense
 */
const LoadingSpinner = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-900">
    <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-blue-500"></div>
  </div>
);

/**
 * A component to protect routes based on user roles.
 * It checks the auth state from Zustand.
 * @param {{ children: React.ReactNode, roles: string[] }} props
 */
const RoleBasedRoute = ({ children, roles }) => {
  const { user } = useAuthStore();
  
  // Check if user is logged in
  const isAuth = !!user;

  // Check if user has one of the required roles
  // We assume the `user` object has a `roles` array like:
  // user.roles = [{ name: 'ROLE_USER' }, { name: 'ROLE_ADMIN' }]
  const hasRole = isAuth && user.roles.some(role => roles.includes(role.name));

  if (!isAuth || !hasRole) {
    // Redirect to home page if not authenticated or authorized
    console.warn('Unauthorized access attempt to a protected route.');
    return <Navigate to="/" replace />;
  }

  return children; // Render the protected component
};
