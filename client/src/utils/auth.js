class AuthService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  // Process queued requests after token refresh
  processQueue(error, token = null) {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  async refreshToken() {
    if (this.isRefreshing) {
      // Queue the request and wait for token refresh
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.processQueue(null, data.accessToken);
      return data;
    } catch (error) {
      this.processQueue(error, null);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  async fetchWithAuth(url, options = {}) {
    try {
      let response = await fetch(url, {
        ...options,
        credentials: 'include',
      });

      // If we get 401, try refresh ONCE
      if (response.status === 401) {
        try {
          await this.refreshToken();
          
          // Retry the original request with new token
          response = await fetch(url, {
            ...options,
            credentials: 'include',
          });
        } catch (refreshError) {
          // Refresh failed - don't redirect here, let caller handle it
          throw new Error('AUTH_FAILED');
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async register(userData) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    return data;
  }

  async verifyEmail(verificationData) {
    const response = await fetch(`${this.baseURL}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(verificationData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Verification failed');
    }
    
    return data;
  }

  async resendVerification(email) {
    const response = await fetch(`${this.baseURL}/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Resend failed');
    }
    
    return data;
  }

  async login(credentials) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    return data;
  }

  async getCurrentUser() {
    try {
      const response = await this.fetchWithAuth(`${this.baseURL}/auth/me`);
      
      if (!response.ok) {
        throw new Error('Not authenticated');
      }
      
      return response.json();
    } catch (error) {
      if (error.message === 'AUTH_FAILED') {
        throw new Error('Session expired');
      }
      throw error;
    }
  }

  async logout() {
    const response = await fetch(`${this.baseURL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    return response.json();
  }

  async updateProfile(profileData) {
    try {
      const response = await this.fetchWithAuth(`${this.baseURL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Profile update failed`);
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(passwordData) {
    const response = await this.fetchWithAuth(`${this.baseURL}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passwordData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Password change failed');
    }
    
    return data;
  }

  async deleteAccount() {
    const response = await this.fetchWithAuth(`${this.baseURL}/auth/delete-account`, {
      method: 'DELETE',
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Account deletion failed');
    }
    
    return data;
  }

  async getUserProfile(userId) {
    const response = await fetch(`${this.baseURL}/auth/users/${userId}`, {
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user profile');
    }
    
    return data;
  }

  async getUserProjects(userId) {
    const response = await fetch(`${this.baseURL}/auth/users/${userId}/projects`, {
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user projects');
    }
    
    return data;
  }
}

export const authService = new AuthService();