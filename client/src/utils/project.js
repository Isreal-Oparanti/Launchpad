'use client';

class ProjectService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  }

  // =============== IMAGE URL HELPERS ===============
  getLogoUrl(projectId) {
    return `${this.baseURL}/projects/${projectId}/logo`;
  }

  getCoverImageUrl(projectId) {
    return `${this.baseURL}/projects/${projectId}/cover`;
  }

  // =============== PROJECT CRUD ===============
  async getProjects({ page = 1, limit = 12, category = 'all', stage = 'all', search = '', sort = 'recent' } = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
    });

    if (category && category !== 'all') params.append('category', category);
    if (stage && stage !== 'all') params.append('stage', stage);
    if (search) params.append('search', search);

    const response = await fetch(`${this.baseURL}/projects?${params}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }

    return response.json();
  }

  async getFeaturedProjects() {
    const response = await fetch(`${this.baseURL}/projects/featured`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch featured projects');
    }

    return response.json();
  }

  async getTrendingProjects() {
    const response = await fetch(`${this.baseURL}/projects/trending`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch trending projects');
    }

    return response.json();
  }

  async getProject(projectId) {
    const response = await fetch(`${this.baseURL}/projects/${projectId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Project not found');
      }
      throw new Error('Failed to fetch project');
    }

    return response.json();
  }

  async createProject(formData) {
    try {
      console.log('📤 Creating project...');
      
      // Log FormData for debugging
      for (let pair of formData.entries()) {
        if (pair[0] === 'logo' || pair[0] === 'coverImage') {
          console.log(`${pair[0]}:`, pair[1].name, pair[1].type, `${pair[1].size} bytes`);
        } else {
          console.log(`${pair[0]}:`, pair[1]);
        }
      }

      const response = await fetch(`${this.baseURL}/projects/create`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
        // No Content-Type header - let browser set it with boundary
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ Server error:', data);
        throw new Error(data.message || 'Failed to create project');
      }

      console.log('✅ Project created:', data);
      return data;
    } catch (error) {
      console.error('❌ Create project error:', error);
      throw error;
    }
  }

  async updateProject(projectId, formData) {
    try {
      console.log('📤 Updating project:', projectId);
      
      const response = await fetch(`${this.baseURL}/projects/${projectId}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
        // No Content-Type header - let browser set it with boundary
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Server error:', data);
        throw new Error(data.message || 'Failed to update project');
      }

      console.log('✅ Project updated:', data);
      return data;
    } catch (error) {
      console.error('❌ Update project error:', error);
      throw error;
    }
  }

  async deleteProject(projectId) {
    const response = await fetch(`${this.baseURL}/projects/${projectId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Server error:', data);
      throw new Error(data.message || 'Failed to delete project');
    }

    console.log('✅ Project deleted:', data);
    return data;
  }

  // =============== INTERACTIONS ===============
  async toggleUpvote(projectId) {
    const response = await fetch(`${this.baseURL}/projects/${projectId}/upvote`, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Server error:', data);
      throw new Error(data.message || 'Failed to process upvote');
    }

    return data;
  }

  async expressInterest(projectId, message = '') {
    const response = await fetch(`${this.baseURL}/projects/${projectId}/interest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Server error:', data);
      throw new Error(data.message || 'Failed to express interest');
    }

    return data;
  }

  // =============== COMMENTS ===============
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

  async addComment(projectId, content, isAnonymous = false) {
    const response = await fetch(`${this.baseURL}/projects/${projectId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ content, isAnonymous }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Server error:', data);
      throw new Error(data.message || 'Failed to add comment');
    }

    return data;
  }

  async deleteComment(projectId, commentId) {
    const response = await fetch(
      `${this.baseURL}/projects/${projectId}/comments/${commentId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Server error:', data);
      throw new Error(data.message || 'Failed to delete comment');
    }

    return data;
  }

  async toggleCommentLike(projectId, commentId) {
    const response = await fetch(
      `${this.baseURL}/projects/${projectId}/comments/${commentId}/like`,
      {
        method: 'POST',
        credentials: 'include',
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Server error:', data);
      throw new Error(data.message || 'Failed to process like');
    }

    return data;
  }

  // =============== USER PROJECTS ===============
  async getMyProjects() {
    const response = await fetch(`${this.baseURL}/projects/my-projects`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch your projects');
    }

    return response.json();
  }

  // =============== MATCHES ===============
  async getProjectMatches(projectId) {
    const response = await fetch(`${this.baseURL}/matches/${projectId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch matches');
    }

    return response.json();
  }
}

// Create singleton instance
export const projectService = new ProjectService();
export default projectService;