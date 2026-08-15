import React from 'react';
import { Home, BookOpen, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'dashboard' | 'errors' | 'profile';
  onChangeTab: (tab: 'dashboard' | 'errors' | 'profile') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  return (
    <nav className="bottom-nav-bar" aria-label="Ana Menü">
      <button
        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => onChangeTab('dashboard')}
        aria-label="Dashboard"
      >
        <Home size={22} strokeWidth={activeTab === 'dashboard' ? 2.4 : 1.8} />
        <span>Dashboard</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'errors' ? 'active' : ''}`}
        onClick={() => onChangeTab('errors')}
        aria-label="Hatalarım"
      >
        <BookOpen size={22} strokeWidth={activeTab === 'errors' ? 2.4 : 1.8} />
        <span>Hatalarım</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => onChangeTab('profile')}
        aria-label="Profil"
      >
        <User size={22} strokeWidth={activeTab === 'profile' ? 2.4 : 1.8} />
        <span>Profil</span>
      </button>
    </nav>
  );
};
