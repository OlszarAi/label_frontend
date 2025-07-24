'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthContext } from '@/providers/AuthProvider';
import { useEffect, useState } from 'react';
import { useProjects } from '@/features/project-management/hooks/useProjects';
import { 
  Plus, 
  FileText, 
  User, 
  BarChart3, 
  Clock, 
  Folder, 
  Edit3,
  ArrowRight,
  Calendar,
  TrendingUp,
  FolderOpen
} from 'lucide-react';
import './landing.styles.css';

interface DashboardStats {
  totalProjects: number;
  totalLabels: number;
  recentActivity: string;
  thisWeekLabels: number;
}

interface RecentProject {
  id: string;
  name: string;
  labelCount: number;
  lastModified: string;
  status: 'active' | 'completed' | 'draft';
}

export function DashboardView() {
  const { user } = useAuthContext();
  const { projects, fetchProjects, isLoading } = useProjects();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalLabels: 0,
    recentActivity: 'Ładowanie...',
    thisWeekLabels: 0
  });
  
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);

  // Fetch real data from API
  useEffect(() => {
    if (user) {
      fetchProjects({ limit: 5 });
    }
  }, [user, fetchProjects]);

  // Calculate stats from real data
  useEffect(() => {
    if (projects.length > 0) {
      const totalLabels = projects.reduce((sum, project) => sum + (project._count?.labels || 0), 0);
      const recentProject = projects[0];
      
      // Symulacja "etykiet w tym tygodniu" - można później podłączyć do prawdziwej metryki
      const thisWeekLabels = Math.floor(totalLabels * 0.1); // przykład: 10% etykiet z tego tygodnia
      
      setStats({
        totalProjects: projects.length,
        totalLabels,
        recentActivity: recentProject ? 
          `${new Date(recentProject.updatedAt).toLocaleDateString('pl-PL')} o ${new Date(recentProject.updatedAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}` 
          : 'Brak aktywności',
        thisWeekLabels
      });

      // Convert projects to recent projects format
      const recent = projects.slice(0, 3).map(project => ({
        id: project.id,
        name: project.name,
        labelCount: project._count?.labels || 0,
        lastModified: getRelativeTime(project.updatedAt),
        status: (project._count?.labels || 0) > 0 ? 'active' as const : 'draft' as const
      }));
      
      setRecentProjects(recent);
    }
  }, [projects]);

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Przed chwilą';
    if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'godzinę' : 'godzin'} temu`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Wczoraj';
    if (diffInDays < 7) return `${diffInDays} dni temu`;
    
    return date.toLocaleDateString('pl-PL');
  };

  const getSubscriptionDisplay = () => {
    if (!user) return 'Free';
    
    switch (user.subscriptionType) {
      case 'STARTER':
        return 'Starter';
      case 'PROFESSIONAL':
        return 'Professional';
      case 'ENTERPRISE':
        return 'Enterprise';
      default:
        return 'Free';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Background */}
      <div className="landing-background">
        <div className="background-grid"></div>
        <div className="background-glow"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="dashboard-content"
        style={{ paddingTop: '120px', maxWidth: '1400px', margin: '0 auto' }}
      >
        {/* Header Welcome - Ciemny styl zgodny z resztą */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          style={{ marginBottom: '48px', padding: '0 24px' }}
        >
          <div className="feature-card" style={{ 
            padding: '32px 24px',
            background: 'rgba(17, 24, 39, 0.7)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            backdropFilter: 'blur(10px)',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '24px' 
          }}>
            <div>
              <h1 style={{ 
                fontSize: '2rem', 
                fontWeight: '700', 
                color: '#F9FAFB', 
                margin: '0 0 12px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span>Witaj ponownie, {user?.email?.split('@')[0] || 'Użytkowniku'}!</span>
                <span style={{ fontSize: '1.5rem' }}>👋</span>
              </h1>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <span style={{ 
                  fontSize: '0.875rem', 
                  color: '#9CA3AF', 
                  fontWeight: '500'
                }}>
                  Plan:
                </span>
                <span style={{ 
                  background: 'rgba(16, 185, 129, 0.2)', 
                  color: '#6EE7B7',
                  padding: '6px 16px',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  {getSubscriptionDisplay()}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link 
                href="/editor/new"
                title="Stwórz nową etykietę" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#6EE7B7',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.25)';
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Plus size={20} />
                Nowa Etykieta
              </Link>
              
              <Link 
                href="/projects"
                title="Zarządzaj projektami" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#93C5FD',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.25)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Folder size={20} />
                Nowy Projekt
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Stats Cards - Ciemny styl z przyjazną kolorystyką */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ marginBottom: '48px', padding: '0 24px' }}
        >
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '24px'
          }}>
            {/* Projekty - Niebieska karta */}
            <div className="feature-card" style={{ 
              padding: '32px 24px',
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  padding: '12px',
                  borderRadius: '12px',
                  color: '#93C5FD',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  <Folder size={24} />
                </div>
                <div>
                  <h3 style={{ color: '#93C5FD', fontSize: '2rem', margin: '0', fontWeight: '700' }}>
                    {isLoading ? '...' : stats.totalProjects}
                  </h3>
                  <p style={{ color: '#9CA3AF', margin: 0, fontSize: '0.875rem' }}>Aktywne Projekty</p>
                </div>
              </div>
            </div>
            
            {/* Etykiety - Zielona karta (przyjazny kolor) */}
            <div className="feature-card" style={{ 
              padding: '32px 24px',
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  padding: '12px',
                  borderRadius: '12px',
                  color: '#6EE7B7',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <FileText size={24} />
                </div>
                <div>
                  <h3 style={{ color: '#6EE7B7', fontSize: '2rem', margin: '0', fontWeight: '700' }}>
                    {isLoading ? '...' : stats.totalLabels}
                  </h3>
                  <p style={{ color: '#9CA3AF', margin: 0, fontSize: '0.875rem' }}>Utworzone Etykiety</p>
                </div>
              </div>
            </div>

            {/* Aktywność - Żółta karta */}
            <div className="feature-card" style={{ 
              padding: '32px 24px',
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  padding: '12px',
                  borderRadius: '12px',
                  color: '#FCD34D',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 style={{ color: '#FCD34D', fontSize: '2rem', margin: '0', fontWeight: '700' }}>
                    +{isLoading ? '...' : stats.thisWeekLabels}
                  </h3>
                  <p style={{ color: '#9CA3AF', margin: 0, fontSize: '0.875rem' }}>Etykiet w tym tygodniu</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Recent Projects & Quick Actions */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '32px',
          padding: '0 24px',
          marginBottom: '48px'
        }}>
          {/* Recent Projects */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="feature-card" style={{ padding: '32px 24px', height: 'fit-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#F9FAFB' }}>
                  Ostatnie Projekty
                </h2>
                <Link 
                  href="/projects" 
                  title="Zobacz wszystkie projekty"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#3B82F6',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#60A5FA';
                    e.currentTarget.style.transform = 'translateX(2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#3B82F6';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  Zobacz wszystkie <ArrowRight size={16} />
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {isLoading ? (
                  <div style={{ color: '#9CA3AF', textAlign: 'center', padding: '32px' }}>
                    Ładowanie projektów...
                  </div>
                ) : recentProjects.length > 0 ? (
                  recentProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                      <Link 
                        href={`/projects/${project.id}/labels`}
                        title={`Otwórz projekt: ${project.name}`}
                        style={{
                          display: 'block',
                          padding: '16px',
                          background: 'rgba(31, 41, 55, 0.6)',
                          borderRadius: '12px',
                          textDecoration: 'none',
                          border: '1px solid rgba(55, 65, 81, 0.3)',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(31, 41, 55, 0.8)';
                          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(31, 41, 55, 0.6)';
                          e.currentTarget.style.borderColor = 'rgba(55, 65, 81, 0.3)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              background: 'rgba(59, 130, 246, 0.2)',
                              padding: '8px',
                              borderRadius: '8px',
                              border: '1px solid rgba(59, 130, 246, 0.3)'
                            }}>
                              <FolderOpen size={16} style={{ color: '#93C5FD' }} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#F9FAFB' }}>
                              {project.name}
                            </h3>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p style={{ margin: 0, fontSize: '0.875rem', color: '#9CA3AF' }}>
                            {project.labelCount} etykiet
                          </p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} />
                            {project.lastModified}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div style={{ color: '#9CA3AF', textAlign: 'center', padding: '32px' }}>
                    <Folder size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                    <p style={{ margin: 0 }}>Nie masz jeszcze żadnych projektów</p>
                    <Link 
                      href="/projects" 
                      title="Stwórz pierwszy projekt"
                      style={{
                        color: '#3B82F6',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#60A5FA';
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#3B82F6';
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      Stwórz pierwszy projekt
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.section>

          {/* Quick Actions - Ciemny styl */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="feature-card" style={{ padding: '32px 24px', height: 'fit-content' }}>
              <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', fontWeight: '700', color: '#F9FAFB' }}>
                Szybkie Akcje
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Link 
                  href="/editor/new"
                  title="Stwórz nową etykietę"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '20px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: '#93C5FD',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.25)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Edit3 size={24} />
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontWeight: '600' }}>Projektuj Nową Etykietę</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#9CA3AF' }}>Stwórz etykietę od podstaw</p>
                  </div>
                </Link>

                <Link 
                  href="/projects"
                  title="Zarządzaj swoimi projektami"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '20px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: '#6EE7B7',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.25)';
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Folder size={24} />
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontWeight: '600' }}>Zarządzaj Projektami</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#9CA3AF' }}>Organizuj swoje etykiety</p>
                  </div>
                </Link>

                <Link 
                  href="/profile"
                  title="Zarządzaj profilem i subskrypcją"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '20px',
                    background: 'rgba(236, 72, 153, 0.15)',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: '#F9A8D4',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(236, 72, 153, 0.25)';
                    e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(236, 72, 153, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(236, 72, 153, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <User size={24} />
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontWeight: '600' }}>Ustawienia Profilu</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#9CA3AF' }}>Zarządzaj kontem i subskrypcją</p>
                  </div>
                </Link>
              </div>
            </div>
          </motion.section>
        </div>

        {/* Performance Insights - Ciemny styl */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{ marginBottom: '48px', padding: '0 24px' }}
        >
          <div className="feature-card" style={{ padding: '32px 24px', textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.5rem', fontWeight: '700', color: '#F9FAFB' }}>
              Twoja Aktywność
            </h2>
            <p style={{ margin: '0 0 24px 0', color: '#9CA3AF', fontSize: '1rem' }}>
              Ostatnia aktywność: <strong style={{ color: '#3B82F6' }}>{stats.recentActivity}</strong>
            </p>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '32px', 
              flexWrap: 'wrap' 
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  background: 'rgba(59, 130, 246, 0.2)',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  color: '#93C5FD',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  <Calendar size={28} />
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#9CA3AF' }}>Regularna praca</p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  background: 'rgba(16, 185, 129, 0.2)',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  color: '#6EE7B7',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <BarChart3 size={28} />
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#9CA3AF' }}>Wysoka produktywność</p>
              </div>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
