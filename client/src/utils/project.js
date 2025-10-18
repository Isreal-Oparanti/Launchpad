
class ProjectService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  }

  // Get all projects with filters
  async getProjects({ page = 1, limit = 12, category, stage, search, sort = 'recent' } = {}) {
    const params = new URLSearchParams({
      page,
      limit,
      sort,
      ...(category && category !== 'all' && { category }),
      ...(stage && stage !== 'all' && { stage }),
      ...(search && { search })
    });

    const response = await fetch(`${this.baseURL}/projects?${params}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }

    return response.json();
  }

  // Get featured projects
  async getFeaturedProjects() {
    const response = await fetch(`${this.baseURL}/projects/featured`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch featured projects');
    }

    return response.json();
  }

  // Get trending projects
  async getTrendingProjects() {
    const response = await fetch(`${this.baseURL}/projects/trending`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch trending projects');
    }

    return response.json();
  }

  // Get single project
  async getProject(projectId) {
    const response = await fetch(`${this.baseURL}/projects/${projectId}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Project not found');
      }
      throw new Error('Failed to fetch project');
    }

    return response.json();
  }

  // Create project
  async createProject(projectData) {
    const response = await fetch(`${this.baseURL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(projectData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create project');
    }

    return data;
  }

  // Update project
  async updateProject(projectId, updates) {
    const response = await fetch(`${this.baseURL}/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(updates)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update project');
    }

    return data;
  }

  // Delete project
  async deleteProject(projectId) {
    const response = await fetch(`${this.baseURL}/projects/${projectId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete project');
    }

    return data;
  }

  // Toggle upvote
  async toggleUpvote(projectId) {
    const response = await fetch(`${this.baseURL}/projects/${projectId}/upvote`, {
      method: 'POST',
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to process upvote');
    }

    return data;
  }

  // Express interest
  async expressInterest(projectId, message = '') {
    const response = await fetch(`${this.baseURL}/projects/${projectId}/interest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to express interest');
    }

    return data;
  }

  // Get comments
  async getComments(projectId, page = 1, limit = 20) {
    const response = await fetch(
      `${this.baseURL}/projects/${projectId}/comments?page=${page}&limit=${limit}`,
      { credentials: 'include' }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }

    return response.json();
  }

  // Add comment
  async addComment(projectId, content, isAnonymous = false) {
    const response = await fetch(`${this.baseURL}/projects/${projectId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ content, isAnonymous })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add comment');
    }

    return data;
  }

  // Delete comment
  async deleteComment(projectId, commentId) {
    const response = await fetch(
      `${this.baseURL}/projects/${projectId}/comments/${commentId}`,
      {
        method: 'DELETE',
        credentials: 'include'
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete comment');
    }

    return data;
  }

  // Toggle comment like
  async toggleCommentLike(projectId, commentId) {
    const response = await fetch(
      `${this.baseURL}/projects/${projectId}/comments/${commentId}/like`,
      {
        method: 'POST',
        credentials: 'include'
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to process like');
    }

    return data;
  }

  // Get user's projects
  async getMyProjects() {
    const response = await fetch(`${this.baseURL}/users/me/projects`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch your projects');
    }

    return response.json();
  }
}

export const projectService = new ProjectService();
export default projectService;