// app/login/page.js
'use client';
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@civic/auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [authState, setAuthState] = useState('idle'); // idle, signing-in, verifying, verified, error
  const [errors, setErrors] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const timeoutRef = useRef(null);

  const { user, isLoading, signIn, signOut } = useUser();
  const router = useRouter();

  // Detect mobile screens
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle user state changes and routing
  useEffect(() => {
    if (isLoading) {
      setAuthState('verifying');
      return;
    }
    if (user && authState !== 'verified') {
      setAuthState('verified');
      // Immediate redirect without delay
      setTimeout(() => router.push('/dashboard'), 100);
      return;
    }
    // Reset to idle if not loading and no user
    if (!isLoading && !user && authState !== 'idle' && authState !== 'error') {
      setAuthState('idle');
    }
  }, [user, isLoading, router, authState]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update the handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  setAuthState('signing-in');
  setErrors({});

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Use the login function from AuthContext to set user and token
    await login(data.user, data.token);

    setLoginSuccess(true);
    
    // Set timeout to redirect to dashboard after showing success message
    timeoutRef.current = setTimeout(() => {
      setLoginSuccess(false);
      router.push('/dashboard');
    }, 2000);

  } catch (error) {
    console.error('Login failed:', error);
    setAuthState('error');
    setErrors({ general: error.message || 'Login failed. Please try again.' });
  } finally {
    setAuthState('idle');
  }
};
  // Enhanced sign-in handler for Civic
  // Update the handleCivicSignIn function
