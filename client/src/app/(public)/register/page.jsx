'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../../utils/auth'; 

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    username: '',
    title: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const timeoutRef = useRef(null);

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

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Role/Title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const data = await authService.register(formData);
      
      setRegistrationSuccess(true);
      
      timeoutRef.current = setTimeout(() => {
        setRegistrationSuccess(false);
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      }, 2000);

    } catch (error) {
      console.error('Registration failed:', error);
      setErrors({ general: error.message || 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading spinner component
  const LoadingSpinner = ({ className = "h-5 w-5" }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 p-6 text-white text-center"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome to</h1>
              <div className="text-4xl font-extrabold">
                <span className="text-teal-200">Foun
                     <span className="text-orange-400">dr</span>Geeks
                     </span>
              </div>
              
            </div>
          </motion.div>
        )}

        <div className="flex flex-col md:flex-row">
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full md:w-2/5 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 p-8 text-white flex flex-col justify-center items-center"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mb-8"
                >
                  <h1 className="text-3xl lg:text-4xl font-bold mb-3">Welcome to</h1>
                  <div className="text-4xl lg:text-5xl font-extrabold">
                    <span className="text-teal-200">Foun
                     <span className="text-orange-400">dr</span>Geeks
                     </span>
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
                      <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
                      <span className="text-teal-100 font-medium">Connect with innovators</span>
                    </div>
                    <p className="text-teal-200 text-sm">Join thousands of creators</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                      <span className="text-teal-100 font-medium">Showcase your projects</span>
                    </div>
                    <p className="text-teal-200 text-sm">Get discovered by partners</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                      <span className="text-teal-100 font-medium">AI-powered matching</span>
                    </div>
                    <p className="text-teal-200 text-sm">Find perfect collaborators</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          <div className="w-full md:w-3/5 p-6 md:p-8">
            <AnimatePresence>
              {registrationSuccess && (
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
                    <h3 className="font-bold text-lg">Registration Successful!</h3>
                    <p className="mt-1">Please check your email to verify your account.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-6"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-teal-900 mb-2">
                Are you Ready to Build ?
              </h2>
              <p className="text-teal-600 text-sm md:text-base">
                Get started in 1 minite
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
                <label htmlFor="fullName" className="block text-sm font-medium text-teal-700 mb-1">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-teal-700 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter a unique username"
                />
                {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
              </div>

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
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-teal-700 mb-1">
                  Your Role/Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-colors ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Product Designer, Web Developer, Entrepreneur"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
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
                    errors.password ? 'border-red-500' : 'border-gray-300'
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
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 8.268 7c0 4.057-3.79 7-8.268 7S.458 14.057 .458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="h-5 w-5 mr-3" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-teal-700 text-sm">
                Already have an account? <a href="/login" className="text-teal-600 font-semibold hover:text-teal-800 focus:outline-none focus:underline transition-colors">Sign in</a>
              </p>
            </div>

            <div className="mt-6 text-center text-xs text-teal-500">
              <p>By continuing, you agree to our <a href="terms-of-service" className="text-teal-600 hover:underline">Terms of Service</a> and <a href="/privacy-policy" className="text-teal-600 hover:underline">Privacy Policy</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}