"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useProjectContext } from '../../context/ProjectContext';
import { Folder, LayoutGrid, Tag, Settings, ChevronDown, Plus, RefreshCw, ArrowLeftRight } from 'lucide-react';
import '@/features/project-management/styles/projects.css';

interface ProjectLayoutProps {
  children: React.ReactNode;
  section?: string;
}

export const ProjectLayout: React.FC<ProjectLayoutProps> = ({ children, section = 'overview' }) => {
  const router = useRouter();
  const params = useParams() as { id: string };
  const projectId = params.id;
  const { projects, currentProject } = useProjectContext();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.project-switcher-wrapper')) {
        setSwitcherOpen(false);
      }
    };

    if (switcherOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [switcherOpen]);

  const handleSwitchProject = (id: string) => {
    setSwitcherOpen(false);
    if (id === projectId) return;
    router.push(`/workspace/${id}`);
  };

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="project-shell">
      <div className="project-shell-background">
        <div className="projects-background-grid"></div>
        <div className="projects-background-glow"></div>
      </div>
      <header className="project-header">
        <div className="project-header-left">
          <Link href="/workspace" className="project-home-link" title="Wszystkie projekty">
            <Folder size={18} />
          </Link>
          <div className="project-switcher-wrapper">
            <button className="project-switcher-trigger" onClick={() => setSwitcherOpen(o => !o)}>
              <span className="project-switcher-name">{currentProject?.name || 'Ładowanie...'}</span>
              <ChevronDown size={14} className={`project-switcher-chevron ${switcherOpen ? 'open' : ''}`} />
            </button>
            <AnimatePresence>
              {switcherOpen && (
                <motion.div
                  className="project-switcher-panel"
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <input
                    type="text"
                    placeholder="Szukaj projektów..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="project-switcher-search"
                    autoFocus
                  />
                  <div className="project-switcher-list">
                    {filteredProjects.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleSwitchProject(p.id)}
                        className={`project-switcher-option ${p.id === projectId ? 'current' : ''}`}
                      >
                        <div style={{ backgroundColor: p.color }} className="project-switcher-color"></div>
                        <span className="project-switcher-project-name">{p.name}</span>
                        <span className="project-switcher-count">{p._count?.labels || 0}</span>
                        {p.id === projectId && <ArrowLeftRight size={14} className="project-switcher-current" />}
                      </button>
                    ))}
                    {filteredProjects.length === 0 && (
                      <div className="project-switcher-empty">Brak wyników</div>
                    )}
                  </div>
                  <div className="project-switcher-footer">
                    <Link href="/workspace" className="project-switcher-manage">
                      Zarządzaj projektami
                    </Link>
                    <Link href="/workspace" className="project-switcher-create">
                      <Plus size={14} /> Nowy projekt
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="project-header-right">
          <button className="project-header-action" title="Odśwież">
            <RefreshCw size={16} />
          </button>
          <button className="project-header-action" title="Ustawienia projektu">
            <Settings size={16} />
          </button>
        </div>
      </header>
      <nav className="project-tabs">
        {[
          { key: 'overview', label: 'Przegląd', icon: LayoutGrid },
          { key: 'labels', label: 'Etykiety', icon: Tag },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Link key={s.key} href={`/workspace/${projectId}${s.key === 'overview' ? '' : '/' + s.key}`} className={`project-tab ${section === s.key ? 'active' : ''}`}>
              <Icon size={16} />
              {s.label}
            </Link>
          );
        })}
      </nav>
      <main className="project-content">
        {children}
      </main>
    </div>
  );
};
