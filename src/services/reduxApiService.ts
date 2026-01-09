import { store } from '@/store';
import { refreshTokenSuccess, refreshTokenFailure, logout } from '@/store/authSlice';
import { apiService } from './api';

class ReduxApiService {
  // Enhanced request method that integrates with Redux
  async makeAuthenticatedRequest<T>(
    requestFn: () => Promise<T>,
    retryOnTokenRefresh: boolean = true
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error: any) {
      // If it's a 401 error and we can retry
      if (error.status === 401 && retryOnTokenRefresh) {
        console.log('Token expired, attempting refresh via Redux...');
        
        try {
          // Get current state
          const state = store.getState();
          const refreshToken = state.auth.refreshToken;
          
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Call refresh token API
          const refreshResponse = await apiService.refreshToken();
          
          if (refreshResponse.statusCode === 200) {
            const newAccessToken = refreshResponse.data.accessToken;
            
            // Update Redux state
            store.dispatch(refreshTokenSuccess(newAccessToken));
            
            console.log('Token refreshed successfully via Redux');
            
            // Retry the original request
            return await requestFn();
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          
          // Clear auth state and redirect to login
          store.dispatch(refreshTokenFailure('Token refresh failed'));
          store.dispatch(logout({ clearRememberedPhone: false }));
          
          throw refreshError;
        }
      }
      
      throw error;
    }
  }

  // Get current access token from Redux state
  getCurrentAccessToken(): string | null {
    const state = store.getState();
    return state.auth.accessToken;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const state = store.getState();
    return state.auth.isAuthenticated && !!state.auth.accessToken;
  }

  // Get current user from Redux state
  getCurrentUser() {
    const state = store.getState();
    return state.auth.user;
  }
}

export const reduxApiService = new ReduxApiService();