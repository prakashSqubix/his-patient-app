import { storageService } from './storage';

interface JWTPayload {
  _id: string;
  phone: string;
  iat: number; // issued at
  exp: number; // expiration time
}

class TokenManager {
  // Decode JWT token (without verification - just for reading payload)
  private decodeJWT(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  // Check if token is expired or will expire soon (within 1 minute)
  async isTokenExpiredOrExpiring(): Promise<boolean> {
    try {
      const accessToken = await storageService.getAccessToken();
      if (!accessToken) return true;

      const payload = this.decodeJWT(accessToken);
      if (!payload) return true;

      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = payload.exp;
      const bufferTime = 60; // 1 minute buffer

      // Check if token is expired or will expire within buffer time
      return currentTime >= (expirationTime - bufferTime);
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  // Get token expiration time
  async getTokenExpirationTime(): Promise<Date | null> {
    try {
      const accessToken = await storageService.getAccessToken();
      if (!accessToken) return null;

      const payload = this.decodeJWT(accessToken);
      if (!payload) return null;

      return new Date(payload.exp * 1000);
    } catch (error) {
      console.error('Error getting token expiration:', error);
      return null;
    }
  }

  // Get time until token expires (in minutes)
  async getTimeUntilExpiration(): Promise<number | null> {
    try {
      const expirationTime = await this.getTokenExpirationTime();
      if (!expirationTime) return null;

      const currentTime = new Date();
      const timeDiff = expirationTime.getTime() - currentTime.getTime();
      return Math.floor(timeDiff / (1000 * 60)); // Convert to minutes
    } catch (error) {
      console.error('Error calculating time until expiration:', error);
      return null;
    }
  }

  // Check if user is authenticated (has valid tokens)
  async isAuthenticated(): Promise<boolean> {
    try {
      const accessToken = await storageService.getAccessToken();
      const refreshToken = await storageService.getRefreshToken();
      
      // Must have both tokens
      if (!accessToken || !refreshToken) return false;

      // If access token is not expired, user is authenticated
      const isExpired = await this.isTokenExpiredOrExpiring();
      return !isExpired;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  // Log token information (for debugging)
  async logTokenInfo(): Promise<void> {
    try {
      const accessToken = await storageService.getAccessToken();
      const refreshToken = await storageService.getRefreshToken();
      
      console.log('Token Info:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        isExpired: await this.isTokenExpiredOrExpiring(),
        timeUntilExpiration: await this.getTimeUntilExpiration(),
        expirationTime: await this.getTokenExpirationTime(),
      });
    } catch (error) {
      console.error('Error logging token info:', error);
    }
  }
}

export const tokenManager = new TokenManager();