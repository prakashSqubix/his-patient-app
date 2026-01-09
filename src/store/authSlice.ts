import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  _id: string;
  phone: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  rememberMe: boolean;
  rememberedPhone: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
  rememberMe: false,
  rememberedPhone: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login actions
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{
      user: User;
      accessToken: string;
      refreshToken?: string;
      rememberMe?: boolean;
    }>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      if (action.payload.rememberMe) {
        state.rememberMe = true;
        state.rememberedPhone = action.payload.user.phone;
      }
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.error = action.payload;
    },

    // Token refresh actions
    refreshTokenStart: (state) => {
      state.loading = true;
    },
    refreshTokenSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.accessToken = action.payload;
      state.error = null;
    },
    refreshTokenFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = action.payload;
    },

    // Logout action
    logout: (state, action: PayloadAction<{ clearRememberedPhone?: boolean } | undefined>) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = null;
      
      // Only clear remembered phone if explicitly requested
      if (action.payload?.clearRememberedPhone) {
        state.rememberMe = false;
        state.rememberedPhone = null;
      }
    },

    // Update user profile
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Set remember me preferences
    setRememberMe: (state, action: PayloadAction<{ rememberMe: boolean; phone?: string }>) => {
      state.rememberMe = action.payload.rememberMe;
      if (action.payload.rememberMe && action.payload.phone) {
        state.rememberedPhone = action.payload.phone;
      } else if (!action.payload.rememberMe) {
        state.rememberedPhone = null;
      }
    },

    // Hydrate from storage (for manual sync if needed)
    hydrateAuth: (state, action: PayloadAction<Partial<AuthState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const {
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
  hydrateAuth,
} = authSlice.actions;

export default authSlice.reducer;