const handleCivicSignIn = async () => {
  try {
    setAuthState('signing-in');
    console.log("Starting Civic sign-in process");
    
    // Check if Civic is available
    if (typeof window === 'undefined' || !window.civic) {
      throw new Error('Civic is not available. Please ensure the Civic script is loaded.');
    }

    // Initialize Civic Auth
    const civic = new window.civic.siww({
      appId: process.env.NEXT_PUBLIC_CIVIC_CLIENT_ID,
    });

    const civicData = await civic.login();

    // Send Civic data to our backend
    const response = await fetch('/api/auth/civic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(civicData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Civic authentication failed');
    }

    // Use the login function from AuthContext to set user and token
    await login(data.user, data.token);

    console.log("Civic sign-in completed successfully");
  } catch (error) {
    console.error('Civic sign in failed:', error);
    setAuthState('error');
    
    // Reset to idle after showing error
    setTimeout(() => {
      setAuthState('idle');
    }, 3000);
  }
};
  // Sign-out handler
  const handleSignOut = async () => {
    try {
      console.log("Starting sign-out process");
      await signOut();
      setAuthState('idle');
      console.log("Sign-out completed successfully");
    } catch (error) {
      console.error('Sign out failed:', error);
      setAuthState('error');
    }
  };

  // Get button text and state based on auth state
  const getCivicButtonState = () => {
    switch (authState) {
      case 'signing-in':
        return {
          text: 'Opening Civic...',
          disabled: true,
          className: 'bg-gray-300 text-gray-500 cursor-wait',
          showSpinner: true
        };
      case 'verifying':
        return {
          text: 'Verifying...',
          disabled: true,
          className: 'bg-gray-300 text-gray-500 cursor-wait',
          showSpinner: true
        };
      case 'verified':
        return {
          text: 'Redirecting...',
          disabled: true,
          className: 'bg-green-600 text-white cursor-wait',
          showSpinner: true
        };
      case 'error':
        return {
          text: 'Authentication Failed - Retry',
          disabled: false,
          className: 'bg-red-500 hover:bg-red-600 text-white',
          showSpinner: false
        };
      default:
        if (user) {
          return {
            text: 'Go to Dashboard',
            disabled: false,
            className: 'bg-teal-600 hover:bg-teal-700 text-white',
            showSpinner: false
          };
        }
        return {
          text: 'Continue with Civic',
          disabled: false,
          className: 'bg-white border border-teal-300 text-gray-700 hover:bg-gray-50',
          showSpinner: false
        };
    }
  };

  const civicButtonState = getCivicButtonState();
  
  // Loading spinner component
  const LoadingSpinner = ({ className = "h-5 w-5" }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header for mobile */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 p-6 text-white text-center relative overflow-hidden"
          >
            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-4 right-4 w-12 h-12 bg-orange-400/20 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 bg-teal-300/30 rounded-full animate-bounce delay-700"></div>
              <div className="absolute top-1/2 left-1/4 w-6 h-6 bg-white/10 rounded-full animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">Welcome to</h1>
              <div className="text-4xl font-extrabold">
                <span className="text-teal-200">Launch</span>
                <span className="text-orange-400">pad</span>
              </div>
              <p className="text-teal-100 mt-2">Showcase your projects and connect with innovators</p>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col md:flex-row">
          {/* Left side - Enhanced Illustration */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full md:w-2/5 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 p-8 text-white flex flex-col justify-center items-center relative overflow-hidden"
            >
              {/* Animated background elements */}
              <div className="absolute inset-0">
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute top-8 right-8 w-16 h-16 bg-orange-400/20 rounded-full"
                ></motion.div>

                <motion.div
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute bottom-12 left-8 w-12 h-12 bg-teal-300/30 rounded-full"
                ></motion.div>

                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute top-1/3 left-1/4 w-8 h-8 bg-white/10 rounded-full"
                ></motion.div>

                <motion.div
                  animate={{
                    x: [0, 30, 0],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-orange-300/20 rounded-full"
                ></motion.div>
              </div>

              <div className="relative z-10 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mb-8"
                >
                  <h1 className="text-3xl lg:text-4xl font-bold mb-3">Welcome to</h1>
                  <div className="text-4xl lg:text-5xl font-extrabold">
                    <span className="text-teal-200">Launch</span>
                    <span className="text-orange-400">pad</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="space-y-4"
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-orange-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-teal-100 font-medium">Connect with innovators</span>
                    </div>
                    <p className="text-teal-200 text-sm">Join thousands of student creators</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse delay-500"></div>
                      <span className="text-teal-100 font-medium">Showcase your projects</span>
                    </div>
                    <p className="text-teal-200 text-sm">Get discovered by partners</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full mr-2 animate-pulse delay-1000"></div>
                      <span className="text-teal-100 font-medium">Access funding</span>
                    </div>
                    <p className="text-teal-200 text-sm">Micro-grants and opportunities</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Right side - Form */}
          <div className="w-full md:w-3/5 p-6 md:p-8">
            {/* Login Success Message */}
            <AnimatePresence>
              {loginSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 flex items-start"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-bold text-lg">Login Successful!</h3>
                    <p className="mt-1">Redirecting to dashboard...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Civic Auth Loading Overlay */}
            {(authState === 'signing-in' || authState === 'verifying' || authState === 'verified') && (
              <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-sm mx-4">
                  <LoadingSpinner className="h-12 w-12 mx-auto mb-4 text-teal-600" />
                  <p className="text-teal-700 font-medium text-lg mb-2">
                    {authState === 'signing-in' && 'Opening Civic...'}
                    {authState === 'verifying' && 'Verifying credentials...'}
                    {authState === 'verified' && 'Success! Redirecting...'}
                  </p>
                  <p className="text-sm text-teal-500">
                    {authState === 'signing-in' && 'Complete authentication in the popup window'}
                    {authState === 'verifying' && 'Checking your university credentials'}
                    {authState === 'verified' && 'Taking you to your dashboard'}
                  </p>
                </div>
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-6"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-teal-900 mb-2">
                Welcome back
              </h2>
              <p className="text-teal-600 text-sm md:text-base">
                Sign in to continue your journey
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-start"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.general}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-teal-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors ${
                    errors.email ? 'border-red-500' : 'border-teal-100'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-teal-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors ${
                    errors.password ? 'border-red-500' : 'border-teal-100'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-11 text-teal-500 hover:text-teal-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3,10 3s8.268 2.943,9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3,10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7,9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={authState === 'signing-in'}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {authState === 'signing-in' ? (
                  <>
                    <LoadingSpinner className="h-5 w-5 mr-3" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <div className="my-5 flex items-center">
              <div className="flex-grow border-t border-teal-200"></div>
              <span className="mx-4 text-teal-600 text-sm">Or continue with</span>
              <div className="flex-grow border-t border-teal-200"></div>
            </div>

            <button
              onClick={handleCivicSignIn}
              disabled={civicButtonState.disabled}
              className={`w-full font-medium py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center ${civicButtonState.className}`}
            >
              {civicButtonState.showSpinner && <LoadingSpinner className="h-5 w-5 mr-2" />}
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989,4.785 1.849l3.254-3.138C18.189 1.186,15.479 0,12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#4285F4"/>
              </svg>
              {civicButtonState.text}
            </button>

            <div className="mt-5 text-center">
              <p className="text-teal-700 text-sm">
                Don't have an account? <a href="/register" className="text-teal-600 font-semibold hover:text-teal-800 focus:outline-none focus:underline transition-colors">Sign up</a>
              </p>
            </div>

            <div className="mt-6 text-center text-xs text-teal-500">
              <p>By continuing, you agree to our <a href="#" className="text-teal-600 hover:underline">Terms of Service</a> and <a href="#" className="text-teal-600 hover:underline">Privacy Policy</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}