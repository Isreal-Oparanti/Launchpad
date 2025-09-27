// context/AuthContext.jsx
"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to fetch user data using token
  const fetchUser = async (authToken) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      } else {
        // Token is invalid, clear it
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        return false;
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      return false;
    }
  };

  // Updated login function that handles both cases
  const login = async (userData, userToken = null) => {
    try {
      if (userToken) {
        // Set token and user data (from email/password auth)
        setToken(userToken);
        setUser(userData);
        localStorage.setItem('token', userToken);
        return true;
      } else if (userData) {
        // Direct user data (for initial load from localStorage)
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Check for existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchUser(savedToken).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, login, token, logout }}>
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


// // context/AuthContext.jsx
// "use client";
// import { createContext, useContext, useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   // Function to fetch user data using token
//   const fetchUser = async (authToken) => {
//     try {
//       const response = await fetch('/api/auth/me', {
//         headers: {
//           'Authorization': `Bearer ${authToken}`
//         }
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         setUser(data.user);
//         return true;
//       } else {
//         // Token is invalid, clear it
//         setToken(null);
//         setUser(null);
//         localStorage.removeItem('token');
//         return false;
//       }
//     } catch (error) {
//       console.error('Error fetching user:', error);
//       setToken(null);
//       setUser(null);
//       localStorage.removeItem('token');
//       return false;
//     }
//   };

//   const login = async (userData, userToken = null) => {
//     if (userToken) {
//       // Set token and fetch user data
//       setToken(userToken);
//       localStorage.setItem('token', userToken);
//       await fetchUser(userToken);
//     } else if (userData) {
//       // Direct user data (for initial load from localStorage)
//       setUser(userData);
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     setToken(null);
//     localStorage.removeItem('token');
//     router.push('/login');
//   };

//   // Check for existing token on mount
//   useEffect(() => {
//     const savedToken = localStorage.getItem('token');
//     if (savedToken) {
//       setToken(savedToken);
//       fetchUser(savedToken).finally(() => setLoading(false));
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   return (
//     <UserContext.Provider value={{ user, loading, login, token, logout }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export const useUser = () => {
//   const context = useContext(UserContext);
//   if (context === undefined) {
//     throw new Error('useUser must be used within a UserProvider');
//   }
//   return context;
// };