class AuthService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
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
    const response = await fetch(`${this.baseURL}/auth/me`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Not authenticated');
    }

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
      
      const response = await fetch(`${this.baseURL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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
  const response = await fetch(`${this.baseURL}/auth/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(passwordData),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Password change failed');
  }
  
  return data;
}

async deleteAccount() {
  const response = await fetch(`${this.baseURL}/auth/delete-account`, {
    method: 'DELETE',
    credentials: 'include',
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Account deletion failed');
  }
  
  return data;
}
}

export const authService = new AuthService();