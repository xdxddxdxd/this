import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Clock, Play, ArrowRight, ArrowLeft, RotateCcw, Sliders, Check, ChevronDown, ChevronUp, CheckCircle2, XCircle, MinusCircle, BookOpen, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserError } from '../types';
import { quizGeneratorService, DynamicQuizQuestion, QuizConfig } from '../services/quizGeneratorService';
import { HighlightedQuestionText } from './HighlightedText';
import { enrichOptionsWithPhrases } from '../services/questionSplitter';

interface CustomQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors?: UserError[];
}

export const CustomQuizModal: React.FC<CustomQuizModalProps> = ({
  isOpen,
  onClose,
  errors = []
}) => {
  // Modal Stages: 'setup' | 'exam' | 'results'
  const [stage, setStage] = useState<'setup' | 'exam' | 'results'>('setup');

  const safeErrors = useMemo(() => (Array.isArray(errors) ? errors : []), [errors]);

  // Config State
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<'kolay' | 'orta' | 'zor'>('orta');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [durationMinutes, setDurationMinutes] = useState<number>(10);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Active Quiz State
  const [quizQuestions, setQuizQuestions] = useState<DynamicQuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);

  // Results Review State
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong' | 'correct' | 'empty'>('all');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});

  // Finish Exam handler wrapped in useCallback
  const finishExam = useCallback(() => {
    setStage('results');
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D6303F', '#3F7D5C', '#FFD166']
      });
    } catch {
      // Ignore confetti if unsupported
    }
  }, []);

  // Esc key listener for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stage !== 'exam') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, stage, onClose]);

  // Unique categories from user errors
  const categories = useMemo(() => {
    const set = new Set<string>();
    safeErrors.forEach((e) => {
      if (e && e.rule_category) set.add(e.rule_category);
    });
    return ['Tümü', ...Array.from(set)];
  }, [safeErrors]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStage('setup');
      setCurrentIdx(0);
      setUserAnswers({});
      setIsGenerating(false);
    }
  }, [isOpen]);

  // Live countdown timer during exam
  useEffect(() => {
    if (stage !== 'exam') return;

    const interval = setInterval(() => {
      setTimeSpentSeconds((prev) => prev + 1);

      if (durationMinutes > 0) {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [stage, durationMinutes]);

  // Finish exam when time expires (isolated from timer updater)
  useEffect(() => {
    if (stage === 'exam' && durationMinutes > 0 && remainingSeconds === 0 && timeSpentSeconds > 0) {
      finishExam();
    }
  }, [stage, durationMinutes, remainingSeconds, timeSpentSeconds, finishExam]);

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate score and statistics
  const resultsSummary = useMemo(() => {
    let correctCount = 0;
    let wrongCount = 0;
    let emptyCount = 0;

    const categoryStats: Record<string, { correct: number; total: number }> = {};

    quizQuestions.forEach((q, idx) => {
      if (!q) return;
      const ans = userAnswers[idx];
      const cat = q.rule_category || 'Yazım Kuralları';

      if (!categoryStats[cat]) {
        categoryStats[cat] = { correct: 0, total: 0 };
      }
      categoryStats[cat].total += 1;

      const targetWrong = (q.wrong_option || 'A').toUpperCase();
      if (!ans) {
        emptyCount += 1;
      } else if (ans.toUpperCase() === targetWrong) {
        correctCount += 1;
        categoryStats[cat].correct += 1;
      } else {
        wrongCount += 1;
      }
    });

    const netScore = Math.max(0, correctCount - wrongCount * 0.25);
    const successRate = quizQuestions.length > 0 ? Math.round((correctCount / quizQuestions.length) * 100) : 0;

    return {
      total: quizQuestions.length,
      correctCount,
      wrongCount,
      emptyCount,
      netScore,
      successRate,
      categoryStats
    };
  }, [quizQuestions, userAnswers]);

  // Filtered Questions for Results Review
  const filteredQuestions = useMemo(() => {
    return quizQuestions.map((q, idx) => {
      const userAnswer = userAnswers[idx];
      const isCorrect = Boolean(userAnswer && userAnswer.toUpperCase() === q.wrong_option.toUpperCase());
      const isEmpty = !userAnswer;
      const isWrong = Boolean(userAnswer && !isCorrect);
      return { q, originalIndex: idx, isCorrect, isWrong, isEmpty, userAnswer };
    }).filter((item) => {
      if (reviewFilter === 'wrong') return item.isWrong;
      if (reviewFilter === 'correct') return item.isCorrect;
      if (reviewFilter === 'empty') return item.isEmpty;
      return true;
    });
  }, [quizQuestions, userAnswers, reviewFilter]);

  if (!isOpen) return null;

  // 1. START EXAM
  const handleStartExam = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const config: QuizConfig = {
        questionCount,
        difficulty,
        selectedCategory,
        durationMinutes
      };

      const questions = await quizGeneratorService.generateCustomQuiz(safeErrors, config);
      if (questions && questions.length > 0) {
        setQuizQuestions(questions);
        setCurrentIdx(0);
        setUserAnswers({});
        setTimeSpentSeconds(0);
        setRemainingSeconds(durationMinutes * 60);
        setStage('exam');
      }
    } catch (err) {
      console.error('Quiz start error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentQ = quizQuestions[currentIdx];
  const optionKeys = ['A', 'B', 'C', 'D', 'E'] as const;

  const difficultyOptions: { key: 'kolay' | 'orta' | 'zor'; label: string; desc: string }[] = [
    { key: 'kolay', label: '🟢 Kolay', desc: 'Temel Kurallar' },
    { key: 'orta', label: '🟡 Orta', desc: 'TYT Seviyesi' },
    { key: 'zor', label: '🔴 Zor', desc: 'ÖSYM Çeldirici' }
  ];

  const availableQuestionCounts = Array.from(
    new Set([5, 10, 15, Math.min(20, Math.max(safeErrors.length, 5))])
  ).sort((a, b) => a - b);

  return (
    <div className="modal-overlay" onClick={stage === 'exam' ? undefined : onClose} role="dialog" aria-modal="true">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* =========================================================================
            STAGE 1: QUIZ SETUP CONFIGURATION
            ========================================================================= */}
        {stage === 'setup' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'var(--color-red-light)', color: 'var(--color-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sliders size={22} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                  Kişisel Sınav Oluşturucu
                </h3>
              </div>

              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* 1. Soru Sayısı Seçimi */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Soru Sayısı:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${availableQuestionCounts.length}, 1fr)`, gap: '8px' }}>
                {availableQuestionCounts.map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    style={{
                      padding: '9px',
                      borderRadius: '10px',
                      border: questionCount === count ? '2px solid var(--color-red)' : '1px solid var(--color-border)',
                      backgroundColor: questionCount === count ? 'var(--color-red-light)' : 'var(--bg-card)',
                      color: questionCount === count ? 'var(--color-red)' : 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer'
                    }}
                  >
                    {count} Soru
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Zorluk Derecesi */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Zorluk Seviyesi:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {difficultyOptions.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setDifficulty(opt.key)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '10px',
                      border: difficulty === opt.key ? '2px solid var(--color-red)' : '1px solid var(--color-border)',
                      backgroundColor: difficulty === opt.key ? 'var(--color-red-light)' : 'var(--bg-card)',
                      color: difficulty === opt.key ? 'var(--color-red)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px'
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>{opt.label}</span>
                    <span style={{ fontSize: '0.68rem', color: difficulty === opt.key ? 'var(--color-red)' : 'var(--text-muted)' }}>
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Kategori Seçimi */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Kural Kategorisi:
              </label>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: selectedCategory === cat ? '1px solid var(--color-red)' : '1px solid var(--color-border)',
                      backgroundColor: selectedCategory === cat ? 'var(--color-red-light)' : 'var(--bg-card)',
                      color: selectedCategory === cat ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Sınav Süresi */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Sınav Süresi:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { mins: 0, label: 'Süresiz' },
                  { mins: 5, label: '5 Dakika' },
                  { mins: 10, label: '10 Dakika' },
                  { mins: 15, label: '15 Dakika' }
                ].map((t) => (
                  <button
                    key={t.mins}
                    type="button"
                    onClick={() => setDurationMinutes(t.mins)}
                    style={{
                      padding: '9px 4px',
                      borderRadius: '10px',
                      border: durationMinutes === t.mins ? '2px solid var(--color-red)' : '1px solid var(--color-border)',
                      backgroundColor: durationMinutes === t.mins ? 'var(--color-red-light)' : 'var(--bg-card)',
                      color: durationMinutes === t.mins ? 'var(--color-red)' : 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              className="btn-primary"
              onClick={handleStartExam}
              disabled={isGenerating}
              style={{ padding: '14px', fontSize: '1rem', marginTop: '6px', display: 'flex', justifyContent: 'center', gap: '8px' }}
            >
              <Play size={18} fill="currentColor" />
              {isGenerating ? 'Sınav Hazırlanıyor...' : `Sınavı Başlat (${questionCount} Soru)`}
            </button>

          </div>
        )}

        {/* =========================================================================
            STAGE 2: LIVE EXAM INTERFACE
            ========================================================================= */}
        {stage === 'exam' && currentQ && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            
            {/* Exam Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-red)' }}>
                  Soru {currentIdx + 1}/{quizQuestions.length}
                </span>
                <span className="rule-badge">
                  {currentQ.rule_category || 'Yazım Kuralı'}
                </span>
              </div>

              {durationMinutes > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-card-secondary)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, color: remainingSeconds < 60 ? 'var(--color-red)' : 'var(--text-primary)' }}>
                  <Clock size={15} />
                  <span>{formatTime(remainingSeconds)}</span>
                </div>
              )}
            </div>

            {/* Exam Body */}
            <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
              <div style={{ fontSize: '0.96rem', fontWeight: 600, lineHeight: 1.55, marginBottom: '20px' }}>
                <HighlightedQuestionText text={currentQ.question_text} />
              </div>

              {/* Options Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {optionKeys.map((k) => {
                  const optText = (currentQ.options as any)?.[k];
                  if (!optText) return null;
                  const isSelected = userAnswers[currentIdx] === k;

                  return (
                    <div
                      key={k}
                      onClick={() => setUserAnswers((prev) => ({ ...prev, [currentIdx]: k }))}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid var(--color-red)' : '1px solid var(--color-border)',
                        backgroundColor: isSelected ? 'var(--color-red-light)' : 'var(--bg-card)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: isSelected ? '2px solid var(--color-red)' : '1px solid var(--color-border)',
                          backgroundColor: isSelected ? 'var(--color-red)' : 'transparent',
                          color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.78rem'
                        }}
                      >
                        {k}
                      </div>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {optText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Exam Footer Navigation */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                className="btn-secondary"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              >
                <ArrowLeft size={16} /> Önceki
              </button>

              <button
                type="button"
                onClick={finishExam}
                style={{ background: 'none', border: 'none', color: 'var(--color-red)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Sınavı Bitir
              </button>

              {currentIdx === quizQuestions.length - 1 ? (
                <button className="btn-primary" onClick={finishExam}>
                  <Check size={16} /> Bitir ve Sonuçlar
                </button>
              ) : (
                <button
                  className="btn-primary"
                  onClick={() => setCurrentIdx((prev) => Math.min(quizQuestions.length - 1, prev + 1))}
                >
                  Sonraki <ArrowRight size={16} />
                </button>
              )}
            </div>

          </div>
        )}

        {/* =========================================================================
            STAGE 3: EXAM RESULTS & PERFORMANCE BREAKDOWN
            ========================================================================= */}
        {stage === 'results' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
            
            {/* Results Header */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '2.5rem' }}>
                {resultsSummary.successRate >= 80 ? '🎉' : resultsSummary.successRate >= 50 ? '👏' : '📚'}
              </span>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>
                Sınav Analiz Raporu
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
                {resultsSummary.successRate >= 80
                  ? 'Harika bir performans! Yazım kurallarına oldukça hâkimsin.'
                  : resultsSummary.successRate >= 50
                  ? 'İyi bir tekrar oldu, karıştırılan kuralları incelemeye devam et.'
                  : 'Bu konularda biraz daha pratik yapman faydalı olacaktır.'}
              </p>
            </div>

            {/* Scorecard Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              <div style={{ backgroundColor: 'var(--bg-card-secondary)', padding: '12px 8px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#22c55e' }}>
                  {resultsSummary.correctCount}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Doğru</div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-card-secondary)', padding: '12px 8px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-red)' }}>
                  {resultsSummary.wrongCount}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Yanlış</div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-card-secondary)', padding: '12px 8px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                  {resultsSummary.emptyCount}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Boş</div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-card-secondary)', padding: '12px 8px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  %{resultsSummary.successRate}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Başarı</div>
              </div>
            </div>

            {/* Category Performance Breakdown */}
            <div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '10px' }}>Konu Bazlı Başarı</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(resultsSummary.categoryStats).map(([cat, stats]) => {
                  const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                  return (
                    <div key={cat} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', padding: '10px 14px', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        <span>{cat}</span>
                        <span>{stats.correct}/{stats.total} (%{pct})</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: 'var(--bg-card-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pct >= 70 ? '#22c55e' : 'var(--color-red)', borderRadius: '3px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Questions Section */}
            <div style={{ borderTop: '1px dashed var(--color-border-dashed)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={18} color="var(--color-red)" />
                  Soru Çözümleri & Detaylı Analiz
                </h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {filteredQuestions.length} soru listeleniyor
                </span>
              </div>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '2px' }}>
                {[
                  { key: 'all', label: `Tümü (${quizQuestions.length})` },
                  { key: 'wrong', label: `Yanlışlarım (${resultsSummary.wrongCount})`, color: 'var(--color-red)' },
                  { key: 'correct', label: `Doğrularım (${resultsSummary.correctCount})`, color: '#22c55e' },
                  { key: 'empty', label: `Boşlar (${resultsSummary.emptyCount})` }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setReviewFilter(tab.key as any)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      border: reviewFilter === tab.key ? '1px solid var(--color-red)' : '1px solid var(--color-border)',
                      backgroundColor: reviewFilter === tab.key ? 'var(--color-red-light)' : 'var(--bg-card-secondary)',
                      color: reviewFilter === tab.key ? 'var(--color-red)' : 'var(--text-secondary)',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Questions Solution Cards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredQuestions.map(({ q, originalIndex, isCorrect, isWrong, isEmpty, userAnswer }) => {
                  const isExpanded = expandedQuestions[originalIndex] !== false;

                  return (
                    <div
                      key={q.id}
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        border: `1px solid ${isWrong ? 'var(--color-red-border)' : isCorrect ? 'rgba(34, 197, 94, 0.35)' : 'var(--color-border)'}`,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      {/* Question Summary Bar */}
                      <div
                        onClick={() => setExpandedQuestions((prev) => ({ ...prev, [originalIndex]: !isExpanded }))}
                        style={{
                          padding: '12px 14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          backgroundColor: isWrong ? 'var(--color-red-light)' : isCorrect ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-card-secondary)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            Soru {originalIndex + 1}
                          </span>

                          {isCorrect && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.15)', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <CheckCircle2 size={12} /> Doğru ({userAnswer})
                            </span>
                          )}

                          {isWrong && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-red)', backgroundColor: 'rgba(255, 77, 94, 0.18)', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <XCircle size={12} /> Yanlış (Senin: {userAnswer} ➔ Doğru: {q.wrong_option})
                            </span>
                          )}

                          {isEmpty && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', backgroundColor: 'var(--color-border)', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <MinusCircle size={12} /> Boş (Doğru: {q.wrong_option})
                            </span>
                          )}

                          <span className="rule-badge" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                            {q.rule_category}
                          </span>
                        </div>

                        <div style={{ color: 'var(--text-muted)' }}>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>

                      {/* Expanded Solution Body */}
                      {isExpanded && (
                        <div style={{ padding: '14px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.45, color: 'var(--text-primary)' }}>
                            <HighlightedQuestionText
                              text={q.question_text}
                              wrongWord={q.wrong_word}
                              correctWord={q.correct_word}
                            />
                          </div>

                          {/* Options */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {(['A', 'B', 'C', 'D', 'E'] as const).map((optKey) => {
                              const isTargetWrong = q.wrong_option?.toUpperCase() === optKey;
                              const isChosen = userAnswer?.toUpperCase() === optKey;
                              const optText = q.options[optKey] || '';

                              let optBorder = '1px solid var(--color-border)';
                              let optBg = 'transparent';
                              if (isTargetWrong) {
                                optBorder = '1px solid rgba(34, 197, 94, 0.5)';
                                optBg = 'rgba(34, 197, 94, 0.08)';
                              } else if (isChosen && !isTargetWrong) {
                                optBorder = '1px solid var(--color-red-border)';
                                optBg = 'var(--color-red-light)';
                              }

                              const wrongWord = q.wrong_word;
                              const correctWord = q.correct_word;
                              const idx = wrongWord ? optText.toLocaleLowerCase('tr-TR').indexOf(wrongWord.toLocaleLowerCase('tr-TR')) : -1;

                              return (
                                <div
                                  key={optKey}
                                  style={{
                                    padding: '8px 10px',
                                    borderRadius: '8px',
                                    border: optBorder,
                                    backgroundColor: optBg,
                                    fontSize: '0.82rem',
                                    lineHeight: 1.4,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    gap: '6px'
                                  }}
                                >
                                  <div style={{ flex: 1 }}>
                                    <strong style={{ color: isTargetWrong ? '#22c55e' : isChosen ? 'var(--color-red)' : 'var(--text-secondary)' }}>
                                      {optKey})
                                    </strong>{' '}
                                    {isTargetWrong && idx !== -1 ? (
                                      <span>
                                        {optText.substring(0, idx)}
                                        <del className="struck-word">{optText.substring(idx, idx + wrongWord.length)}</del>
                                        <span className="correction-badge-inline">
                                          <span className="caret-arrow">^</span>
                                          <span>{correctWord}</span>
                                        </span>
                                        {optText.substring(idx + wrongWord.length)}
                                      </span>
                                    ) : (
                                      <span>{optText}</span>
                                    )}
                                  </div>

                                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                    {isTargetWrong && (
                                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.2)', padding: '1px 5px', borderRadius: '4px' }}>
                                        ✓ Doğru Cevap (Hatalı Şık)
                                      </span>
                                    )}
                                    {isChosen && !isTargetWrong && (
                                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-red)', backgroundColor: 'rgba(255, 77, 94, 0.2)', padding: '1px 5px', borderRadius: '4px' }}>
                                        ✗ Senin Yanıtın
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Rule Explanation */}
                          <div className="rule-explanation-card" style={{ padding: '10px 12px', marginTop: '4px' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                              TDK Açıklaması:
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                              {q.explanation}
                            </div>
                          </div>

                          {q.coach_note && (
                            <div className="coach-note-card" style={{ padding: '12px 14px' }}>
                              <div className="coach-note-header" style={{ fontSize: '0.75rem' }}>KOÇ NOTU</div>
                              <div className="coach-note-content">
                                <span className="coach-handwriting-icon" aria-hidden="true">!</span>
                                <div className="coach-note-text" style={{ fontSize: '1.18rem' }}>
                                  {q.coach_note}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                className="btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  setStage('setup');
                  setCurrentIdx(0);
                  setUserAnswers({});
                }}
              >
                <RotateCcw size={16} /> Yeni Test Başlat
              </button>
              <button className="btn-secondary" onClick={onClose}>
                Kapat
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
