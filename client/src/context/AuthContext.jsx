// @/context/AuthContext.js
"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../utils/auth';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const data = await authService.getCurrentUser();
      setUser(data.user);
      return true;
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
      return false;
    }
  };

  const login = async (userData) => {
    try {
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await fetchUser();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, login, logout, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};