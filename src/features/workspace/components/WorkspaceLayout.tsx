"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnhancedProjectSidebar } from './EnhancedProjectSidebar';
import { ProjectWorkspace } from './ProjectWorkspace';
import { WorkspaceOverview } from './WorkspaceOverview';
import './workspace-layout.css';

interface WorkspaceLayoutProps {
  projectId?: string;
  children?: React.ReactNode;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({ 
  projectId,
  children
}) => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="workspace-layout">
      {/* Dashboard-style Background */}
      <div className="workspace-background">
        <div className="background-grid"></div>
        <div className="background-glow"></div>
      </div>

      {/* Enhanced Sidebar Navigation */}
      <EnhancedProjectSidebar 
        isCollapsed={isNavCollapsed}
        onToggle={() => setIsNavCollapsed(!isNavCollapsed)}
        isMobileOpen={isMobileNavOpen}
        onMobileToggle={() => setIsMobileNavOpen(!isMobileNavOpen)}
      />
      
      {/* Main Content Area */}
      <motion.div 
        className={`workspace-main ${isNavCollapsed ? 'sidebar-collapsed' : ''}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ 
          marginLeft: isNavCollapsed ? '64px' : '320px',
          transition: 'margin-left 0.3s ease'
        }}
      >
        {projectId ? (
          <ProjectWorkspace 
            projectId={projectId}
            onMobileMenuToggle={() => setIsMobileNavOpen(!isMobileNavOpen)}
          />
        ) : (
          <WorkspaceOverview 
            onMobileMenuToggle={() => setIsMobileNavOpen(!isMobileNavOpen)}
          />
        )}
        {children}
      </motion.div>
      
      {/* Mobile Overlay */}
      {isMobileNavOpen && (
        <motion.div 
          className="mobile-nav-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}
    </div>
  );
};
