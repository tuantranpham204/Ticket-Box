import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Global store for authentication state (user info and JWT).
 * - Implements `persist` middleware to save to localStorage.
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null, // Will hold the UserResponse object
      accessToken: null,
      
      /**
       * Action to set the user and token on login.
       * @param {object} user - The UserResponse object from the API.
       * @param {string} accessToken - The JWT access token.
       */
      login: (user, accessToken) => set({ user, accessToken }),

      /**
       * Action to clear the user and token on logout.
       */
      logout: () => set({ user: null, accessToken: null }),
      
      /**
       * Helper to check if the user has a specific role.
       * @param {string} roleName - e.g., "ROLE_APPROVER"
       * @returns {boolean}
       */
      hasRole: (roleName) => {
        const { user } = useAuthStore.getState();
        return user?.roles?.some(role => role.name === roleName) || false;
      },
    }),
    {
      name: 'ticketbox-auth', // Key in localStorage
      storage: createJSONStorage(() => localStorage), // Use localStorage
    }
  )
);
