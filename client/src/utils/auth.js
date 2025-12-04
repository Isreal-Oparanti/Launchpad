class AuthService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    this.isRefreshing = false;
    this.failedRequests = [];
  }

  async refreshToken() {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedRequests.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      // Process all queued requests
      this.failedRequests.forEach(request => request.resolve(data));
      this.failedRequests = [];
      
      return data;
    } catch (error) {
      this.failedRequests.forEach(request => request.reject(error));
      this.failedRequests = [];
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  async fetchWithAuth(url, options = {}) {
    let response = await fetch(url, {
      ...options,
      credentials: 'include',
    });

    // If token expired, try to refresh
    if (response.status === 401) {
      try {
        await this.refreshToken();
        // Retry the original request
        response = await fetch(url, {
          ...options,
          credentials: 'include',
        });
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
    }

    return response;
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
    const response = await this.fetchWithAuth(`${this.baseURL}/auth/me`);
    if (!response.ok) throw new Error('Not authenticated');
    return response.json();
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
      console.log('Updating profile with data:', profileData);
      console.log('Request URL:', `${this.baseURL}/auth/profile`);
      
      const response = await this.fetchWithAuth(`${this.baseURL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        console.error('Update profile failed:', data);
        throw new Error(data.message || `Profile update failed with status ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
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

  // NEW METHODS FOR USER PROFILES
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