'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@civic/auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [authState, setAuthState] = useState('idle'); // idle, signing-in, verifying, verified, error
  const [isMobile, setIsMobile] = useState(false);
  
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
  
  useEffect(() => {
    setIsVisible(true);
    
    // Preload dashboard for faster navigation
    router.prefetch('/dashboard');
    
    // Rotate features every 3 seconds
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % 3);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [router]);
  
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
  
  const features = [
    "Micro-grants available",
    "Project Spotlight", 
    "Real Opportunities"
  ];
  
  // Enhanced sign-in handler
  const handleSignIn = async () => {
    try {
      setAuthState('signing-in');
      console.log("Starting sign-in process");
      
      await signIn();
      console.log("Sign-in completed successfully");
    } catch (error) {
      console.error('Sign in failed:', error);
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
  const getAuthButtonState = () => {
    switch (authState) {
      case 'signing-in':
        return {
          text: 'Opening Civic...',
          disabled: true,
          className: 'bg-teal-500 text-white cursor-wait',
          showSpinner: true
        };
      case 'verifying':
        return {
          text: 'Verifying...',
          disabled: true,
          className: 'bg-teal-500 text-white cursor-wait',
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
          text: 'Sign in Failed - Retry',
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
          text: 'Sign in with Civic',
          disabled: false,
          className: 'bg-teal-600 hover:bg-teal-700 text-white',
          showSpinner: false
        };
    }
  };
  
  const buttonState = getAuthButtonState();
  
  // Loading spinner component
  const LoadingSpinner = ({ className = "h-5 w-5" }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 font-sans">
      {/* Loading Overlay */}
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
      
      {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm">
         <div className="container mx-auto px-4 py-4 flex justify-between items-center">
           <div className="flex items-center">
             {/* <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xl">L</div> */}
            <span className="ml-3 font-extrabold text-teal-700 text-xl tracking-tight ">
   <i>Launch</i><span className="text-orange-600 font-extrabold ">pad</span>
 </span>
           </div>
           <nav className="hidden md:flex space-x-8">
             <a href="#" className="text-teal-700 hover:text-teal-500 font-medium transition-colors">How it works</a>
             <a href="#" className="text-teal-700 hover:text-teal-500 font-medium transition-colors">Spotlight</a>
             <a href="#" className="text-teal-700 hover:text-teal-500 font-medium transition-colors">Opportunities</a>
             <a href="#" className="text-teal-700 hover:text-teal-500 font-medium transition-colors">About</a>
           </nav>
          
           {/* Header Auth Button */}
           {user && authState === 'idle' ? (
            <div className="flex items-center space-x-4">
              <span className="text-teal-700 font-medium">Hello, {user.name}!</span>
              <button 
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={user ? () => router.push('/dashboard') : handleSignIn}
              disabled={buttonState.disabled}
              className={`px-6 py-2 rounded-lg font-medium  cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center ${buttonState.className}`}
            >
              {buttonState.showSpinner && <LoadingSpinner className="h-4 w-4 mr-2" />}
              {buttonState.text}
            </button>
          )}
        </div>
      </header>

      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-40 h-40 bg-teal-200 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-64 h-64 bg-orange-200 rounded-full opacity-30 animate-pulse delay-700"></div>
        
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className={`md:w-1/2 mb-12 md:mb-0 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-5xl md:text-6xl font-bold text-teal-900 leading-tight mb-6">
              The Student Modern <span className="text-orange-500">Innovators'</span> Park
            </h1>
            <p className="text-xl text-teal-700 mb-8">
              Show your project, meet collaborators, and get funding — all in one verified place.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Main CTA Button */}
              {user && authState === 'idle' ? (
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <a 
                    href="/dashboard"
                    className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 text-center"
                  >
                    Go to Dashboard →
                  </a>
                  <button 
                    onClick={handleSignOut}
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button 
                  onClick={user ? () => router.push('/dashboard') : handleSignIn}
                  disabled={buttonState.disabled}
                  className={`px-8 py-4 rounded-lg font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center group ${buttonState.className}`}
                >
                  {buttonState.showSpinner ? (
                    <>
                      <LoadingSpinner className="h-5 w-5 mr-3" />
                      <span>{buttonState.text}</span>
                    </>
                  ) : (
                    <>
                      <span className="mr-2 group-hover:scale-110 transition-transform">
                        {buttonState.text}
                      </span>
                      {!user && authState === 'idle' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                      )}
                    </>
                  )}
                </button>
              )}
              
              <button className="border-2 border-teal-600 text-teal-700 hover:bg-teal-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
                Learn more
              </button>
            </div>
            
            {/* Status message */}
            <div className="mt-4">
              {authState === 'error' && (
                <p className="text-sm text-red-600 font-medium">Authentication failed. Please try again.</p>
              )}
              {authState === 'idle' && !user && (
                <p className="text-sm text-teal-600">Only verified university students — faster access to opportunities.</p>
              )}
            </div>
          </div>
          
          {/* Project Card Demo */}
          <div className="md:w-1/2 relative">
            <div className="relative z-10 transform transition-all duration-1000 hover:scale-105">
              <div className="bg-white p-2 rounded-2xl shadow-2xl">
                <div className="h-64 rounded-xl overflow-hidden relative">
                  {/* High-quality project image */}
                  <img 
                    src="https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                    alt="AI Project" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center p-4">
                      <h3 className="text-2xl font-bold mb-2">Attendance AI</h3>
                      <p className="text-teal-100">Low-data app that auto-fills attendance using cheap beacons</p>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">AI</div>
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    New
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-teal-200 rounded-full flex items-center justify-center font-bold text-teal-700">A</div>
                    <div className="ml-3">
                      <p className="font-medium text-teal-900">Amina O. (OAU)</p>
                      <div className="flex items-center text-sm text-teal-500">
                        <span>42 Sparks</span>
                        <span className="mx-2">•</span>
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          3 collaborators
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="bg-teal-100 text-teal-700 text-xs font-medium px-3 py-1 rounded-full">Prototype Stage</span>
                    <button className="bg-teal-100 hover:bg-teal-200 text-teal-700 text-sm px-3 py-1 rounded-lg transition-colors">
                      View Project
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-lg z-20">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-semibold">Micro-grants available</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Trust Bar */}
      {/* <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <p className="text-center text-teal-600 text-sm mb-8">Trusted by university alumni and partners</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center">
            {['Google for Startups', 'Microsoft Learn', 'Intel AI', 'AWS Educate', 'OAU Alumni Fund', 'TechCampus'].map((partner, index) => (
              <div key={index} className="h-12 w-32 bg-teal-50 rounded-lg flex items-center justify-center font-bold text-teal-700 transition-all duration-300 hover:bg-teal-100 hover:shadow-md">
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>
       */}
      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-teal-50 to-teal-100">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-teal-900 mb-4">How it works</h2>
          <p className="text-center text-teal-600 mb-16 max-w-2xl mx-auto">Getting your project noticed has never been easier. Just follow these three simple steps.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Sign in fast', desc: 'Civic Auth verifies you in one tap — no forms, no hassle.' },
              { step: '2', title: 'Showcase your work', desc: 'Create a Project Card with title, pitch, tags, and media in minutes.' },
              { step: '3', title: 'Get discovered', desc: 'Gain visibility through upvotes, Campus Spotlight, and partner shortlists.' }
            ].map((item, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-teal-700">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-teal-800 mb-4">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '150+', label: 'Active Projects' },
              { number: '₦2.5M+', label: 'Funding Distributed' },
              { number: '40+', label: 'Partner Organizations' },
              { number: '12', label: 'Universities' }
            ].map((stat, index) => (
              <div key={index} className="text-center p-6 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors">
                <p className="text-4xl font-bold text-teal-700 mb-2">{stat.number}</p>
                <p className="text-teal-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="py-20 bg-teal-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to showcase your innovation?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">Join the university innovators' stage and get discovered by partners and alumni.</p>
          
          {user && authState === 'idle' ? (
            <a 
              href="/dashboard"
              className="inline-block bg-white text-teal-700 hover:bg-teal-50 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
            >
              Go to Dashboard →
            </a>
          ) : (
            <button 
              onClick={user ? () => router.push('/dashboard') : handleSignIn}
              disabled={buttonState.disabled}
              className={`px-8 py-4 rounded-lg font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center mx-auto ${
                buttonState.className.includes('bg-teal') ? 'bg-white text-teal-700 hover:bg-teal-50' : 
                buttonState.className.includes('bg-green') ? 'bg-green-600 text-white' :
                buttonState.className.includes('bg-red') ? 'bg-red-500 text-white hover:bg-red-600' :
                'bg-gray-400 text-white cursor-wait'
              }`}
            >
              {buttonState.showSpinner && <LoadingSpinner className="h-5 w-5 mr-3" />}
              {user ? 'Go to Dashboard' : buttonState.text}
            </button>
          )}
          
          <div className="mt-4">
            {authState === 'idle' && !user && (
              <p className="text-teal-200 text-sm">Only verified university students — no forms, no waiting.</p>
            )}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-teal-900 text-teal-100 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center text-white font-bold text-xl">L</div>
                <span className="ml-3 font-semibold text-white text-xl">Launch<span className="text-orange-500">pad</span></span>
              </div>
              <p className="text-teal-300 mb-4">The premier platform for university innovators to showcase projects, find collaborators, and secure funding.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-teal-300 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-teal-300 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
                <a href="#" className="text-teal-300 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-teal-300 hover:text-white transition-colors">How it works</a></li>
                <li><a href="#" className="text-teal-300 hover:text-white transition-colors">Featured Projects</a></li>
                <li><a href="#" className="text-teal-300 hover:text-white transition-colors">Funding Opportunities</a></li>
                <li><a href="#" className="text-teal-300 hover:text-white transition-colors">Mentorship Program</a></li>
                <li><a href="#" className="text-teal-300 hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-teal-300 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-teal-300 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-teal-300 hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="text-teal-300 hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="text-teal-300 hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-teal-300 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-teal-300 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-teal-300 hover:text-white transition-colors">Partners</a></li>
                <li><a href="#" className="text-teal-300 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-teal-300 hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-teal-800 mt-12 pt-8 text-sm text-teal-400">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p>&copy; 2025 Launchpad. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-teal-400 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-teal-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-teal-400 hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}