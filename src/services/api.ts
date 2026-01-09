const API_BASE_URL = 'http://192.168.1.52:5003';

// Import storage service at the top
import { storageService } from '@/utils/storage';

// Cookie parser utility
const parseCookies = (cookieHeader: string): Record<string, string> => {
  const cookies: Record<string, string> = {};
  cookieHeader.split(',').forEach(cookie => {
    const parts = cookie.trim().split(';')[0].split('=');
    if (parts.length === 2) {
      cookies[parts[0].trim()] = parts[1].trim();
    }
  });
  return cookies;
};

export interface SignupRequest {
  phone: string;
}

export interface SignupResponse {
  message: string;
  statusCode: number;
  data: {
    otp: string;
  };
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface VerifyOtpResponse {
  message: string;
  statusCode: number;
}

export interface CreatePasswordRequest {
  phone: string;
  password: string;
}

export interface CreatePasswordResponse {
  message: string;
  statusCode: number;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  statusCode: number;
  data: {
    _id: string;
    phone: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    accessToken: string;
  };
}

export interface RefreshTokenResponse {
  message: string;
  statusCode: number;
  data: {
    accessToken: string;
  };
}

export interface LogoutResponse {
  message: string;
  statusCode: number;
}

export interface ApiError {
  message: string;
  status?: number;
  statusCode?: number;
}

class ApiService {
  private refreshTokenPromise: Promise<string> | null = null;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    skipAuth: boolean = false
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    let config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for refresh token
      ...options,
    };

    // Add access token to headers if not skipping auth
    if (!skipAuth) {
      const accessToken = await storageService.getAccessToken();
      if (accessToken) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${accessToken}`,
        };
      }
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        // Check if it's a 401 (unauthorized) and we have a refresh token
        if (response.status === 401 && !skipAuth && !endpoint.includes('refresh-token')) {
          console.log('Access token expired, attempting refresh...');
          
          try {
            const newAccessToken = await this.refreshAccessToken();
            
            // Retry the original request with new token
            config.headers = {
              ...config.headers,
              'Authorization': `Bearer ${newAccessToken}`,
            };
            
            const retryResponse = await fetch(url, config);
            const retryData = await retryResponse.json();
            
            if (!retryResponse.ok) {
              throw {
                message: retryData.message || `HTTP error! status: ${retryResponse.status}`,
                status: retryResponse.status,
                statusCode: retryData.statusCode || retryResponse.status,
              } as ApiError;
            }
            
            return retryData;
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Clear stored tokens and redirect to login
            await storageService.clearAll();
            throw refreshError;
          }
        }
        
        // For other errors, throw normally
        throw {
          message: data.message || `HTTP error! status: ${response.status}`,
          status: response.status,
          statusCode: data.statusCode || response.status,
        } as ApiError;
      }

      // Extract refresh token from Set-Cookie header if present
      const setCookieHeader = response.headers.get('Set-Cookie');
      if (setCookieHeader && setCookieHeader.includes('refreshToken=')) {
        const cookies = parseCookies(setCookieHeader);
        if (cookies.refreshToken) {
          await storageService.setRefreshToken(cookies.refreshToken);
          console.log('Refresh token stored from cookie');
        }
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        // Network error
        throw {
          message: 'Network error. Please check your connection.',
          status: 0,
        } as ApiError;
      }
      throw error;
    }
  }

  private async refreshAccessToken(): Promise<string> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshTokenPromise;
      return newToken;
    } finally {
      this.refreshTokenPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const refreshToken = await storageService.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Make refresh request with refresh token in cookie
    const response = await fetch(`${API_BASE_URL}/patient/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `refreshToken=${refreshToken}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        message: data.message || 'Token refresh failed',
        status: response.status,
        statusCode: data.statusCode || response.status,
      } as ApiError;
    }

    // Store the new access token
    const newAccessToken = data.data.accessToken;
    await storageService.setAccessToken(newAccessToken);
    
    console.log('Access token refreshed successfully');
    return newAccessToken;
  }

  async signup(data: SignupRequest): Promise<SignupResponse> {
    return this.request<SignupResponse>('/patient/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true); // Skip auth for signup
  }

  async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    return this.request<VerifyOtpResponse>('/patient/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true); // Skip auth for OTP verification
  }

  async createPassword(data: CreatePasswordRequest): Promise<CreatePasswordResponse> {
    return this.request<CreatePasswordResponse>('/patient/auth/create-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true); // Skip auth for password creation
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/patient/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true); // Skip auth for login
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    return this.request<RefreshTokenResponse>('/patient/auth/refresh-token', {
      method: 'POST',
    }, true); // Skip auth for refresh token
  }

  async logout(): Promise<LogoutResponse> {
    return this.request<LogoutResponse>('/patient/auth/logout', {
      method: 'POST',
    }, false); // Include auth for logout
  }
}

export const apiService = new ApiService();