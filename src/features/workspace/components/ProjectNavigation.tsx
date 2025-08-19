"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  ChevronDown, 
  ChevronRight,
  Grid3X3,
  Clock,
  MoreHorizontal,
  Folder,
  ArrowLeft
} from 'lucide-react';
import { useProjectContext } from '@/features/project-management/context/ProjectContext';
import { useAuthContext } from '@/providers/AuthProvider';
import { Project } from '@/features/project-management/types/project.types';
import './project-navigation.css';

interface ProjectNavigationProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

export const ProjectNavigation: React.FC<ProjectNavigationProps> = ({ 
  isCollapsed = false, 
  onToggle,
  isMobileOpen = false
}) => {
  const router = useRouter();
  const params = useParams();
  const currentProjectId = params?.id as string;
  const { isAuthenticated, isLoading: authLoading, token } = useAuthContext();
  
  console.log('🔍 ProjectNavigation: Current project ID from params:', currentProjectId);
  console.log('🔍 ProjectNavigation: Auth state:', { isAuthenticated, authLoading, hasToken: !!token });
  
  const { projects, currentProject, isLoading, error } = useProjectContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['recent']));
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  console.log('🔍 ProjectNavigation Debug:', { 
    projectsCount: projects.length, 
    isLoading, 
    error,
    currentProject: currentProject?.name,
    isInitialized
  });

  useEffect(() => {
    // Mark as initialized after first render
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    // Projects are loaded by ProjectProvider - no need to load here
    console.log('🔄 ProjectNavigation: Projects managed by ProjectProvider', {
      projectsCount: projects.length,
      isLoading,
      isAuthenticated,
      isInitialized
    });
  }, [projects.length, isLoading, isAuthenticated, isInitialized]);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentProjects = filteredProjects
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const navigateToProject = (projectId: string) => {
    router.push(`/workspace/${projectId}`);
  };

  const ProjectItem: React.FC<{ project: Project; isActive?: boolean }> = ({ 
    project, 
    isActive = false 
  }) => {
    // Force stable layout calculation
    const itemRef = React.useRef<HTMLDivElement>(null);
    
    React.useEffect(() => {
      if (itemRef.current) {
        // Force immediate layout calculation to prevent text overlap
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        itemRef.current.offsetHeight; // Trigger reflow
        itemRef.current.style.height = '44px';
        itemRef.current.style.minHeight = '44px';
        itemRef.current.style.maxHeight = '44px';
      }
    }, []);

    return (
      <motion.div
        ref={itemRef}
        className={`project-nav-item ${isActive ? 'active' : ''}`}
        whileHover={{ x: 2 }}
        onClick={() => navigateToProject(project.id)}
        onMouseEnter={() => setHoveredProject(project.id)}
        onMouseLeave={() => setHoveredProject(null)}
        style={{
          height: '44px',
          minHeight: '44px',
          maxHeight: '44px',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden'
        }}
      >
        <div className="project-nav-icon" style={{ backgroundColor: project.color }}>
          {project.icon || project.name[0].toUpperCase()}
        </div>
        
        {!isCollapsed && (
          <>
            <div className="project-nav-content">
              <span className="project-nav-name">{project.name}</span>
              <span className="project-nav-count">
                {project._count?.labels || 0} etykiet
              </span>
            </div>
            
            <div className="project-nav-actions">
              <button 
                className="nav-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Show project menu
                }}
              >
                <MoreHorizontal size={14} />
              </button>
            </div>
          </>
        )}
        
        {/* Tooltip for collapsed state */}
        {isCollapsed && hoveredProject === project.id && (
          <div className="project-tooltip">
            <div className="tooltip-content">
              <strong>{project.name}</strong>
              <span>{project._count?.labels || 0} etykiet</span>
              {project.description && <p>{project.description}</p>}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className={`project-navigation ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Header */}
      <div className="nav-header">
        {/* Dashboard button */}
        {!isCollapsed && (
          <button 
            className="nav-back-btn"
            onClick={() => router.push('/dashboard')}
            title="Powrót do Dashboard"
          >
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </button>
        )}
        
        <div className="nav-header-content">
          {!isCollapsed && (
            <div className="nav-title">
              <FolderOpen size={20} />
              <span>Projekty</span>
            </div>
          )}
          
          <button 
            className="nav-toggle"
            onClick={onToggle}
            title={isCollapsed ? 'Rozwiń' : 'Zwiń'}
          >
            <ChevronRight className={isCollapsed ? '' : 'rotated'} size={16} />
          </button>
        </div>
        
        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="nav-quick-actions">
            <button 
              className="quick-action-btn"
              onClick={() => router.push('/workspace')}
              title="Wszystkie projekty"
            >
              <Grid3X3 size={16} />
            </button>
            <button 
              className="quick-action-btn primary"
              onClick={() => router.push('/workspace')}
              title="Nowy projekt"
            >
              <Plus size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="nav-search">
          <div className="search-wrapper">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Szukaj projektów..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="nav-content">
        {/* Current Project */}
        {currentProject && (
          <div className="nav-section">
            {!isCollapsed && (
              <div className="section-header">
                <span className="section-title">Aktualny projekt</span>
              </div>
            )}
            <ProjectItem 
              project={currentProject} 
              isActive={true}
            />
          </div>
        )}

        {/* Recent Projects */}
        <div className="nav-section">
          {!isCollapsed && (
            <button 
              className="section-header clickable"
              onClick={() => toggleSection('recent')}
            >
              <div className="section-title-row">
                <Clock size={14} />
                <span className="section-title">Ostatnie</span>
              </div>
              <ChevronDown 
                size={14} 
                className={expandedSections.has('recent') ? 'expanded' : ''} 
              />
            </button>
          )}
          
          <AnimatePresence>
            {(isCollapsed || expandedSections.has('recent')) && (
              <motion.div
                initial={!isCollapsed ? { height: 0, opacity: 0 } : false}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="section-content"
              >
                {recentProjects
                  .filter(p => p.id !== currentProjectId)
                  .slice(0, isCollapsed ? 10 : 5)
                  .map(project => (
                    <ProjectItem 
                      key={project.id}
                      project={project}
                    />
                  ))}
                
                {!isCollapsed && recentProjects.length === 0 && (
                  <div className="empty-section">
                    <span>Brak ostatnich projektów</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* All Projects */}
        {!isCollapsed && (
          <div className="nav-section">
            <button 
              className="section-header clickable"
              onClick={() => toggleSection('all')}
            >
              <div className="section-title-row">
                <Folder size={14} />
                <span className="section-title">Wszystkie projekty</span>
                <span className="section-count">({filteredProjects.length})</span>
              </div>
              <ChevronDown 
                size={14} 
                className={expandedSections.has('all') ? 'expanded' : ''} 
              />
            </button>
            
            <AnimatePresence>
              {expandedSections.has('all') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="section-content scrollable"
                  style={{ maxHeight: '300px' }}
                >
                  {filteredProjects.map(project => (
                    <ProjectItem 
                      key={project.id}
                      project={project}
                      isActive={project.id === currentProjectId}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {!isCollapsed && (
        <div className="nav-footer">
          <button 
            className="footer-action"
            onClick={() => router.push('/workspace')}
          >
            <Grid3X3 size={16} />
            <span>Zarządzaj projektami</span>
          </button>
        </div>
      )}
    </div>
  );
};
