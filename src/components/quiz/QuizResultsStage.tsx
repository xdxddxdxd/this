import React from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, MinusCircle, BookOpen, RotateCcw } from 'lucide-react';
import { DynamicQuizQuestion } from '../../services/quizGeneratorService';
import { HighlightedQuestionText } from '../HighlightedText';

export interface QuizCategoryStats {
  correct: number;
  total: number;
}

export interface QuizResultsSummary {
  total: number;
  correctCount: number;
  wrongCount: number;
  emptyCount: number;
  netScore: number;
  successRate: number;
  categoryStats: Record<string, QuizCategoryStats>;
}

export interface ReviewedQuestion {
  q: DynamicQuizQuestion;
  originalIndex: number;
  isCorrect: boolean;
  isWrong: boolean;
  isEmpty: boolean;
  userAnswer?: string;
}

export type ReviewFilter = 'all' | 'wrong' | 'correct' | 'empty';

interface QuizResultsStageProps {
  summary: QuizResultsSummary;
  totalQuestions: number;
  filteredQuestions: ReviewedQuestion[];
  reviewFilter: ReviewFilter;
  onReviewFilterChange: (filter: ReviewFilter) => void;
  expandedQuestions: Record<number, boolean>;
  onToggleExpand: (originalIndex: number) => void;
  onRestart: () => void;
  onClose: () => void;
}

interface SolutionCardProps {
  item: ReviewedQuestion;
  isExpanded: boolean;
  onToggle: () => void;
}

const SolutionCard: React.FC<SolutionCardProps> = ({ item, isExpanded, onToggle }) => {
  const { q, originalIndex, isCorrect, isWrong, isEmpty, userAnswer } = item;

  return (
    <div
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
        onClick={onToggle}
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
};

export const QuizResultsStage: React.FC<QuizResultsStageProps> = ({
  summary,
  totalQuestions,
  filteredQuestions,
  reviewFilter,
  onReviewFilterChange,
  expandedQuestions,
  onToggleExpand,
  onRestart,
  onClose
}) => {
  const filterTabs: { key: ReviewFilter; label: string }[] = [
    { key: 'all', label: `Tümü (${totalQuestions})` },
    { key: 'wrong', label: `Yanlışlarım (${summary.wrongCount})` },
    { key: 'correct', label: `Doğrularım (${summary.correctCount})` },
    { key: 'empty', label: `Boşlar (${summary.emptyCount})` }
  ];

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
      {/* Results Header */}
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '2.5rem' }}>
          {summary.successRate >= 80 ? '🎉' : summary.successRate >= 50 ? '👏' : '📚'}
        </span>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0' }}>
          Sınav Analiz Raporu
        </h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
          {summary.successRate >= 80
            ? 'Harika bir performans! Yazım kurallarına oldukça hâkimsin.'
            : summary.successRate >= 50
            ? 'İyi bir tekrar oldu, karıştırılan kuralları incelemeye devam et.'
            : 'Bu konularda biraz daha pratik yapman faydalı olacaktır.'}
        </p>
      </div>

      {/* Scorecard Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        <div style={{ backgroundColor: 'var(--bg-card-secondary)', padding: '12px 8px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#22c55e' }}>
            {summary.correctCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Doğru</div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card-secondary)', padding: '12px 8px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-red)' }}>
            {summary.wrongCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Yanlış</div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card-secondary)', padding: '12px 8px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-muted)' }}>
            {summary.emptyCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Boş</div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card-secondary)', padding: '12px 8px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            %{summary.successRate}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Başarı</div>
        </div>
      </div>

      {/* Category Performance Breakdown */}
      <div>
        <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '10px' }}>Konu Bazlı Başarı</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Object.entries(summary.categoryStats).map(([cat, stats]) => {
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
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onReviewFilterChange(tab.key)}
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
          {filteredQuestions.map((item) => {
            const isExpanded = expandedQuestions[item.originalIndex] !== false;
            return (
              <SolutionCard
                key={item.q.id}
                item={item}
                isExpanded={isExpanded}
                onToggle={() => onToggleExpand(item.originalIndex)}
              />
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
        <button
          className="btn-primary"
          style={{ flex: 1 }}
          onClick={onRestart}
        >
          <RotateCcw size={16} /> Yeni Test Başlat
        </button>
        <button className="btn-secondary" onClick={onClose}>
          Kapat
        </button>
      </div>
    </div>
  );
};
