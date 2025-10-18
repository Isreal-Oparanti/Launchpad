"use client";
import { createContext, useContext, useState } from 'react';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [myProjects, setMyProjects] = useState([]);
  const [cachedProjects, setCachedProjects] = useState({});

  const cacheProject = (project) => {
    setCachedProjects(prev => ({
      ...prev,
      [project._id]: project
    }));
  };

  const getCachedProject = (projectId) => {
    return cachedProjects[projectId];
  };

  const updateProjectInCache = (projectId, updates) => {
    setCachedProjects(prev => ({
      ...prev,
      [projectId]: { ...prev[projectId], ...updates }
    }));
  };

  return (
    <ProjectContext.Provider value={{
      myProjects,
      setMyProjects,
      cacheProject,
      getCachedProject,
      updateProjectInCache
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within ProjectProvider');
  }
  return context;
};