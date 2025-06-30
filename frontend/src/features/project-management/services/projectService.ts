import { 
  Project, 
  Label, 
  CreateProjectRequest, 
  UpdateProjectRequest, 
  CreateLabelRequest, 
  UpdateLabelRequest,
  ProjectsResponse,
  ProjectResponse,
  LabelsResponse,
  LabelResponse,
  ProjectsParams,
  LabelsParams
} from '../types/project.types';

class ProjectService {
  private getHeaders(token: string) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Project operations
  async getProjects(token: string, params?: ProjectsParams): Promise<{ success: boolean; data?: ProjectsResponse['data']; error?: string }> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.search) searchParams.append('search', params.search);

      const response = await fetch(`/api/projects?${searchParams}`, {
        headers: this.getHeaders(token)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || 'Failed to fetch projects' };
      }
    } catch (error) {
      console.error('Get projects error:', error);
      return { success: false, error: 'Connection error' };
    }
  }

  async getProject(token: string, projectId: string): Promise<{ success: boolean; data?: Project; error?: string }> {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: this.getHeaders(token)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || 'Failed to fetch project' };
      }
    } catch (error) {
      console.error('Get project error:', error);
      return { success: false, error: 'Connection error' };
    }
  }

  async createProject(token: string, projectData: CreateProjectRequest): Promise<{ success: boolean; data?: Project; error?: string }> {
    try {
      const response = await fetch(`/api/projects`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify(projectData)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || 'Failed to create project' };
      }
    } catch (error) {
      console.error('Create project error:', error);
      return { success: false, error: 'Connection error' };
    }
  }

  async updateProject(token: string, projectId: string, projectData: UpdateProjectRequest): Promise<{ success: boolean; data?: Project; error?: string }> {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: this.getHeaders(token),
        body: JSON.stringify(projectData)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || 'Failed to update project' };
      }
    } catch (error) {
      console.error('Update project error:', error);
      return { success: false, error: 'Connection error' };
    }
  }

  async deleteProject(token: string, projectId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: this.getHeaders(token)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Failed to delete project' };
      }
    } catch (error) {
      console.error('Delete project error:', error);
      return { success: false, error: 'Connection error' };
    }
  }

  // Label operations
  async getProjectLabels(token: string, projectId: string, params?: LabelsParams): Promise<{ success: boolean; data?: Label[]; error?: string }> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
      if (params?.status) searchParams.append('status', params.status);
      if (params?.search) searchParams.append('search', params.search);

      const response = await fetch(`/api/projects/${projectId}/labels?${searchParams}`, {
        headers: this.getHeaders(token)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || 'Failed to fetch labels' };
      }
    } catch (error) {
      console.error('Get project labels error:', error);
      return { success: false, error: 'Connection error' };
    }
  }

  async getLabel(token: string, labelId: string): Promise<{ success: boolean; data?: Label; error?: string }> {
    try {
      const response = await fetch(`/api/projects/labels/${labelId}`, {
        headers: this.getHeaders(token)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || 'Failed to fetch label' };
      }
    } catch (error) {
      console.error('Get label error:', error);
      return { success: false, error: 'Connection error' };
    }
  }

  async createLabel(token: string, projectId: string, labelData: CreateLabelRequest): Promise<{ success: boolean; data?: Label; error?: string }> {
    try {
      const response = await fetch(`/api/projects/${projectId}/labels`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify(labelData)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || 'Failed to create label' };
      }
    } catch (error) {
      console.error('Create label error:', error);
      return { success: false, error: 'Connection error' };
    }
  }

  async updateLabel(token: string, labelId: string, labelData: UpdateLabelRequest): Promise<{ success: boolean; data?: Label; error?: string }> {
    try {
      const response = await fetch(`/api/projects/labels/${labelId}`, {
        method: 'PUT',
        headers: this.getHeaders(token),
        body: JSON.stringify(labelData)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || 'Failed to update label' };
      }
    } catch (error) {
      console.error('Update label error:', error);
      return { success: false, error: 'Connection error' };
    }
  }

  async deleteLabel(token: string, labelId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/projects/labels/${labelId}`, {
        method: 'DELETE',
        headers: this.getHeaders(token)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Failed to delete label' };
      }
    } catch (error) {
      console.error('Delete label error:', error);
      return { success: false, error: 'Connection error' };
    }
  }

  async duplicateLabel(token: string, labelId: string): Promise<{ success: boolean; data?: Label; error?: string }> {
    try {
      const response = await fetch(`/api/projects/labels/${labelId}/duplicate`, {
        method: 'POST',
        headers: this.getHeaders(token)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || 'Failed to duplicate label' };
      }
    } catch (error) {
      console.error('Duplicate label error:', error);
      return { success: false, error: 'Connection error' };
    }
  }
}

export const projectService = new ProjectService();
