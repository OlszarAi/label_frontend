"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { 
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  Folder,
  ArrowLeft,
  X
} from 'lucide-react';
import { useProjectContext } from '@/features/project-management/context/ProjectContext';
import { useAuthContext } from '@/providers/AuthProvider';
import { Project } from '@/features/project-management/types/project.types';
import { CreateProjectModal, CreateProjectData } from '@/features/project-management/components/modals';
import './new-project-sidebar.css';

interface NewProjectSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

export const NewProjectSidebar: React.FC<NewProjectSidebarProps> = ({
  isCollapsed = false,
  onToggle,
  isMobileOpen = false,
  onMobileToggle
}) => {
  const router = useRouter();
  const params = useParams();
  const currentProjectId = params?.id as string;
  
  const { isAuthenticated } = useAuthContext();
  const { projects, currentProject, isLoading, createProject } = useProjectContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // Initialize
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (isAuthenticated && isInitialized && projects.length === 0 && !isLoading) {
      // Projects will be loaded by ProjectProvider
    }
  }, [isAuthenticated, isInitialized, projects.length, isLoading]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  const recentProjects = useMemo(() => {
    return filteredProjects
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 4);
  }, [filteredProjects]);

  const navigateToProject = (projectId: string) => {
    router.push(`/workspace/${projectId}`);
    if (onMobileToggle && isMobileOpen) {
      onMobileToggle();
    }
  };

  const handleCreateProject = async (data: CreateProjectData) => {
    const result = await createProject(data);
    if (result.success) {
      // Navigate to the new project
      if (result.data) {
        navigateToProject(result.data.id);
      }
    } else {
      throw new Error(result.error);
    }
  };

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const ProjectItem: React.FC<{ project: Project; isActive?: boolean }> = ({ 
    project, 
    isActive = false 
  }) => {
    const labelCount = project._count?.labels || 0;
    
    return (
      <motion.div
        className={`project-item ${isActive ? 'active' : ''}`}
        onClick={() => navigateToProject(project.id)}
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
      >
        <div 
          className="project-icon"
          style={{ backgroundColor: project.color || '#3b82f6' }}
        >
          {project.icon || project.name[0].toUpperCase()}
        </div>
        
        {!isCollapsed && (
          <div className="project-info">
            <span className="project-name">{project.name}</span>
            <span className="project-count">{labelCount} etykiet</span>
          </div>
        )}
      </motion.div>
    );
  };

  if (isCollapsed) {
    return (
      <motion.div
        className="new-project-sidebar collapsed"
        initial={false}
        animate={{ width: 64 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Collapse Toggle */}
        <div className="collapse-only-header">
          <button
            className="collapse-btn"
            onClick={onToggle}
            title="Rozwiń sidebar"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Collapsed Projects */}
        <div className="collapsed-projects">
          {currentProject && (
            <ProjectItem project={currentProject} isActive={true} />
          )}
          {recentProjects
            .filter(p => p.id !== currentProjectId)
            .slice(0, 6)
            .map((project) => (
              <ProjectItem
                key={project.id}
                project={project}
                isActive={false}
              />
            ))}
        </div>
      </motion.div>
    );
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <motion.div
          className="mobile-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onMobileToggle}
        />
      )}

      <motion.div
        className={`new-project-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}
        initial={false}
        animate={{ width: 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Header */}
        <div className="sidebar-header">
          <motion.button
            className="back-btn"
            onClick={() => router.push('/dashboard')}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </motion.button>
          
          <button
            className="collapse-btn"
            onClick={onToggle}
            title="Zwiń sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="search-section">
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Szukaj projektów..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Projects List */}
        <div className="projects-list">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner" />
              <span>Ładowanie projektów...</span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="empty-state">
              <Folder size={32} />
              <h3>Brak projektów</h3>
              <p>Utwórz swój pierwszy projekt, aby rozpocząć pracę</p>
            </div>
          ) : (
            <>
              {/* Current Project */}
              {currentProject && (
                <div className={`project-section current ${collapsedSections.has('current') ? 'collapsed' : ''}`}>
                  <div 
                    className="section-title"
                    onClick={() => toggleSection('current')}
                  >
                    <div className="section-title-content">
                      <Folder size={14} />
                      <span>Aktualny projekt</span>
                    </div>
                    <ChevronDown size={16} className="section-collapse-icon" />
                  </div>
                  <div className="projects-grid">
                    <ProjectItem project={currentProject} isActive={true} />
                  </div>
                </div>
              )}

              {/* Recent Projects */}
              {recentProjects.filter(p => p.id !== currentProjectId).length > 0 && (
                <div className={`project-section recent ${collapsedSections.has('recent') ? 'collapsed' : ''}`}>
                  <div 
                    className="section-title"
                    onClick={() => toggleSection('recent')}
                  >
                    <div className="section-title-content">
                      <Clock size={14} />
                      <span>Ostatnie projekty</span>
                    </div>
                    <ChevronDown size={16} className="section-collapse-icon" />
                  </div>
                  <div className="projects-grid">
                    {recentProjects
                      .filter(p => p.id !== currentProjectId)
                      .map((project) => (
                        <ProjectItem
                          key={project.id}
                          project={project}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* All Projects */}
              <div className={`project-section all ${collapsedSections.has('all') ? 'collapsed' : ''}`}>
                <div 
                  className="section-title"
                  onClick={() => toggleSection('all')}
                >
                  <div className="section-title-content">
                    <Folder size={14} />
                    <span>Wszystkie projekty ({filteredProjects.length})</span>
                  </div>
                  <ChevronDown size={16} className="section-collapse-icon" />
                </div>
                <div className="projects-grid">
                  {filteredProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isActive={project.id === currentProjectId}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* New Project Button - Bottom */}
        <div className="new-project-section bottom">
          <motion.button
            className="new-project-btn"
            onClick={() => setCreateModalOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={18} />
            <span>Nowy projekt</span>
          </motion.button>
        </div>

        {/* Create Project Modal */}
        <CreateProjectModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateProject}
        />
      </motion.div>
    </>
  );
};