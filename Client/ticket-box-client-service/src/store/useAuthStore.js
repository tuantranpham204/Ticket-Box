import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Global store for authentication state (user info and JWT).
 * - Implements `persist` middleware to save to localStorage.
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      
      login: (user, accessToken) => set({ user, accessToken }),
      logout: () => set({ user: null, accessToken: null }),
      
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
