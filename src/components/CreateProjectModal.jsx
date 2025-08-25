// src/components/CreateProjectModal.jsx
'use client';

import { useState } from 'react';

export default function CreateProjectModal({ isOpen, onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    tags: [],
    stage: 'idea',
    repository: '',
    demo: ''
  });
  const [currentTag, setCurrentTag] = useState('');

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (currentTag.trim() && !projectData.tags.includes(currentTag.trim())) {
      setProjectData({
        ...projectData,
        tags: [...projectData.tags, currentTag.trim()]
      });
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setProjectData({
      ...projectData,
      tags: projectData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = () => {
    if (projectData.title && projectData.description) {
      onSubmit(projectData);
      setStep(1);
      setProjectData({
        title: '',
        description: '',
        tags: [],
        stage: 'idea',
        repository: '',
        demo: ''
      });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-teal-100">
          <h2 className="text-xl font-bold text-teal-900">
            {step === 1 ? 'Project Basics' : step === 2 ? 'Add Details' : 'Review & Create'}
          </h2>
          <button onClick={onClose} className="text-teal-500 hover:text-teal-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 pt-4">
          <div className="flex justify-between mb-6">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === stepNum 
                    ? 'bg-teal-600 text-white' 
                    : step > stepNum 
                      ? 'bg-teal-100 text-teal-600' 
                      : 'bg-teal-100 text-teal-400'
                }`}>
                  {step > stepNum ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
                <span className="text-xs mt-1 text-teal-600">
                  {stepNum === 1 ? 'Basic' : stepNum === 2 ? 'Details' : 'Review'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-teal-700 mb-1">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g., Attendance AI"
                  className="w-full p-3 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={projectData.title}
                  onChange={(e) => setProjectData({...projectData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-teal-700 mb-1">Description</label>
                <textarea
                  placeholder="Describe your project in 1-2 sentences..."
                  className="w-full p-3 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent h-24"
                  value={projectData.description}
                  onChange={(e) => setProjectData({...projectData, description: e.target.value})}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-teal-700 mb-1">Project Stage</label>
                <select
                  className="w-full p-3 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={projectData.stage}
                  onChange={(e) => setProjectData({...projectData, stage: e.target.value})}
                >
                  <option value="idea">Idea</option>
                  <option value="prototype">Prototype</option>
                  <option value="development">Development</option>
                  <option value="launched">Launched</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-teal-700 mb-1">Tags</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add a tag (e.g., AI, Web App)"
                    className="flex-1 p-3 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <button 
                    onClick={handleAddTag}
                    className="bg-teal-600 text-white px-4 py-3 rounded-lg"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {projectData.tags.map((tag) => (
                    <span key={tag} className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded flex items-center">
                      #{tag}
                      <button 
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-teal-500 hover:text-teal-700"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-teal-700 mb-1">GitHub Repository (Optional)</label>
                <input
                  type="url"
                  placeholder="https://github.com/username/project"
                  className="w-full p-3 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={projectData.repository}
                  onChange={(e) => setProjectData({...projectData, repository: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-teal-700 mb-1">Live Demo (Optional)</label>
                <input
                  type="url"
                  placeholder="https://your-project-demo.com"
                  className="w-full p-3 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={projectData.demo}
                  onChange={(e) => setProjectData({...projectData, demo: e.target.value})}
                />
              </div>
              <div className="bg-teal-50 p-4 rounded-lg">
                <h3 className="font-medium text-teal-800 mb-2">Project Preview</h3>
                <p className="text-teal-700"><strong>Title:</strong> {projectData.title || 'Not set'}</p>
                <p className="text-teal-700"><strong>Description:</strong> {projectData.description || 'Not set'}</p>
                <p className="text-teal-700"><strong>Stage:</strong> {projectData.stage}</p>
                <p className="text-teal-700"><strong>Tags:</strong> {projectData.tags.join(', ') || 'None'}</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button 
                onClick={() => setStep(step - 1)}
                className="text-teal-600 hover:text-teal-700 px-4 py-2 rounded-lg"
              >
                Back
              </button>
            ) : (
              <button 
                onClick={onClose}
                className="text-teal-600 hover:text-teal-700 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            )}
            
            {step < 3 ? (
              <button 
                onClick={() => setStep(step + 1)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg"
                disabled={!projectData.title || !projectData.description}
              >
                Next
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg"
              >
                Create Project
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}