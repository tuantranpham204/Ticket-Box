import { create } from 'zustand';

/**
 * This store manages the global UI state, primarily for the authentication modal.
 */
export const useUIStore = create((set) => ({
  isAuthModalOpen: false,
  
  authModalView: 'login',
  openAuthModal: (view = 'login') => 
    set({ isAuthModalOpen: true, authModalView: view }),

  closeAuthModal: () => 
    set({ isAuthModalOpen: false }),

  setAuthModalView: (view) => 
    set({ authModalView: view }),
}));
