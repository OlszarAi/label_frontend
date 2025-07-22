export interface Project {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  labels?: Label[];
  _count?: {
    labels: number;
  };
}

export interface Label {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  fabricData?: any; // Fabric.js canvas JSON data
  thumbnail?: string; // Base64 or URL to label thumbnail
  width: number; // Label width in mm
  height: number; // Label height in mm
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface CreateLabelRequest {
  name: string;
  description?: string;
  width?: number;
  height?: number;
  fabricData?: any;
  thumbnail?: string;
}

export interface UpdateLabelRequest {
  name?: string;
  description?: string;
  width?: number;
  height?: number;
  fabricData?: any;
  thumbnail?: string;
  version?: number;
}

export interface ProjectsResponse {
  success: boolean;
  data: {
    projects: Project[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ProjectResponse {
  success: boolean;
  data: Project;
}

export interface LabelsResponse {
  success: boolean;
  data: Label[];
}

export interface LabelResponse {
  success: boolean;
  data: Label;
}

export interface ProjectsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface LabelsParams {
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  status?: LabelStatus;
  search?: string;
}

export type ProjectViewMode = 'grid' | 'list';
export type LabelViewMode = 'grid' | 'list';
