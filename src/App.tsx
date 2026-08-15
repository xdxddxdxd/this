import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { MyErrors } from './components/MyErrors';
import { Profile } from './components/Profile';
import { BottomNav } from './components/BottomNav';
import { AddQuestionModal } from './components/AddQuestionModal';
import { CustomQuizModal } from './components/CustomQuizModal';
import { QuestionDetailModal } from './components/QuestionDetailModal';
import { PdfExportModal } from './components/PdfExportModal';
import { AuthModal } from './components/AuthModal';
import { UserError, AnalysisResult } from './types';
import { errorService } from './services/errorService';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'my-errors' | 'profile'>('dashboard');
  const [errors, setErrors] = useState<UserError[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedError, setSelectedError] = useState<UserError | null>(null);

  // Initialize theme
  useEffect(() => {
    const savedTheme = (localStorage.getItem('tdk_theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('tdk_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Load user errors
  useEffect(() => {
    loadErrors();
  }, []);

  const loadErrors = async () => {
    try {
      const data = await errorService.getErrors('local-user');
      setErrors(data);
    } catch (err) {
      console.warn('Failed to load errors:', err);
    }
  };

  const handleSaveAnalysis = async (result: AnalysisResult) => {
    const saved = await errorService.saveError({
      user_id: 'local-user',
      question_text: result.question_text,
      options: result.options,
      wrong_option: result.wrong_option,
      wrong_word: result.wrong_word,
      correct_word: result.correct_word,
      rule_category: result.rule_category,
      explanation: result.explanation,
      coach_note: result.coach_note,
      is_favorite: false
    });
    setErrors(prev => [saved, ...prev]);
  };

  const handleUpdateError = async (id: string, updates: Partial<UserError>) => {
    await errorService.updateError(id, updates, 'local-user');
    setErrors(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    if (selectedError && selectedError.id === id) {
      setSelectedError(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleDeleteError = async (id: string) => {
    await errorService.deleteError(id, 'local-user');
    setErrors(prev => prev.filter(e => e.id !== id));
  };

  const handleDeleteMultipleErrors = async (ids: string[]) => {
    await errorService.deleteMultipleErrors(ids, 'local-user');
    setErrors(prev => prev.filter(e => !ids.includes(e.id)));
  };

  const handleToggleMultipleFavorites = async (ids: string[], isFav: boolean) => {
    await errorService.toggleMultipleFavorites(ids, isFav, 'local-user');
    setErrors(prev => prev.map(e => ids.includes(e.id) ? { ...e, is_favorite: isFav } : e));
  };

  return (
    <div className="app-layout">
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            errors={errors}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenQuizModal={() => setIsQuizModalOpen(true)}
            onSelectError={(err) => setSelectedError(err)}
          />
        )}

        {activeTab === 'my-errors' && (
          <MyErrors
            errors={errors}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenQuizModal={() => setIsQuizModalOpen(true)}
            onSelectError={(err) => setSelectedError(err)}
            onDeleteMultiple={handleDeleteMultipleErrors}
            onToggleMultipleFavorites={handleToggleMultipleFavorites}
          />
        )}

        {activeTab === 'profile' && (
          <Profile
            errors={errors}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            theme={theme}
            setTheme={handleThemeChange}
          />
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        errorCount={errors.length}
      />

      {/* Modals */}
      <AddQuestionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveAnalysis}
        existingErrors={errors}
      />

      <CustomQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        errors={errors}
      />

      {selectedError && (
        <QuestionDetailModal
          errorItem={selectedError}
          onClose={() => setSelectedError(null)}
          onDelete={handleDeleteError}
          onUpdate={handleUpdateError}
        />
      )}

      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        errors={errors}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}

export default App;
