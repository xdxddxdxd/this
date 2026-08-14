import React, { useState, useEffect, useMemo } from 'react';
import { X, Clock, Award, Sparkles, CheckCircle2, XCircle, ArrowRight, ArrowLeft, RotateCcw, Sliders, Check, BookOpen, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserError } from '../types';
import { quizGeneratorService, DynamicQuizQuestion, QuizConfig } from '../services/quizGeneratorService';

interface CustomQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: UserError[];
}

export const CustomQuizModal: React.FC<CustomQuizModalProps> = ({
  isOpen,
  onClose,
  errors
}) => {
  // Modal Stages: 'setup' | 'exam' | 'results'
  const [stage, setStage] = useState<'setup' | 'exam' | 'results'>('setup');

  // Config State
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<'kolay' | 'orta' | 'zor'>('orta');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [durationMinutes, setDurationMinutes] = useState<number>(10);

  // Active Quiz State
  const [quizQuestions, setQuizQuestions] = useState<DynamicQuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);

  // Unique categories from user errors
  const categories = useMemo(() => {
    const set = new Set<string>();
    errors.forEach((e) => {
      if (e.rule_category) set.add(e.rule_category);
    });
    return ['Tümü', ...Array.from(set)];
  }, [errors]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStage('setup');
      setCurrentIdx(0);
      setUserAnswers({});
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
            clearInterval(interval);
            finishExam();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [stage, durationMinutes]);

  if (!isOpen) return null;

  // 1. START EXAM
  const handleStartExam = async () => {
    const config: QuizConfig = {
      questionCount,
      difficulty,
      selectedCategory,
      durationMinutes
    };

    const questions = await quizGeneratorService.generateCustomQuiz(errors, config);
    setQuizQuestions(questions);
    setCurrentIdx(0);
    setUserAnswers({});
    setTimeSpentSeconds(0);
    setRemainingSeconds(durationMinutes * 60);
    setStage('exam');
  };

  // 2. FINISH EXAM
  const finishExam = () => {
    setStage('results');
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D6303F', '#3F7D5C', '#FFD166']
    });
  };

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
      const userAns = userAnswers[idx];
      const cat = q.rule_category || 'Diğer';

      if (!categoryStats[cat]) {
        categoryStats[cat] = { correct: 0, total: 0 };
      }
      categoryStats[cat].total += 1;

      if (!userAns) {
        emptyCount += 1;
      } else if (userAns.toUpperCase() === q.wrong_option.toUpperCase()) {
        correctCount += 1;
        categoryStats[cat].correct += 1;
      } else {
        wrongCount += 1;
      }
    });

    const accuracyPct = quizQuestions.length > 0 ? Math.round((correctCount / quizQuestions.length) * 100) : 0;

    return {
      correctCount,
      wrongCount,
      emptyCount,
      totalCount: quizQuestions.length,
      accuracyPct,
      categoryStats
    };
  }, [quizQuestions, userAnswers]);

  const currentQ = quizQuestions[currentIdx];
  const optionKeys = ['A', 'B', 'C', 'D', 'E'] as const;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: stage === 'setup' ? '520px' : '580px', maxHeight: '92vh' }}
      >
        
        {/* =========================================================================
            STAGE 1: SETUP & CONFIGURATION SCREEN
           ========================================================================= */}
        {stage === 'setup' && (
          <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Setup Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--color-red-light)', color: 'var(--color-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sliders size={20} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                    Kişisel Sınav Oluşturucu
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Hata havuzundan yapay zekâ destekli özel test üret
                  </p>
                </div>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[5, 10, 15, Math.min(20, Math.max(errors.length, 5))].map((num, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    style={{
                      padding: '10px 6px',
                      borderRadius: '10px',
                      border: questionCount === num ? '2px solid var(--color-red)' : '1px solid var(--color-border)',
                      backgroundColor: questionCount === num ? 'var(--color-red-light)' : 'var(--bg-card)',
                      color: questionCount === num ? 'var(--color-red)' : 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    {num} Soru
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Zorluk Seviyesi */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Zorluk Seviyesi:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { key: 'kolay', label: '🟢 Kolay', desc: 'Temel Kurallar' },
                  { key: 'orta', label: '🟡 Orta', desc: 'TYT Seviyesi' },
                  { key: 'zor', label: '🔴 Zor', desc: 'ÖSYM Çeldirici' }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setDifficulty(item.key as any)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '10px',
                      border: difficulty === item.key ? '2px solid var(--color-red)' : '1px solid var(--color-border)',
                      backgroundColor: difficulty === item.key ? 'var(--color-red-light)' : 'var(--bg-card)',
                      textAlign: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: difficulty === item.key ? 'var(--color-red)' : 'var(--text-primary)' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Konu / Kural Filtresi */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Çalışmak İstediğin Konu:
              </label>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '20px',
                      border: selectedCategory === cat ? '1px solid var(--color-green-border)' : '1px solid var(--color-border)',
                      backgroundColor: selectedCategory === cat ? 'var(--color-green-light)' : 'var(--bg-card)',
                      color: selectedCategory === cat ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
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
              style={{ padding: '14px', fontSize: '1rem', marginTop: '6px', display: 'flex', justifyContent: 'center', gap: '8px' }}
            >
              <Sparkles size={20} /> Sınavı Başlat ({questionCount} Soru)
            </button>

          </div>
        )}

        {/* =========================================================================
            STAGE 2: LIVE EXAM INTERFACE
           ========================================================================= */}
        {stage === 'exam' && currentQ && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            
            {/* Top Bar: Progress, Timer, and Finish */}
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Soru {currentIdx + 1} / {quizQuestions.length}
                </span>
                <span className="rule-badge" style={{ fontSize: '0.72rem' }}>{currentQ.rule_category}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {durationMinutes > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.88rem', fontWeight: 700, color: remainingSeconds < 60 ? 'var(--color-red)' : 'var(--text-primary)' }}>
                    <Clock size={16} />
                    <span>{formatTime(remainingSeconds)}</span>
                  </div>
                )}
                <button
                  onClick={finishExam}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.78rem', color: 'var(--color-red)', borderColor: 'var(--color-red-border)' }}
                >
                  Sınavı Bitir
                </button>
              </div>
            </div>

            {/* Question Quick-Jump Pills */}
            <div style={{ display: 'flex', gap: '6px', padding: '10px 18px', backgroundColor: 'var(--bg-card-secondary)', overflowX: 'auto', borderBottom: '1px solid var(--color-border)' }}>
              {quizQuestions.map((_, i) => {
                const isAnswered = !!userAnswers[i];
                const isCurrent = i === currentIdx;

                let bg = 'var(--bg-card)';
                let border = '1px solid var(--color-border)';
                let color = 'var(--text-muted)';

                if (isCurrent) {
                  border = '2px solid var(--color-red)';
                  color = 'var(--color-red)';
                } else if (isAnswered) {
                  bg = 'var(--color-green-light)';
                  border = '1px solid var(--color-green-border)';
                  color = 'var(--text-primary)';
                }

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border,
                      backgroundColor: bg,
                      color,
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {/* Question Body */}
            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
              
              {/* Question Stem */}
              <div className="exam-paper-card" style={{ padding: '16px 18px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Yazım yanlışı olan seçeneği bulunuz:
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.55 }}>
                  {currentQ.question_text}
                </div>
              </div>

              {/* 5 Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {optionKeys.map((key) => {
                  const optText = currentQ.options[key];
                  if (!optText) return null;

                  const isSelected = userAnswers[currentIdx] === key;

                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setUserAnswers((prev) => ({ ...prev, [currentIdx]: key }));
                      }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid var(--color-red)' : '1px solid var(--color-border)',
                        backgroundColor: isSelected ? 'var(--color-red-light)' : 'var(--bg-card)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: isSelected ? 'var(--color-red)' : 'var(--text-secondary)', minWidth: '20px' }}>
                        {key})
                      </span>
                      <div style={{ flex: 1, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        {optText}
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Bottom Navigation Actions */}
            <div style={{ padding: '12px 18px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-card)' }}>
              <button
                className="btn-secondary"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                style={{ padding: '8px 14px', fontSize: '0.85rem', opacity: currentIdx === 0 ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeft size={16} /> Önceki
              </button>

              {currentIdx + 1 < quizQuestions.length ? (
                <button
                  className="btn-primary"
                  onClick={() => setCurrentIdx((prev) => prev + 1)}
                  style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Sonraki <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  className="btn-primary"
                  onClick={finishExam}
                  style={{ padding: '8px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Check size={16} /> Sınavı Tamamla
                </button>
              )}
            </div>

          </div>
        )}

        {/* =========================================================================
            STAGE 3: DETAILED EXAM ANALYSIS & SOLUTION REPORT
           ========================================================================= */}
        {stage === 'results' && (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto' }}>
            
            {/* Results Header */}
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-red-light)', color: 'var(--color-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                <Sparkles size={28} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 4px 0' }}>
                Sınav Sonuç Raporu
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {difficulty.toUpperCase()} Seviye • Toplam Süre: {formatTime(timeSpentSeconds)}
              </p>
            </div>

            {/* Score Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <div className="stat-counter-card" style={{ padding: '10px' }}>
                <div className="stat-label-top">Doğru</div>
                <div className="stat-number" style={{ fontSize: '1.6rem', color: 'var(--color-red)' }}>{resultsSummary.correctCount}</div>
                <div className="stat-label-bottom">soru</div>
              </div>

              <div className="stat-counter-card" style={{ padding: '10px' }}>
                <div className="stat-label-top">Yanlış / Boş</div>
                <div className="stat-number" style={{ fontSize: '1.6rem', color: 'var(--text-primary)' }}>
                  {resultsSummary.wrongCount + resultsSummary.emptyCount}
                </div>
                <div className="stat-label-bottom">soru</div>
              </div>

              <div className="stat-counter-card" style={{ padding: '10px' }}>
                <div className="stat-label-top">Başarı</div>
                <div className="stat-number" style={{ fontSize: '1.6rem' }}>%{resultsSummary.accuracyPct}</div>
                <div className="stat-label-bottom">doğruluk</div>
              </div>
            </div>

            {/* Category Performance Breakdown */}
            <div className="rule-explanation-card" style={{ padding: '12px 14px' }}>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.92rem', fontWeight: 700, marginBottom: '10px' }}>
                Kural Bazlı Başarı Analizi
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(resultsSummary.categoryStats).map(([cat, stat]) => {
                  const pct = Math.round((stat.correct / stat.total) * 100);
                  return (
                    <div key={cat}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 600 }}>{cat}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{stat.correct} / {stat.total} ({pct}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--bg-card-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pct >= 70 ? 'var(--color-red)' : 'var(--text-muted)', borderRadius: '4px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Question Review List */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>
                Soruların Çözümleri & TDK Gerekçeleri
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {quizQuestions.map((q, idx) => {
                  const userAns = userAnswers[idx];
                  const isCorrect = userAns && userAns.toUpperCase() === q.wrong_option.toUpperCase();
                  const targetOptText = q.options[q.wrong_option] || '';

                  return (
                    <div
                      key={q.id}
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        border: isCorrect ? '1px solid var(--color-border)' : '1px solid var(--color-red-border)',
                        borderRadius: '12px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>Soru {idx + 1}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isCorrect ? (
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-red)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <CheckCircle2 size={14} /> Doğru ({userAns})
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <XCircle size={14} /> Yanlış (Seçim: {userAns || 'Boş'} • Cevap: {q.wrong_option})
                            </span>
                          )}
                          <span className="rule-badge" style={{ fontSize: '0.68rem' }}>{q.rule_category}</span>
                        </div>
                      </div>

                      {/* Corrected Option Preview with Red Pen */}
                      <div style={{ backgroundColor: 'var(--bg-card-secondary)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.84rem', lineHeight: 1.6 }}>
                        <strong>{q.wrong_option})</strong>{' '}
                        <span>
                          <del className="struck-word">{q.wrong_word}</del>{' '}
                          <span className="correction-badge-inline">
                            <span className="caret-arrow">^</span>
                            <span>{q.correct_word}</span>
                          </span>{' '}
                          <span>— {targetOptText}</span>
                        </span>
                      </div>

                      {/* TDK Rule Explanation */}
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        <strong>TDK Açıklaması:</strong> {q.explanation}
                      </div>

                      {q.coach_note && (
                        <div style={{ fontFamily: 'var(--font-handwriting)', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                          💡 {q.coach_note}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Results Bottom Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                className="btn-primary"
                onClick={() => setStage('setup')}
                style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '6px' }}
              >
                <RotateCcw size={16} /> Yeni Ayarlarla Sınav Yap
              </button>
              <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                Bitir ve Kapat
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
