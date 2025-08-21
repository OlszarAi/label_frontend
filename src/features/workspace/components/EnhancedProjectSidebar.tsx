"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  X,
  Star
} from 'lucide-react';
import { useProjectContext } from '@/features/project-management/context/ProjectContext';
import { Project } from '@/features/project-management/types/project.types';
import { CreateProjectModal, CreateProjectData } from '@/features/project-management/components/modals';
import './enhanced-project-sidebar.css';

interface EnhancedProjectSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

export const EnhancedProjectSidebar: React.FC<EnhancedProjectSidebarProps> = ({
  isCollapsed = false,
  onToggle,
  isMobileOpen = false,
  onMobileToggle
}) => {
  const router = useRouter();
  const params = useParams();
  const currentProjectId = params?.id as string;
  
  const { projects, currentProject, isLoading, createProject } = useProjectContext();
  
  // Simplified state
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['current', 'recent', 'all']));
  const [favoriteProjects, setFavoriteProjects] = useState<Set<string>>(new Set());
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      // Load saved favorites
      const savedFavorites = localStorage.getItem('favoriteProjects');
      if (savedFavorites) setFavoriteProjects(new Set(JSON.parse(savedFavorites)));
    }
  }, [isInitialized]);

  // Save favorites to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('favoriteProjects', JSON.stringify([...favoriteProjects]));
    }
  }, [favoriteProjects, isInitialized]);

  // Filtered and sorted projects
  const processedProjects = useMemo(() => {
    const filtered = projects.filter(project => {
      // Search filter only
      if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });

    // Sort projects - favorites first, then by updated date
    filtered.sort((a, b) => {
      const aFav = favoriteProjects.has(a.id);
      const bFav = favoriteProjects.has(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return filtered;
  }, [projects, searchQuery, favoriteProjects]);

  // Quick access lists
  const recentProjects = useMemo(() => {
    return processedProjects
      .filter(p => p.id !== currentProjectId)
      .slice(0, 5);
  }, [processedProjects, currentProjectId]);

  const favoriteProjectsList = useMemo(() => {
    return processedProjects
      .filter(p => favoriteProjects.has(p.id) && p.id !== currentProjectId)
      .slice(0, 8);
  }, [processedProjects, favoriteProjects, currentProjectId]);

  // Callbacks
  const navigateToProject = useCallback((projectId: string) => {
    router.push(`/workspace/${projectId}`);
    if (onMobileToggle && isMobileOpen) {
      onMobileToggle();
    }
  }, [router, onMobileToggle, isMobileOpen]);

  const toggleFavorite = useCallback((projectId: string) => {
    setFavoriteProjects(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(projectId)) {
        newFavorites.delete(projectId);
      } else {
        newFavorites.add(projectId);
      }
      return newFavorites;
    });
  }, []);

  const handleCreateProject = async (data: CreateProjectData) => {
    const result = await createProject(data);
    if (result.success) {
      if (result.data) {
        navigateToProject(result.data.id);
      }
    } else {
      throw new Error(result.error);
    }
  };

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  // Quick project item for sections
  const QuickProjectItem: React.FC<{ project: Project }> = ({ project }) => {
    const isActive = project.id === currentProjectId;
    const isFavorite = favoriteProjects.has(project.id);
    const labelCount = project._count?.labels || 0;
    
    return (
      <motion.div
        className={`simple-project-item ${isActive ? 'active' : ''}`}
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
          <>
            <div className="project-info">
              <div className="project-header">
                <span className="project-name">{project.name}</span>
                {isFavorite && <Star size={12} className="favorite-icon filled" />}
              </div>
              <span className="project-count">{labelCount} etykiet</span>
            </div>
            
            <button
              className="favorite-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(project.id);
              }}
              title={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
            >
              <Star size={14} className={isFavorite ? 'filled' : ''} />
            </button>
          </>
        )}
      </motion.div>
    );
  };

  if (isCollapsed) {
    return (
      <motion.div
        className="enhanced-project-sidebar collapsed"
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
            <QuickProjectItem project={currentProject} />
          )}
          {favoriteProjectsList.slice(0, 8).map((project) => (
            <QuickProjectItem key={project.id} project={project} />
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
        className={`enhanced-project-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}
        initial={false}
        animate={{ width: 320 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Simplified Header */}
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
          ) : processedProjects.length === 0 ? (
            <div className="empty-state">
              <Folder size={32} />
              <h3>Brak projektów</h3>
              <p>
                {searchQuery 
                  ? `Brak wyników dla "${searchQuery}"`
                  : 'Utwórz swój pierwszy projekt'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Current Project */}
              {currentProject && (
                <div className={`project-section current ${expandedSections.has('current') ? 'expanded' : 'collapsed'}`}>
                  <button 
                    className="section-header"
                    onClick={() => toggleSection('current')}
                  >
                    <div className="section-title-content">
                      <Folder size={14} />
                      <span>Aktualny projekt</span>
                    </div>
                    <ChevronDown size={16} className="section-toggle" />
                  </button>
                  
                  <AnimatePresence>
                    {expandedSections.has('current') && (
                      <motion.div
                        className="section-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <QuickProjectItem project={currentProject} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Favorite Projects */}
              {favoriteProjectsList.length > 0 && (
                <div className={`project-section favorites ${expandedSections.has('favorites') ? 'expanded' : 'collapsed'}`}>
                  <button 
                    className="section-header"
                    onClick={() => toggleSection('favorites')}
                  >
                    <div className="section-title-content">
                      <Star size={14} />
                      <span>Ulubione ({favoriteProjectsList.length})</span>
                    </div>
                    <ChevronDown size={16} className="section-toggle" />
                  </button>
                  
                  <AnimatePresence>
                    {expandedSections.has('favorites') && (
                      <motion.div
                        className="section-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        {favoriteProjectsList.map((project) => (
                          <QuickProjectItem key={project.id} project={project} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Recent Projects */}
              {recentProjects.length > 0 && (
                <div className={`project-section recent ${expandedSections.has('recent') ? 'expanded' : 'collapsed'}`}>
                  <button 
                    className="section-header"
                    onClick={() => toggleSection('recent')}
                  >
                    <div className="section-title-content">
                      <Clock size={14} />
                      <span>Ostatnie ({recentProjects.length})</span>
                    </div>
                    <ChevronDown size={16} className="section-toggle" />
                  </button>
                  
                  <AnimatePresence>
                    {expandedSections.has('recent') && (
                      <motion.div
                        className="section-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        {recentProjects.map((project) => (
                          <QuickProjectItem key={project.id} project={project} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* All Projects - Simple List instead of Virtual List */}
              <div className={`project-section all ${expandedSections.has('all') ? 'expanded' : 'collapsed'}`}>
                <button 
                  className="section-header"
                  onClick={() => toggleSection('all')}
                >
                  <div className="section-title-content">
                    <Folder size={14} />
                    <span>Wszystkie projekty ({processedProjects.length})</span>
                  </div>
                  <ChevronDown size={16} className="section-toggle" />
                </button>
                
                <AnimatePresence>
                  {expandedSections.has('all') && (
                    <motion.div
                      className="section-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ maxHeight: '400px', overflowY: 'auto' }}
                    >
                      {processedProjects.map((project) => (
                        <QuickProjectItem key={project.id} project={project} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        {/* New Project Button */}
        <div className="new-project-section">
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
