'use client';

import { useState } from 'react';
import { useUser } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

// Mock data for opportunities
const mockOpportunities = [
  {
    id: 1,
    title: "Alumni Micro-Grant Program",
    provider: "OAU Alumni Association",
    type: "Grant",
    amount: "₦50,000",
    deadline: "2025-09-10",
    description: "Funding for innovative student projects with potential for real-world impact",
    eligibility: "All OAU students with a viable project idea",
    tags: ["Funding", "Grant", "All Students"],
    applications: 42,
    created: "2025-01-15"
  },
  {
    id: 2,
    title: "Google for Startups Fellowship",
    provider: "Google",
    type: "Fellowship",
    amount: "₦200,000 + Mentorship",
    deadline: "2025-08-25",
    description: "8-week intensive program for student entrepreneurs building tech solutions",
    eligibility: "Tech-focused projects, prototype stage or beyond",
    tags: ["Tech", "Mentorship", "Development"],
    applications: 89,
    created: "2025-02-10"
  },
  {
    id: 3,
    title: "Sustainability Innovation Challenge",
    provider: "Green Africa Foundation",
    type: "Competition",
    amount: "₦100,000",
    deadline: "2025-07-15",
    description: "Annual competition for projects addressing environmental sustainability",
    eligibility: "Projects focused on environmental solutions",
    tags: ["Sustainability", "Competition", "Environment"],
    applications: 57,
    created: "2025-01-28"
  },
  {
    id: 4,
    title: "Microsoft Learn Student Ambassador",
    provider: "Microsoft",
    type: "Ambassador Program",
    amount: "Stipend + Resources",
    deadline: "2025-06-30",
    description: "Become a Microsoft student ambassador and gain access to resources, training, and networking",
    eligibility: "Passionate students interested in technology",
    tags: ["Tech", "Leadership", "Networking"],
    applications: 124,
    created: "2024-12-05"
  },
  {
    id: 5,
    title: "AI Research Internship",
    provider: "DataSphere Analytics",
    type: "Internship",
    amount: "₦75,000/month",
    deadline: "2025-08-05",
    description: "3-month internship for students interested in machine learning and AI applications",
    eligibility: "Computer Science, Engineering, or related fields",
    tags: ["AI", "Internship", "Paid"],
    applications: 76,
    created: "2025-02-18"
  },
  {
    id: 6,
    title: "Women in Tech Scholarship",
    provider: "Tech4Her Initiative",
    type: "Scholarship",
    amount: "₦150,000",
    deadline: "2025-10-01",
    description: "Scholarship and mentorship program for female students in technology fields",
    eligibility: "Female students in STEM programs",
    tags: ["Scholarship", "Women", "STEM"],
    applications: 63,
    created: "2025-02-22"
  }
];

