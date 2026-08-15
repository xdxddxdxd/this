import React, { useEffect, useState } from 'react';
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
import { OnboardingView } from './components/OnboardingView';
import { CustomQuizModal } from './components/CustomQuizModal';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'errors' | 'profile'>('dashboard');
  const [errors, setErrors] = useState<UserError[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => localStorage.getItem('tdk_theme') === 'light' ? 'light' : 'dark');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalMode, setAddModalMode] = useState<'text' | 'photo'>('text');
  const [selectedError, setSelectedError] = useState<UserError | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);

  useEffect(() => {
    let active = true;
    authService.getCurrentUser().then(user => { if (active) { setCurrentUser(user); setAuthReady(true); } });
    const subscription = authService.onAuthStateChange(user => setCurrentUser(user));
    return () => { active = false; subscription?.subscription?.unsubscribe?.(); };
  }, []);

  useEffect(() => {
    if (!currentUser) { setErrors([]); return; }
    errorService.getUserErrors(currentUser.id).then(setErrors).catch(() => setErrors([]));
  }, [currentUser]);

  const handleSaveAnalyzedQuestion = async (result: AnalysisResult) => {
    if (!currentUser) return;
    const record = await errorService.addError({
      user_id: currentUser.id, question_text: result.question_text, options: result.options,
      wrong_option: result.wrong_option, wrong_word: result.wrong_word, correct_word: result.correct_word,
      rule_category: result.rule_category, explanation: result.explanation, coach_note: result.coach_note,
      difficulty_score: result.difficulty_score || 5, is_favorite: false
    });
    setErrors(prev => [record, ...prev.filter(e => e.id !== record.id)]);
  };

  const handleUpdateError = async (id: string, updates: Partial<UserError>) => {
    if (!currentUser) return;
    await errorService.updateError(id, updates, currentUser.id);
    const timestamp = new Date().toISOString();
    setErrors(prev => prev.map(e => e.id === id ? { ...e, ...updates, updated_at: timestamp } : e));
    setSelectedError(prev => prev?.id === id ? { ...prev, ...updates, updated_at: timestamp } : prev);
  };

  const handleDeleteError = async (id: string) => {
    if (!currentUser) return;
    await errorService.deleteError(id, currentUser.id);
    setErrors(prev => prev.filter(e => e.id !== id));
    setSelectedError(prev => prev?.id === id ? null : prev);
  };

  const handleOpenAdd = (mode: 'text' | 'photo') => { setAddModalMode(mode); setIsAddModalOpen(true); };
  const handleLogout = async () => { await authService.logout(); setCurrentUser(null); setErrors([]); };

  if (!authReady) return <div className="app-container" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Yükleniyor...</div>;
  if (!currentUser) return <OnboardingView onSuccess={setCurrentUser} />;

  return <div className="app-container">
    <main style={{ flex: 1 }}>
      {activeTab === 'dashboard' && <Dashboard user={currentUser} errors={errors} onOpenAddModal={handleOpenAdd} onSelectError={setSelectedError} onViewAllErrors={() => setActiveTab('errors')} onToggleFavorite={(id, fav) => handleUpdateError(id, { is_favorite: fav })} />}
      {activeTab === 'errors' && <MyErrors errors={errors} onSelectError={setSelectedError} onOpenAddModal={() => handleOpenAdd('text')} onOpenQuiz={() => setIsQuizModalOpen(true)} onToggleFavorite={(id, fav) => handleUpdateError(id, { is_favorite: fav })} onDeleteError={handleDeleteError} />}
      {activeTab === 'profile' && <Profile user={currentUser} errors={errors} theme={theme} onSetTheme={t => { setTheme(t); localStorage.setItem('tdk_theme', t); }} onLogout={handleLogout} onOpenAuth={() => setIsAuthModalOpen(true)} />}
    </main>
    <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
    <AddQuestionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleSaveAnalyzedQuestion} existingErrors={errors} initialMode={addModalMode} />
    {selectedError && <QuestionDetailModal errorItem={selectedError} onClose={() => setSelectedError(null)} onDelete={handleDeleteError} onUpdate={handleUpdateError} />}
    <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={user => { if (user) setCurrentUser(user); setIsAuthModalOpen(false); }} />
    <CustomQuizModal isOpen={isQuizModalOpen} onClose={() => setIsQuizModalOpen(false)} errors={errors} />
  </div>;
}

export default App;
