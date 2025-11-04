import { create } from 'zustand';

/**
 * This store manages the global UI state, primarily for the authentication modal.
 */
export const useUIStore = create((set) => ({
  // State: Is the modal currently open?
  isAuthModalOpen: false,
  
  // State: Which view is active? 'login' or 'register'
  authModalView: 'login',

  // Action: Open the modal (defaults to 'login' view)
  openAuthModal: (view = 'login') => 
    set({ isAuthModalOpen: true, authModalView: view }),

  // Action: Close the modal
  closeAuthModal: () => 
    set({ isAuthModalOpen: false }),

  // Action: Switch the view inside the modal
  setAuthModalView: (view) => 
    set({ authModalView: view }),
}));