export default function OpportunitiesPage() {
  const { user, loading, logout } = useUser();
  const router = useRouter();
  const [opportunities, setOpportunities] = useState(mockOpportunities);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('deadline');
  const [appliedOpportunities, setAppliedOpportunities] = useState(new Set());
  const [activeTab, setActiveTab] = useState('opportunities');
  
  // Handle application
  const handleApply = (opportunityId) => {
    setAppliedOpportunities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(opportunityId)) {
        newSet.delete(opportunityId);
      } else {
        newSet.add(opportunityId);
      }
      return newSet;
    });
  };

  // Calculate days until deadline
  const daysUntilDeadline = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filter and sort opportunities
  const filteredOpportunities = opportunities
    .filter(opportunity => {
      if (filter === 'all') return true;
      return opportunity.type.toLowerCase() === filter;
    })
    .filter(opportunity => {
      if (!searchQuery) return true;
      return (
        opportunity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opportunity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opportunity.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') return new Date(a.deadline) - new Date(b.deadline);
      if (sortBy === 'popular') return b.applications - a.applications;
      if (sortBy === 'recent') return new Date(b.created) - new Date(a.created);
      return a.title.localeCompare(b.title);
    });

  // Check if user is authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect due to useEffect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white font-sans">
     <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="md:ml-64  md:pt-0">
            <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-teal-900 mb-2">Opportunities</h1>
            <p className="text-teal-600">Find grants, internships, and programs to support your projects</p>
          </div>
          {/* <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold mt-4 md:mt-0 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Suggest an Opportunity
          </button> */}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-teal-100 text-center">
            <div className="text-2xl font-bold text-teal-700 mb-1">{opportunities.length}</div>
            <div className="text-sm text-teal-600">Total Opportunities</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-teal-100 text-center">
            <div className="text-2xl font-bold text-orange-500 mb-1">
              {opportunities.filter(opp => daysUntilDeadline(opp.deadline) <= 7).length}
            </div>
            <div className="text-sm text-teal-600">Ending This Week</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-teal-100 text-center">
            <div className="text-2xl font-bold text-teal-700 mb-1">
              {opportunities.filter(opp => opp.type === 'Grant').length}
            </div>
            <div className="text-sm text-teal-600">Grants Available</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-teal-100 text-center">
            <div className="text-2xl font-bold text-teal-700 mb-1">{appliedOpportunities.size}</div>
            <div className="text-sm text-teal-600">Applications Submitted</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-teal-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search opportunities..."
                className="pl-10 w-full p-3 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter by type */}
            <select 
              className="p-3 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="grant">Grants</option>
              <option value="internship">Internships</option>
              <option value="competition">Competitions</option>
              <option value="fellowship">Fellowships</option>
              <option value="scholarship">Scholarships</option>
            </select>

            {/* Sort by */}
            <select 
              className="p-3 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="deadline">Deadline (Soonest)</option>
              <option value="popular">Most Popular</option>
              <option value="recent">Recently Added</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Opportunities Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filteredOpportunities.map((opportunity) => {
            const daysLeft = daysUntilDeadline(opportunity.deadline);
            const isApplied = appliedOpportunities.has(opportunity.id);
            
            return (
              <div key={opportunity.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-teal-100 hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    {/* Left side - Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-teal-900 mb-1">{opportunity.title}</h3>
                          <p className="text-teal-600 font-medium">{opportunity.provider}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          opportunity.type === 'grant' ? 'bg-teal-100 text-teal-700' :
                          opportunity.type === 'internship' ? 'bg-blue-100 text-blue-700' :
                          opportunity.type === 'competition' ? 'bg-orange-100 text-orange-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {opportunity.type}
                        </span>
                      </div>

                      <p className="text-teal-700 mb-4">{opportunity.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {opportunity.tags.map((tag) => (
                          <span key={tag} className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Eligibility */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-teal-900 mb-1">Eligibility:</p>
                        <p className="text-sm text-teal-600">{opportunity.eligibility}</p>
                      </div>
                    </div>

                    {/* Right side - Action */}
                    <div className="md:w-48 md:pl-6 md:border-l md:border-teal-100 mt-4 md:mt-0">
                      <div className="bg-teal-50 p-4 rounded-lg mb-4">
                        <div className="text-lg font-bold text-teal-900 mb-1">{opportunity.amount}</div>
                        <div className="flex items-center text-sm text-teal-600 mb-3">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {opportunity.applications} applications
                        </div>
                        
                        <div className={`text-sm font-medium ${
                          daysLeft < 7 ? 'text-orange-500' : 'text-teal-600'
                        }`}>
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                        </div>
                        <div className="text-xs text-teal-500">
                          Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                        </div>
                      </div>

                      <button 
                        onClick={() => handleApply(opportunity.id)}
                        disabled={daysLeft <= 0}
                        className={`w-full py-3 rounded-lg font-semibold transition-all ${
                          isApplied 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : daysLeft <= 0
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-teal-600 text-white hover:bg-teal-700'
                        }`}
                      >
                        {isApplied ? 'Applied ✓' : daysLeft <= 0 ? 'Closed' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredOpportunities.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-teal-900">No opportunities found</h3>
            <p className="mt-1 text-teal-600">Try adjusting your search or filter to find what you're looking for.</p>
            <div className="mt-6">
              <button 
                onClick={() => {
                  setFilter('all');
                  setSearchQuery('');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
