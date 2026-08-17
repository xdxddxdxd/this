import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UserError } from '../types';
import { quizGeneratorService, DynamicQuizQuestion, QuizConfig } from '../services/quizGeneratorService';
import { useQuizTimer } from '../hooks/useQuizTimer';
import { fireConfetti } from '../utils/celebrate';
import { QuizSetupStage, QuizDifficulty } from './quiz/QuizSetupStage';
import { QuizExamStage } from './quiz/QuizExamStage';
import { QuizResultsStage, QuizResultsSummary, ReviewedQuestion, ReviewFilter } from './quiz/QuizResultsStage';

interface CustomQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors?: UserError[];
}

type QuizStage = 'setup' | 'exam' | 'results';

export const CustomQuizModal: React.FC<CustomQuizModalProps> = ({
  isOpen,
  onClose,
  errors = []
}) => {
  // Modal Stages: 'setup' | 'exam' | 'results'
  const [stage, setStage] = useState<QuizStage>('setup');

  const safeErrors = useMemo(() => (Array.isArray(errors) ? errors : []), [errors]);

  // Config State
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('orta');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [durationMinutes, setDurationMinutes] = useState<number>(10);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Active Quiz State
  const [quizQuestions, setQuizQuestions] = useState<DynamicQuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});

  // Results Review State
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});

  const finishExam = useCallback(() => {
    setStage('results');
    fireConfetti({
      particleCount: 75,
      origin: { y: 0.6 },
      colors: ['#D6303F', '#3F7D5C', '#FFD166']
    });
  }, []);

  const { remainingSeconds, start: startTimer } = useQuizTimer({
    isActive: stage === 'exam',
    durationMinutes,
    onExpire: finishExam
  });

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

  // Calculate score and statistics
  const resultsSummary = useMemo<QuizResultsSummary>(() => {
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
  const filteredQuestions = useMemo<ReviewedQuestion[]>(() => {
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
        startTimer(durationMinutes);
        setStage('exam');
      }
    } catch (err) {
      console.error('Quiz start error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleExpand = (originalIndex: number) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [originalIndex]: prev[originalIndex] === false ? true : false
    }));
  };

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
        {stage === 'setup' && (
          <QuizSetupStage
            questionCount={questionCount}
            onQuestionCountChange={setQuestionCount}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            durationMinutes={durationMinutes}
            onDurationChange={setDurationMinutes}
            categories={categories}
            availableQuestionCounts={availableQuestionCounts}
            isGenerating={isGenerating}
            onStart={handleStartExam}
            onClose={onClose}
          />
        )}

        {stage === 'exam' && quizQuestions[currentIdx] && (
          <QuizExamStage
            currentQ={quizQuestions[currentIdx]}
            currentIdx={currentIdx}
            totalQuestions={quizQuestions.length}
            durationMinutes={durationMinutes}
            remainingSeconds={remainingSeconds}
            userAnswer={userAnswers[currentIdx]}
            onAnswer={(optionKey) => setUserAnswers((prev) => ({ ...prev, [currentIdx]: optionKey }))}
            onPrev={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
            onNext={() => setCurrentIdx((prev) => Math.min(quizQuestions.length - 1, prev + 1))}
            onFinish={finishExam}
          />
        )}

        {stage === 'results' && (
          <QuizResultsStage
            summary={resultsSummary}
            totalQuestions={quizQuestions.length}
            filteredQuestions={filteredQuestions}
            reviewFilter={reviewFilter}
            onReviewFilterChange={setReviewFilter}
            expandedQuestions={expandedQuestions}
            onToggleExpand={handleToggleExpand}
            onRestart={() => {
              setStage('setup');
              setCurrentIdx(0);
              setUserAnswers({});
            }}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};
