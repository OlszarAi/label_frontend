"use client";
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Clock, 
  FolderOpen,
  Grid3X3,
  ArrowRight,
  Tags,
  MoreHorizontal,
  Menu
} from 'lucide-react';
import { useProjectContext } from '@/features/project-management/context/ProjectContext';
import { useAuthContext } from '@/providers/AuthProvider';
import { Project } from '@/features/project-management/types/project.types';
import { 
  CreateProjectModal, 
  EditProjectModal, 
  DeleteProjectModal,
  CreateProjectData,
  EditProjectData
} from '@/features/project-management/components/modals';
import './workspace-overview.css';



interface WorkspaceOverviewProps {
  onMobileMenuToggle?: () => void;
}

type SortOption = 'updated' | 'created' | 'name' | 'labels';
type ViewMode = 'grid' | 'list';

export const WorkspaceOverview: React.FC<WorkspaceOverviewProps> = ({ onMobileMenuToggle }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const { 
    projects, 
    isLoading, 
    createProject, 
    updateProject, 
    deleteProject 
  } = useProjectContext();

  // Log projects changes
  React.useEffect(() => {
    console.log('📊 WorkspaceOverview: Projects updated', {
      count: projects.length,
      projects: projects.map(p => ({ id: p.id, name: p.name, updatedAt: p.updatedAt }))
    });
  }, [projects]);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);




  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    const filtered = projects.filter(project => 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'labels':
          return (b._count?.labels || 0) - (a._count?.labels || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, searchQuery, sortBy]);

  const recentProjects = projects
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  // Modal handlers
  const handleCreateProject = async (data: CreateProjectData) => {
    console.log('🚀 WorkspaceOverview: Creating project', data);
    const result = await createProject(data);
    console.log('🚀 WorkspaceOverview: Create result', result);
    if (!result.success) {
      throw new Error(result.error);
    }
    console.log('🚀 WorkspaceOverview: Project created successfully');
  };

  const handleEditProject = async (data: EditProjectData) => {
    if (!selectedProject) throw new Error('No project selected');
    
    console.log('✏️ WorkspaceOverview: Editing project', selectedProject.id, data);
    const result = await updateProject(selectedProject.id, data);
    console.log('✏️ WorkspaceOverview: Edit result', result);
    if (!result.success) {
      throw new Error(result.error);
    }
    console.log('✏️ WorkspaceOverview: Project edited successfully');
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) throw new Error('No project selected');
    
    console.log('🗑️ WorkspaceOverview: Deleting project', selectedProject.id);
    const result = await deleteProject(selectedProject.id);
    console.log('🗑️ WorkspaceOverview: Delete result', result);
    if (!result.success) {
      throw new Error(result.error);
    }
    console.log('🗑️ WorkspaceOverview: Project deleted successfully');
  };

  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setEditModalOpen(true);
  };

  const openDeleteModal = (project: Project) => {
    setSelectedProject(project);
    setDeleteModalOpen(true);
  };





  const ProjectCard: React.FC<{ 
    project: Project; 
    onClick: () => void;
    onEdit: () => void;
    onDelete: () => void;
  }> = ({ project, onClick, onEdit, onDelete }) => {
    const labelCount = project._count?.labels || 0;
    const lastUpdate = new Date(project.updatedAt);
    const isRecent = Date.now() - lastUpdate.getTime() < 7 * 24 * 60 * 60 * 1000;

    return (
      <motion.div
        className={`project-card ${viewMode}`}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
      >

        {/* Project Icon/Color */}
        <div className="project-visual">
          <div 
            className="project-icon" 
            style={{ backgroundColor: project.color || '#3b82f6' }}
          >
            {project.icon || project.name[0].toUpperCase()}
          </div>
          {isRecent && (
            <div className="recent-badge">
              <Clock size={10} />
              Nowe
            </div>
          )}
        </div>

        {/* Project Info */}
        <div className="project-info">
          <div className="project-header">
            <h3 className="project-name" title={project.name}>
              {project.name}
            </h3>
            <div className="project-menu">
              <button 
                className="project-menu-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                title="Edytuj projekt"
              >
                ✏️
              </button>
              <button 
                className="project-menu-btn delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                title="Usuń projekt"
              >
                🗑️
              </button>
            </div>
          </div>
          
          {project.description && (
            <p className="project-description">{project.description}</p>
          )}
          
          <div className="project-meta">
            <div className="project-stats">
              <div className="stat-item">
                <Tags size={12} />
                <span>{labelCount} etykiet</span>
              </div>
              <div className="stat-item">
                <Clock size={12} />
                <span>{lastUpdate.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="project-actions">
          <button 
            className="action-btn small"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/editor/new?projectId=${project.id}`);
            }}
            title="Nowa etykieta"
          >
            <Plus size={14} />
          </button>
          <button 
            className="action-btn small"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/workspace/${project.id}`);
            }}
            title="Otwórz projekt"
          >
            <ArrowRight size={14} />
          </button>
        </div>
      </motion.div>
    );
  };

  if (!isAuthenticated) {
    return null; // This should be handled by ProtectedRoute
  }

  return (
    <div className="workspace-overview">
      {/* Header */}
      <div className="overview-header">
        <div className="header-content">
          <div className="header-left">
            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu-btn"
              onClick={onMobileMenuToggle}
              title="Menu"
            >
              <Menu size={20} />
            </button>
            
            <div>
              <h1 className="overview-title">
                <FolderOpen size={28} />
                Workspace
              </h1>
              <p className="overview-subtitle">
                Zarządzaj projektami i etykietami w jednym miejscu
              </p>
            </div>
          </div>
          
          <div className="header-actions">
            <button 
              className="action-btn primary"
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus size={16} />
              Nowy projekt
            </button>
          </div>
        </div>


      </div>



      {/* Quick Actions & Recent Projects */}
      <div className="content-grid">
        {/* Recent Projects */}
        <motion.section 
          className="recent-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="section-header">
            <h2 className="section-title">
              <Clock size={20} />
              Ostatnie projekty
            </h2>
            <button 
              className="view-all-btn"
              onClick={() => {/* TODO: Scroll to all projects */}}
            >
              Zobacz wszystkie
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="recent-projects">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => router.push(`/workspace/${project.id}`)}
                  onEdit={() => openEditModal(project)}
                  onDelete={() => openDeleteModal(project)}
                />
              ))
            ) : (
              <div className="empty-state">
                <FolderOpen size={32} />
                <p>Brak ostatnich projektów</p>
                <button 
                  className="action-btn primary"
                  onClick={() => setCreateModalOpen(true)}
                >
                  Utwórz pierwszy projekt
                </button>
              </div>
            )}
          </div>
        </motion.section>
      </div>

      {/* All Projects Section */}
      <motion.section 
        className="all-projects-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="section-header">
          <h2 className="section-title">
            <Grid3X3 size={20} />
            Wszystkie projekty
          </h2>
          
          <div className="section-controls">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Szukaj projektów..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="sort-select"
            >
              <option value="updated">Ostatnio aktualizowane</option>
              <option value="created">Najnowsze</option>
              <option value="name">Nazwa A-Z</option>
              <option value="labels">Liczba etykiet</option>
            </select>

            <div className="view-controls">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Siatka"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="Lista"
              >
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid/List */}
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span>Ładowanie projektów...</span>
          </div>
        ) : filteredAndSortedProjects.length === 0 ? (
          <div className="empty-state">
            <FolderOpen size={48} />
            <h3>Brak projektów</h3>
            <p>
              {searchQuery 
                ? `Nie znaleziono projektów dla "${searchQuery}"`
                : 'Rozpocznij tworzenie projektów i etykiet'
              }
            </p>
            {!searchQuery && (
              <button 
                className="action-btn primary"
                onClick={() => setCreateModalOpen(true)}
              >
                <Plus size={16} />
                Utwórz pierwszy projekt
              </button>
            )}
          </div>
        ) : (
          <div className={`projects-container ${viewMode}`}>
            <AnimatePresence mode="popLayout">
              {filteredAndSortedProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                >
                  <ProjectCard
                    project={project}
                    onClick={() => router.push(`/workspace/${project.id}`)}
                    onEdit={() => openEditModal(project)}
                    onDelete={() => openDeleteModal(project)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.section>

      {/* Modals */}
      <CreateProjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />

      <EditProjectModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedProject(null);
        }}
        onSubmit={handleEditProject}
        project={selectedProject}
      />

      <DeleteProjectModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedProject(null);
        }}
        onConfirm={handleDeleteProject}
        project={selectedProject}
      />
    </div>
  );
};
