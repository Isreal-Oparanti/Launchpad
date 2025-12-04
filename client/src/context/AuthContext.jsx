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
        const isAuthenticated = await fetchUser();
        if (!isAuthenticated) {
          // Only redirect if not on login/register pages
          if (!window.location.pathname.includes('/login') && 
              !window.location.pathname.includes('/register')) {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Only redirect if not on login/register pages
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/register')) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Add a session check interval
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(async () => {
      try {
        await fetchUser();
      } catch (error) {
        console.error('Session check failed:', error);
        logout();
      }
    }, 15 * 60 * 1000); // Check every 15 minutes

    return () => clearInterval(interval);
  }, [user]);

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