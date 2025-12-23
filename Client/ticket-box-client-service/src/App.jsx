import React, { Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import Layout from "./components/layout";
import AuthModal from "./components/authModal";

// --- Auth Stores ---
import { useAuthStore } from "./store/useAuthStore";

// --- Page Components ---
const HomePage = React.lazy(() => import("./pages/homePage"));
const EventDetailPage = React.lazy(() => import("./pages/eventDetailPage"));
const EventCreationPage = React.lazy(() => import("./pages/eventCreationPage")); // Ensure file name matches exactly
const ApproverDashboard = React.lazy(() => import("./pages/approverDashboard"));
const SearchResultsPage = React.lazy(() => import("./pages/searchResultsPage"));
const CartPage = React.lazy(() => import("./pages/cartPage"));
const OrderHistoryPage = React.lazy(() => import("./pages/orderHistoryPage"));
const CategoryPage = React.lazy(() => import("./pages/categoryPage"));
const UserProfilePage = React.lazy(() => import("./pages/userProfilePage"));

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
              <Route path="search" element={<SearchResultsPage />} />
              <Route path="category/:categoryId" element={<CategoryPage />} />

              {/* --- Protected Routes --- */}
              <Route
                path="/create-event"
                element={
                  <RoleBasedRoute
                    roles={["ROLE_USER", "ROLE_ADMIN", "ROLE_APPROVER"]}
                  >
                    <EventCreationPage />
                  </RoleBasedRoute>
                }
              />

              <Route
                path="/approver-dashboard"
                element={
                  <RoleBasedRoute roles={['ROLE_APPROVER']}>
                    <ApproverDashboard />
                  </RoleBasedRoute>
                }
              />

              <Route path="/cart-tickets" element={
                <RoleBasedRoute roles={['ROLE_USER', 'ROLE_APPROVER', 'ROLE_ADMIN']}>
                  <CartPage />
                </RoleBasedRoute>
              } />

              <Route path="/order-history" element={
                <RoleBasedRoute roles={['ROLE_USER', 'ROLE_APPROVER', 'ROLE_ADMIN']}>
                  <OrderHistoryPage />
                </RoleBasedRoute>
              } />

              <Route path="/profile" element={
                <RoleBasedRoute roles={['ROLE_USER', 'ROLE_APPROVER', 'ROLE_ADMIN']}>
                  <UserProfilePage />
                </RoleBasedRoute>
              } />

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
 * It checks the auth state from Zustand and triggers a toast on failure.
 * @param {{ children: React.ReactNode, roles: string[] }} props
 */
const RoleBasedRoute = ({ children, roles }) => {
  const { user } = useAuthStore();

  // Check if user is logged in
  const isAuth = !!user;

  // Check if user has one of the required roles
  // Using optional chaining to be safe if user or user.roles is undefined
  const hasRole =
    isAuth && user?.roles?.some((role) => roles.includes(role.name));

  // Use useEffect to trigger the toast as a side effect.
  // This prevents the "Cannot update a component while rendering a different component" warning.
  useEffect(() => {
    if (!isAuth) {
      toast.error("You must be logged in to access this page.");
    } else if (!hasRole) {
      toast.error("You do not have permission to view this page.");
    }
  }, [isAuth, hasRole]);

  if (!isAuth || !hasRole) {
    // Redirect to home page if not authenticated or authorized
    return <Navigate to="/" replace />;
  }

  return children; // Render the protected component
};