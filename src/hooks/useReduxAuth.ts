import { useCallback } from 'react';
import { useAppDispatch, useAppSelector, RootState } from '@/store';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  refreshTokenStart,
  refreshTokenSuccess,
  refreshTokenFailure,
  logout,
  updateUserProfile,
  clearError,
  setRememberMe,
  User,
} from '@/store/authSlice';
import { useLoginMutation, useRefreshTokenMutation, useLogoutMutation } from './useAuth';
import { storageService } from '@/utils/storage';

export const useReduxAuth = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state: RootState) => state.auth);
  
  const loginMutation = useLoginMutation();
  const refreshTokenMutation = useRefreshTokenMutation();
  const logoutMutation = useLogoutMutation();

  // Login function
  const signIn = useCallback(async (phone: string, password: string, rememberMe: boolean = false) => {
    try {
      dispatch(loginStart());

      const response = await loginMutation.mutateAsync({
        phone,
        password,
      });

      if (response.statusCode === 200) {
        const { accessToken, _id, phone: userPhone, status, createdAt, updatedAt } = response.data;

        const user: User = {
          _id,
          phone: userPhone,
          status,
          createdAt,
          updatedAt,
        };

        // Store tokens in AsyncStorage as backup
        await storageService.setAccessToken(accessToken);
        await storageService.setUserData(user);

        if (rememberMe) {
          await storageService.setPhoneNumber(phone);
        }

        // Dispatch success action
        dispatch(loginSuccess({
          user,
          accessToken,
          rememberMe,
        }));

        console.log('Redux login success - User should be authenticated now:', {
          user,
          accessToken: !!accessToken,
          rememberMe,
        });

        return { success: true };
      } else {
        const errorMessage = response.message || 'Login failed';
        dispatch(loginFailure(errorMessage));
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      dispatch(loginFailure(errorMessage));
      return { success: false, error: errorMessage };
    }
  }, [dispatch, loginMutation]);

  // Refresh token function
  const refreshAccessToken = useCallback(async () => {
    try {
      dispatch(refreshTokenStart());

      const response = await refreshTokenMutation.mutateAsync();

      if (response.statusCode === 200) {
        const newAccessToken = response.data.accessToken;
        
        // Update AsyncStorage
        await storageService.setAccessToken(newAccessToken);
        
        // Dispatch success action
        dispatch(refreshTokenSuccess(newAccessToken));
        
        return { success: true, accessToken: newAccessToken };
      } else {
        const errorMessage = response.message || 'Token refresh failed';
        dispatch(refreshTokenFailure(errorMessage));
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Token refresh failed';
      dispatch(refreshTokenFailure(errorMessage));
      return { success: false, error: errorMessage };
    }
  }, [dispatch, refreshTokenMutation]);

  // Logout function
  const signOut = useCallback(async (clearRememberedPhone: boolean = false) => {
    try {
      // Call logout API first if user is authenticated
      if (authState.isAuthenticated && authState.accessToken) {
        try {
          console.log('Calling logout API...');
          const response = await logoutMutation.mutateAsync();
          
          if (response.statusCode === 200) {
            console.log('Logout API successful:', response.message);
          } else {
            console.warn('Logout API returned non-200 status:', response.statusCode);
          }
        } catch (apiError: any) {
          console.error('Logout API failed:', apiError);
          // Continue with local logout even if API fails
        }
      }

      // Clear AsyncStorage
      if (clearRememberedPhone) {
        await storageService.clearAll();
      } else {
        await storageService.removeAccessToken();
        await storageService.removeRefreshToken();
        await storageService.removeUserData();
      }

      // Dispatch logout action
      dispatch(logout({ clearRememberedPhone }));
      
      console.log('Logout completed successfully');
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      // Still dispatch logout even if storage clearing fails
      dispatch(logout({ clearRememberedPhone }));
      return { success: false, error: error.message };
    }
  }, [dispatch, authState.isAuthenticated, authState.accessToken, logoutMutation]);

  // Update user profile
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      if (authState.user) {
        const updatedUser = { ...authState.user, ...updates };
        
        // Update AsyncStorage
        await storageService.setUserData(updatedUser);
        
        // Dispatch update action
        dispatch(updateUserProfile(updates));
        
        return { success: true };
      }
      return { success: false, error: 'No user logged in' };
    } catch (error: any) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  }, [dispatch, authState.user]);

  // Set remember me preference
  const setRememberMePreference = useCallback(async (rememberMe: boolean, phone?: string) => {
    try {
      if (rememberMe && phone) {
        await storageService.setPhoneNumber(phone);
      } else if (!rememberMe) {
        await storageService.removePhoneNumber();
      }

      dispatch(setRememberMe({ rememberMe, phone }));
      return { success: true };
    } catch (error: any) {
      console.error('Remember me error:', error);
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Clear error
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return authState.isAuthenticated && !!authState.accessToken;
  }, [authState.isAuthenticated, authState.accessToken]);

  // Get current user
  const getCurrentUser = useCallback(() => {
    return authState.user;
  }, [authState.user]);

  // Get access token
  const getAccessToken = useCallback(() => {
    return authState.accessToken;
  }, [authState.accessToken]);

  return {
    // State
    ...authState,
    
    // Actions
    signIn,
    signOut,
    refreshAccessToken,
    updateProfile,
    setRememberMePreference,
    clearAuthError,
    
    // Getters
    isAuthenticated: isAuthenticated(),
    getCurrentUser,
    getAccessToken,
    
    // Loading states
    isLoading: authState.loading || loginMutation.isPending || refreshTokenMutation.isPending || logoutMutation.isPending,
  };
};