import React from 'react';
import { Home, BookmarkCheck, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'dashboard' | 'my-errors' | 'profile';
  setActiveTab: (tab: 'dashboard' | 'my-errors' | 'profile') => void;
  errorCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  errorCount
}) => {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        <button
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <Home size={20} />
          <span>Ana Sayfa</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'my-errors' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-errors')}
        >
          <div style={{ position: 'relative' }}>
            <BookmarkCheck size={20} />
            {errorCount > 0 && (
              <span className="badge-count">{errorCount > 99 ? '99+' : errorCount}</span>
            )}
          </div>
          <span>Hatalarım</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={20} />
          <span>Profil</span>
        </button>
      </div>
    </nav>
  );
};
