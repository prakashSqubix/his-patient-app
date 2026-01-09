import { useState, useCallback } from 'react';
import { useReduxAuth } from './useReduxAuth';

export const useLogout = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const reduxAuth = useReduxAuth();

  // Show logout confirmation modal
  const showLogoutConfirmation = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  // Hide logout confirmation modal
  const hideLogoutConfirmation = useCallback(() => {
    setShowLogoutModal(false);
  }, []);

  // Perform logout after confirmation
  const confirmLogout = useCallback(async (clearRememberedPhone: boolean = false) => {
    try {
      const result = await reduxAuth.signOut(clearRememberedPhone);
      setShowLogoutModal(false);
      return result;
    } catch (error) {
      console.error('Logout confirmation error:', error);
      setShowLogoutModal(false);
      return { success: false, error: 'Logout failed' };
    }
  }, [reduxAuth]);

  // Quick logout without confirmation (for programmatic use)
  const logoutWithoutConfirmation = useCallback(async (clearRememberedPhone: boolean = false) => {
    return await reduxAuth.signOut(clearRememberedPhone);
  }, [reduxAuth]);

  return {
    // Modal state
    showLogoutModal,
    
    // Actions
    showLogoutConfirmation,
    hideLogoutConfirmation,
    confirmLogout,
    logoutWithoutConfirmation,
    
    // Loading state
    isLoggingOut: reduxAuth.isLoading,
  };
};