const API_BASE_URL = 'http://192.168.1.52:5003';

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

export interface ApiError {
  message: string;
  status?: number;
  statusCode?: number;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        // For OTP verification, the API might return error details in the response body
        throw {
          message: data.message || `HTTP error! status: ${response.status}`,
          status: response.status,
          statusCode: data.statusCode || response.status,
        } as ApiError;
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

  async signup(data: SignupRequest): Promise<SignupResponse> {
    return this.request<SignupResponse>('/patient/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    return this.request<VerifyOtpResponse>('/patient/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createPassword(data: CreatePasswordRequest): Promise<CreatePasswordResponse> {
    return this.request<CreatePasswordResponse>('/patient/auth/create-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/patient/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();