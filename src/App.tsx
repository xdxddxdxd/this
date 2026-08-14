import React, { useState, useEffect } from 'react';
import { User, UserError, AnalysisResult } from './types';
import { authService } from './services/authService';
import { errorService } from './services/errorService';
import { Dashboard } from './components/Dashboard';
import { MyErrors } from './components/MyErrors';
import { Profile } from './components/Profile';
import { BottomNav } from './components/BottomNav';
import { AddQuestionModal } from './components/AddQuestionModal';
import { QuestionDetailModal } from './components/QuestionDetailModal';
import { AuthModal } from './components/AuthModal';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'errors' | 'profile'>('dashboard');
  const [errors, setErrors] = useState<UserError[]>([]);
  const [isLoadingErrors, setIsLoadingErrors] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalMode, setAddModalMode] = useState<'text' | 'photo'>('text');
  const [selectedError, setSelectedError] = useState<UserError | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setIsLoadingErrors(true);
      errorService.getUserErrors(currentUser.id).then((data) => {
        setErrors(data);
        setIsLoadingErrors(false);
      });
    }
  }, [currentUser]);

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

  const handleDeleteError = async (id: string) => {
    if (!currentUser) return;
    await errorService.deleteError(id, currentUser.id);
    setErrors((prev) => prev.filter((e) => e.id !== id));
    if (selectedError && selectedError.id === id) {
      setSelectedError(null);
    }
  };

  const handleToggleFavorite = async (id: string, isFav: boolean) => {
    if (!currentUser) return;
    await handleUpdateError(id, { is_favorite: isFav });
  };

  const handleOpenAdd = (mode: 'text' | 'photo') => {
    setAddModalMode(mode);
    setIsAddModalOpen(true);
  };

  if (!currentUser) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '340px' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
            TDK Projesi <span className="red-dot" />
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            TYT Türkçe denemelerindeki yazım yanlışlarını takip et ve öğren.
          </p>
          <button className="btn-primary" style={{ width: '100%' }} onClick={() => setIsAuthModalOpen(true)}>
            Giriş Yap / Kaydol
          </button>
        </div>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthModalOpen(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
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
            onToggleFavorite={handleToggleFavorite}
            onDeleteError={handleDeleteError}
          />
        )}

        {activeTab === 'profile' && (
          <Profile
            user={currentUser}
            errors={errors}
            onLogout={() => {
              authService.logout();
              setCurrentUser(null);
            }}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      <BottomNav activeTab={activeTab} onChangeTab={(tab) => setActiveTab(tab)} />

      <AddQuestionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveAnalyzedQuestion}
        existingErrors={errors}
        initialMode={addModalMode}
      />

      {selectedError && (
        <QuestionDetailModal
          errorItem={selectedError}
          onClose={() => setSelectedError(null)}
          onDelete={handleDeleteError}
          onUpdate={handleUpdateError}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
        }}
      />
    </div>
  );
}

export default App;