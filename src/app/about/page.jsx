'use client';
import { useState } from 'react';
import { useUser } from '@civic/auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function ProjectDetails() {
  const { user } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0">
        {/* <Header /> */}
        <div className="container mx-auto px-4 py-8">
          {/* Project Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-2xl shadow-lg p-8 mb-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Launchpad</h1>
                <p className="text-teal-100 text-lg">The Student Innovators' Park</p>
                <div className="flex items-center mt-4">
                  <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium">Hackathon Project</span>
                  <span className="ml-3 bg-teal-500 text-white text-xs px-3 py-1 rounded-full font-medium">Civic Auth Integrated</span>
                </div>
              </div>
              <div className="mt-6 md:mt-0">
                <div className="flex items-center space-x-4">
                    <h4 className='font-bold'>Our 3 month Goal:</h4>
                  <div className="text-center">
                    
                    <div className="text-2xl font-bold">150+</div>
                    <div className="text-sm text-teal-200">Active Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-sm text-teal-200">Universities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">40+</div>
                    <div className="text-sm text-teal-200">Partners</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs Navigation */}
          <div className="flex border-b border-teal-200 mb-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-teal-500 hover:text-teal-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'features'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-teal-500 hover:text-teal-700'
              }`}
            >
              Key Features
            </button>
            <button
              onClick={() => setActiveTab('strategy')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'strategy'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-teal-500 hover:text-teal-700'
              }`}
            >
              Hackathon Strategy
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'roadmap'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-teal-500 hover:text-teal-700'
              }`}
            >
              Roadmap
            </button>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-teal-100">
                <h2 className="text-2xl font-bold text-teal-900 mb-6">Project Overview</h2>
                <p className="text-teal-700 mb-6">
                  Launchpad is a premier platform for university innovators to showcase projects, find collaborators, and secure funding. 
                  We're building a vibrant ecosystem where student creativity meets opportunity, all powered by secure, seamless authentication 
                  through Civic Auth.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-teal-50 p-6 rounded-xl">
                    <h3 className="font-semibold text-teal-900 mb-3">Problem Statement</h3>
                    <p className="text-teal-700">
                      University students across Africa create innovative projects but struggle to gain visibility, find collaborators, 
                      and access funding opportunities. Existing platforms are fragmented, unverified, and don't cater specifically to 
                      the academic innovation ecosystem.
                    </p>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-xl">
                    <h3 className="font-semibold text-teal-900 mb-3">Our Solution</h3>
                    <p className="text-teal-700">
                      Launchpad provides a unified, verified platform where student innovators can showcase their projects, 
                      connect with potential collaborators, and discover funding opportunities - all secured through Civic Auth's 
                      university-verified identity system.
                    </p>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-teal-900 mb-4">3 month Goal Impact Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-teal-200 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-teal-700 mb-1">150+</div>
                    <div className="text-sm text-teal-600">Active Projects</div>
                  </div>
                  <div className="bg-white border border-teal-200 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-teal-700 mb-1">₦2.5M+</div>
                    <div className="text-sm text-teal-600">Funding Distributed</div>
                  </div>
                  <div className="bg-white border border-teal-200 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-teal-700 mb-1">40+</div>
                    <div className="text-sm text-teal-600">Partner Organizations</div>
                  </div>
                  <div className="bg-white border border-teal-200 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-teal-700 mb-1">12</div>
                    <div className="text-sm text-teal-600">Universities</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-teal-100">
                <h2 className="text-2xl font-bold text-teal-900 mb-6">Technology Stack</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "Next.js", icon: "⚛️" },
                    { name: "React", icon: "⚛️" },
                    { name: "Tailwind CSS", icon: "🎨" },
                    { name: "Civic Auth", icon: "🔐" },
                    { name: "Node.js", icon: "🟢" },
                    { name: "MongoDB", icon: "🍃" },
                    { name: "Vercel", icon: "▲" },
                    { name: "AWS", icon: "☁️" }
                  ].map((tech, index) => (
                    <div key={index} className="bg-teal-50 rounded-lg p-4 text-center">
                      <div className="text-2xl mb-2">{tech.icon}</div>
                      <div className="text-sm font-medium text-teal-700">{tech.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'features' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-teal-100">
              <h2 className="text-2xl font-bold text-teal-900 mb-6">Key Features</h2>
              
              <div className="space-y-8">
                {[
                  {
                    title: "Unified Student Identity",
                    description: "Combine all your academic profiles, projects, and achievements into one verified digital identity powered by Civic Auth.",
                    icon: "🎓",
                    benefits: ["Verified university status", "Single profile across all projects", "Academic credentials showcase"]
                  },
                  {
                    title: "Project Showcase",
                    description: "Create beautiful project cards with images, descriptions, tags, and progress tracking to highlight your innovations.",
                    icon: "🚀",
                    benefits: ["Rich media support", "Progress tracking", "Collaborator attribution"]
                  },
                  {
                    title: "Collaboration Hub",
                    description: "Find and connect with potential collaborators based on skills, interests, and project needs.",
                    icon: "🤝",
                    benefits: ["Skill-based matching", "Team formation tools", "Project requests"]
                  },
                  {
                    title: "Opportunity Discovery",
                    description: "Access curated funding opportunities, competitions, and programs specifically for university innovators.",
                    icon: "💰",
                    benefits: ["Micro-grants", "Hackathons", "Incubator programs"]
                  },
                  {
                    title: "Instant Updates",
                    description: "Update your project details anytime and your profile stays current across the entire platform.",
                    icon: "🔄",
                    benefits: ["Real-time syncing", "Version history", "Change notifications"]
                  },
                  {
                    title: "Mobile-First Design",
                    description: "Full functionality on all devices with a responsive design optimized for mobile collaboration.",
                    icon: "📱",
                    benefits: ["Bottom navigation", "Touch-friendly interface", "Offline capabilities"]
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center text-2xl">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-teal-900 mb-2">{feature.title}</h3>
                      <p className="text-teal-700 mb-4">{feature.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {feature.benefits.map((benefit, idx) => (
                          <span key={idx} className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 bg-gradient-to-r from-teal-50 to-orange-50 rounded-xl p-6 border border-teal-200">
                <h3 className="text-xl font-semibold text-teal-900 mb-4">Why Choose Launchpad?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-teal-900 mb-2">Professional First Impression</h4>
                    <p className="text-teal-700 text-sm">Present a clean, modern, and trustworthy digital identity to potential collaborators and funders.</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-teal-900 mb-2">All-in-One Solution</h4>
                    <p className="text-teal-700 text-sm">Replace multiple platforms with one unified ecosystem for project showcase and collaboration.</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-teal-900 mb-2">Time-Saving</h4>
                    <p className="text-teal-700 text-sm">No need to update every platform - edit once and share your profile across the entire network.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'strategy' && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-teal-100">
                <h2 className="text-2xl font-bold text-teal-900 mb-6">Hackathon Strategy</h2>
                
                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-teal-50 to-orange-50 rounded-xl p-6 border border-teal-200">
                    <h3 className="text-xl font-semibold text-teal-900 mb-4 flex items-center">
                      <span className="mr-2">🎯</span> Civic Auth Integration - Our Hero Feature
                    </h3>
                    <p className="text-teal-700 mb-4">
                      We're making Civic Auth the star of our application. The integration is seamless, secure, and provides immediate 
                      value by verifying student identities across the entire platform.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-teal-900 mb-2">Seamless UX</h4>
                        <p className="text-teal-700 text-sm">One-tap authentication with instant profile creation and university verification.</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-teal-900 mb-2">Trust & Security</h4>
                        <p className="text-teal-700 text-sm">Verified identities create a trusted environment for collaboration and funding.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-teal-50 to-orange-50 rounded-xl p-6 border border-teal-200">
                    <h3 className="text-xl font-semibold text-teal-900 mb-4 flex items-center">
                      <span className="mr-2">🚀</span> Go-to-Market Readiness
                    </h3>
                    <p className="text-teal-700 mb-4">
                      Launchpad is designed for immediate deployment with a clear path to user acquisition and monetization.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-teal-900 mb-2">Target Audience</h4>
                        <p className="text-teal-700 text-sm">University students, innovation hubs, and corporate partners across Africa.</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-teal-900 mb-2">Launch Plan</h4>
                        <p className="text-teal-700 text-sm">Pilot at 3 leading universities, then expand to 12+ institutions across Nigeria.</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-teal-900 mb-2">Growth Strategy</h4>
                        <p className="text-teal-700 text-sm">Viral loops through project sharing and university ambassador programs.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-teal-50 to-orange-50 rounded-xl p-6 border border-teal-200">
                    <h3 className="text-xl font-semibold text-teal-900 mb-4 flex items-center">
                      <span className="mr-2">🏆</span> Winning the Hackathon
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold mr-3">1</div>
                        <div>
                          <h4 className="font-semibold text-teal-900">Quality Integration (40%)</h4>
                          <p className="text-teal-700 text-sm">Our Civic Auth implementation is flawless with mobile responsiveness, error handling, and a polished UX that exceeds expectations.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold mr-3">2</div>
                        <div>
                          <h4 className="font-semibold text-teal-900">Go-to-Market Readiness (30%)</h4>
                          <p className="text-teal-700 text-sm">Launchpad solves a real problem with a clear path to user acquisition and revenue generation through premium features.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold mr-3">3</div>
                        <div>
                          <h4 className="font-semibold text-teal-900">Use Case (15%)</h4>
                          <p className="text-teal-700 text-sm">We're combining student innovation, collaboration, and funding - a unique use case that showcases Civic Auth's versatility.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold mr-3">4</div>
                        <div>
                          <h4 className="font-semibold text-teal-900">Presentation (15%)</h4>
                          <p className="text-teal-700 text-sm">Our demo highlights Civic Auth integration first, with a clean UI and clear value proposition in under 2 minutes.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                    <h3 className="text-xl font-semibold text-teal-900 mb-4 flex items-center">
                      <span className="mr-2">🎁</span> Secret Prize Strategy
                    </h3>
                    <p className="text-teal-700 mb-4">
                      We're targeting the MAU (Monthly Active Users) bonus prize by launching immediately after the hackathon 
                      with a focused growth strategy:
                    </p>
                    <ul className="list-disc pl-5 text-teal-700 space-y-2">
                      <li>University ambassador program at 3 pilot institutions</li>
                      <li>Viral sharing features for project showcases</li>
                      <li>Incentives for completing profiles and verifying with Civic Auth</li>
                      <li>Partnerships with innovation hubs and student organizations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'roadmap' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-teal-100">
              <h2 className="text-2xl font-bold text-teal-900 mb-6">Future Roadmap</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-teal-900 mb-4 flex items-center">
                    <span className="bg-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">Q3</span>
                    2025 - Foundation Phase
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Complete MVP with core features",
                      "Launch at 3 pilot universities",
                      "Secure first 500 active users",
                      "Establish 10+ funding partnerships",
                      "Implement basic analytics dashboard",
                      "Mobile app development (React Native)"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 mr-3 mt-0.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-teal-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-teal-900 mb-4 flex items-center">
                    <span className="bg-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">Q4</span>
                    2025 - Expansion Phase
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Expand to 12+ universities across Nigeria",
                      "Launch premium features for institutions",
                      "Implement AI-powered project matching",
                      "Host first virtual demo day",
                      "Introduce micro-grant distribution system",
                      "Develop collaboration tools integration"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 mr-3 mt-0.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-teal-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-teal-900 mb-4 flex items-center">
                    <span className="bg-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">Q1</span>
                    2026 - Growth Phase
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Pan-African expansion to 5+ countries",
                      "Launch institutional dashboard",
                      "Implement project incubation program",
                      "Secure Series A funding round",
                      "Develop advanced analytics and insights",
                      "Create innovation challenge platform"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 mr-3 mt-0.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-teal-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-teal-50 to-orange-50 rounded-xl p-6 border border-teal-200">
                  <h3 className="text-xl font-semibold text-teal-900 mb-4">Long-term Vision</h3>
                  <p className="text-teal-700 mb-4">
                    By 2027, Launchpad aims to become the leading platform for student innovation across Africa, 
                    connecting over 100,000 students with opportunities and funding to turn their ideas into reality.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                      <div className="text-2xl font-bold text-teal-700 mb-1">100K+</div>
                      <div className="text-sm text-teal-600">Active Students</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                      <div className="text-2xl font-bold text-teal-700 mb-1">50+</div>
                      <div className="text-sm text-teal-600">University Partners</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                      <div className="text-2xl font-bold text-teal-700 mb-1">$10M+</div>
                      <div className="text-sm text-teal-600">Funding Distributed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Call to Action */}
          <div className="mt-8 bg-gradient-to-r from-teal-600 to-orange-500 rounded-2xl shadow-lg p-8 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Join the Innovation Revolution?</h2>
            <p className="text-teal-100 mb-6 max-w-2xl mx-auto">
              Be part of Africa's largest student innovation platform. Showcase your projects, find collaborators, and access funding opportunities.
            </p>
            <button 
              onClick={() => router.push('/')}
              className="bg-white text-teal-700 hover:bg-teal-50 px-8 py-3 rounded-lg font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
            >
              Get Started with Civic Auth
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}