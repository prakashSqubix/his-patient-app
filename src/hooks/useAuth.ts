import { useMutation } from '@tanstack/react-query';
import { 
  apiService, 
  SignupRequest, 
  SignupResponse, 
  VerifyOtpRequest, 
  VerifyOtpResponse,
  CreatePasswordRequest,
  CreatePasswordResponse,
  LoginRequest,
  LoginResponse,
  ApiError 
} from '@/services/api';

export const useSignupMutation = () => {
  return useMutation<SignupResponse, ApiError, SignupRequest>({
    mutationFn: (data: SignupRequest) => apiService.signup(data),
    onError: (error) => {
      console.error('Signup error:', error);
    },
  });
};

export const useVerifyOtpMutation = () => {
  return useMutation<VerifyOtpResponse, ApiError, VerifyOtpRequest>({
    mutationFn: (data: VerifyOtpRequest) => apiService.verifyOtp(data),
    onError: (error) => {
      console.error('OTP verification error:', error);
    },
  });
};

export const useCreatePasswordMutation = () => {
  return useMutation<CreatePasswordResponse, ApiError, CreatePasswordRequest>({
    mutationFn: (data: CreatePasswordRequest) => apiService.createPassword(data),
    onError: (error) => {
      console.error('Create password error:', error);
    },
  });
};

export const useLoginMutation = () => {
  return useMutation<LoginResponse, ApiError, LoginRequest>({
    mutationFn: (data: LoginRequest) => apiService.login(data),
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
};