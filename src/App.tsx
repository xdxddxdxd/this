import React, { useState, useEffect, lazy, Suspense } from 'react';
import { User, UserError, AnalysisResult } from './types';
import { authService } from './services/authService';
import { errorService } from './services/errorService';
import { Dashboard } from './components/Dashboard';
import { MyErrors } from './components/MyErrors';
import { Profile } from './components/Profile';
import { BottomNav } from './components/BottomNav';
import { QuestionDetailModal } from './components/QuestionDetailModal';
import { AuthModal } from './components/AuthModal';
import { OnboardingView } from './components/OnboardingView';
import { CustomQuizModal } from './components/CustomQuizModal';

const AddQuestionModal = lazy(() => import('./components/AddQuestionModal').then((module) => ({ default: module.AddQuestionModal })));

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'errors' | 'profile'>('dashboard');
  const [errors, setErrors] = useState<UserError[]>([]);
  const [isLoadingErrors, setIsLoadingErrors] = useState(true);

  // Black & White Theme State (Initializes from saved preference or OS system theme)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('tdk_theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'dark'; // Default fallback to dark B&W
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Listen to OS system theme changes if user hasn't explicitly set a preference
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const explicit = localStorage.getItem('tdk_theme');
      if (!explicit) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const handleSetTheme = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('tdk_theme', newTheme);
  };

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalMode, setAddModalMode] = useState<'text' | 'photo'>('text');
  const [selectedError, setSelectedError] = useState<UserError | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    authService.getCurrentUser().then((user) => {
      if (mounted) {
        setCurrentUser(user);
        setIsAuthLoading(false);
      }
    });
    const subscription = authService.onAuthStateChange((user) => {
      if (mounted) {
        setCurrentUser(user);
        setIsAuthLoading(false);
      }
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load user errors on mount or when user changes
  useEffect(() => {
    if (currentUser) {
      setIsLoadingErrors(true);
      errorService.getUserErrors(currentUser.id).then((data: UserError[]) => {
        setErrors(data);
        setIsLoadingErrors(false);
      });
    } else {
      setErrors([]);
      setIsLoadingErrors(false);
    }
  }, [currentUser]);

  // Handle saving new analyzed question
  const handleSaveAnalyzedQuestion = async (result: AnalysisResult) => {
    if (!currentUser) return;
    const newRecord = await errorService.addError({
      user_id: currentUser.id,
      question_text: result.question_text,
      options: result.options,
      wrong_option: result.wrong_option,
      wrong_word: result.wrong_word,
      correct_word: result.correct_word,
      rule_category: result.rule_category,
      explanation: result.explanation,
      coach_note: result.coach_note,
      difficulty_score: result.difficulty_score || 5,
      is_favorite: false
    });

    setErrors((prev) => [newRecord, ...prev.filter((e) => e.id !== newRecord.id)]);
  };

  // Handle updating an existing error
  const handleUpdateError = async (id: string, updates: Partial<UserError>) => {
    if (!currentUser) return;
    await errorService.updateError(id, updates, currentUser.id);
    setErrors((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e))
    );
    if (selectedError && selectedError.id === id) {
      setSelectedError({ ...selectedError, ...updates, updated_at: new Date().toISOString() });
    }
  };

  // Handle deleting an error
  const handleDeleteError = async (id: string) => {
    if (!currentUser) return;
    await errorService.deleteError(id, currentUser.id);
    setErrors((prev) => prev.filter((e) => e.id !== id));
    if (selectedError && selectedError.id === id) {
      setSelectedError(null);
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (id: string, isFav: boolean) => {
    if (!currentUser) return;
    await handleUpdateError(id, { is_favorite: isFav });
  };

  const handleOpenAdd = (mode: 'text' | 'photo') => {
    setAddModalMode(mode);
    setIsAddModalOpen(true);
  };

  // If no user is logged in, show direct Onboarding & Login screen
  if (isAuthLoading) {
    return <div className="app-container" aria-busy="true" />;
  }

  if (!currentUser) {
    return <OnboardingView onSuccess={setCurrentUser} theme={theme} onToggleTheme={() => handleSetTheme(theme === 'dark' ? 'light' : 'dark')} />;
  }

  return (
    <div className="app-container">
      {/* Main Tab Content */}
      <main style={{ flex: 1 }}>
        {activeTab === 'dashboard' && (
          <Dashboard
            user={currentUser}
            errors={errors}
            onOpenAddModal={handleOpenAdd}
            onSelectError={(err) => setSelectedError(err)}
            onViewAllErrors={() => setActiveTab('errors')}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {activeTab === 'errors' && (
          <MyErrors
            errors={errors}
            onSelectError={(err) => setSelectedError(err)}
            onOpenAddModal={() => handleOpenAdd('text')}
            onOpenQuiz={() => setIsQuizModalOpen(true)}
            onToggleFavorite={handleToggleFavorite}
            onDeleteError={handleDeleteError}
          />
        )}

        {activeTab === 'profile' && (
          <Profile
            user={currentUser}
            errors={errors}
            theme={theme}
            onSetTheme={handleSetTheme}
            onLogout={async () => {
              try {
                await authService.logout();
                setCurrentUser(null);
              } catch {
                // The current session remains active if Supabase rejects logout.
              }
            }}
            onOpenAuth={() => authService.logout().then(() => setCurrentUser(null)).catch(() => undefined)}
          />
        )}
      </main>

      {/* Persistent Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} onChangeTab={(tab) => setActiveTab(tab)} />

      {/* Soru Ekleme & Fotoğraf Çekme Modalı */}
      {isAddModalOpen && (
        <Suspense fallback={null}>
          <AddQuestionModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSave={handleSaveAnalyzedQuestion}
            existingErrors={errors}
            initialMode={addModalMode}
          />
        </Suspense>
      )}

      {/* Soru Detay Modalı */}
      {selectedError && (
        <QuestionDetailModal
          errorItem={selectedError}
          onClose={() => setSelectedError(null)}
          onDelete={handleDeleteError}
          onUpdate={handleUpdateError}
        />
      )}

      {/* Giriş / Hesap Değiştirme Modalı */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          if (user) setCurrentUser(user);
          setIsAuthModalOpen(false);
        }}
      />

      {/* 🎯 Kişiselleştirilmiş Özel Hata Sınavı Modalı */}
      <CustomQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        errors={errors}
      />
    </div>
  );
}

export default App;
