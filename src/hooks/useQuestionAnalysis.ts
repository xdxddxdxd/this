import { useRef, useState } from 'react';
import { AnalysisResult, UserError } from '../types';
import { geminiService } from '../services/geminiService';
import { groqService } from '../services/groqService';
import { splitQuestions, enrichOptionsWithPhrases } from '../services/questionSplitter';

interface StartAnalysisArgs {
  mode: 'text' | 'photo';
  inputText: string;
  imagePreview: string | null;
  existingErrors: UserError[];
}

/**
 * Soru analiz akışının durum makinesi: OCR/LLM çağrı zinciri,
 * ilerleme metni, iptal token'ı ve sonuç listesi.
 */
export function useQuestionAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgressText, setLoadingProgressText] = useState('Soru Analiz Ediliyor...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analyzedResults, setAnalyzedResults] = useState<AnalysisResult[]>([]);
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const cancelTokenRef = useRef(0);

  const cancelAnalysis = () => {
    cancelTokenRef.current++;
    setIsLoading(false);
    setLoadingProgressText('İptal Edildi');
  };

  const resetResults = () => {
    setAnalyzedResults([]);
    setActiveResultIndex(0);
    setErrorMsg(null);
  };

  /** Aktif sonucu listeden çıkarır (tek tek kaydetme akışı için). */
  const removeResultAt = (index: number) => {
    setAnalyzedResults((prev) => {
      const remaining = prev.filter((_, idx) => idx !== index);
      setActiveResultIndex(Math.min(index, remaining.length - 1));
      return remaining;
    });
  };

  const startAnalysis = async ({ mode, inputText, imagePreview, existingErrors }: StartAnalysisArgs) => {
    if (mode === 'text' && !inputText.trim()) return;
    if (mode === 'photo' && !imagePreview) return;

    setErrorMsg(null);
    setIsLoading(true);
    const token = ++cancelTokenRef.current;

    try {
      let questions: string[] = [];

      if (mode === 'photo' && imagePreview) {
        setLoadingProgressText('Fotoğraftaki soru ve şıklar taranıyor...');
        const ocrText = await geminiService.extractTextFromImage(imagePreview);
        if (cancelTokenRef.current !== token) return;

        if (!ocrText || ocrText.trim().length < 10) {
          setErrorMsg('Fotoğraftaki soru metni net okunamadı. Lütfen fotoğrafın daha net ve aydınlık olduğundan emin olun veya soruyu metin olarak yapıştırın.');
          setIsLoading(false);
          return;
        }
        questions = splitQuestions(ocrText).slice(0, 10);
      } else {
        questions = splitQuestions(inputText).slice(0, 10);
      }

      if (cancelTokenRef.current !== token) return;

      if (questions.length === 0) {
        setErrorMsg('Analiz edilecek geçerli bir soru bulunamadı.');
        setIsLoading(false);
        return;
      }

      if (questions.length === 1) {
        setLoadingProgressText('Soru analiz ediliyor...');
        const res = await groqService.analyzeTextWithLlama(questions[0], existingErrors);
        if (cancelTokenRef.current !== token) return;
        res.options = enrichOptionsWithPhrases(res.question_text, res.options || {});
        setAnalyzedResults([res]);
        setActiveResultIndex(0);
      } else {
        const batchResults: AnalysisResult[] = [];
        for (let i = 0; i < questions.length; i++) {
          if (cancelTokenRef.current !== token) return;
          setLoadingProgressText(`Soru ${i + 1} / ${questions.length} analiz ediliyor...`);
          const res = await groqService.analyzeTextWithLlama(questions[i], existingErrors);
          if (cancelTokenRef.current !== token) return;
          res.options = enrichOptionsWithPhrases(res.question_text, res.options || {});
          batchResults.push(res);
          if (i + 1 < questions.length) {
            await new Promise((r) => setTimeout(r, 350));
          }
        }
        if (cancelTokenRef.current !== token) return;
        setAnalyzedResults(batchResults);
        setActiveResultIndex(0);
      }
    } catch (err: any) {
      if (cancelTokenRef.current === token) {
        console.error('Analysis error:', err);
        setErrorMsg(err?.message || 'Analiz sırasında beklenmeyen bir hata oluştu.');
      }
    } finally {
      if (cancelTokenRef.current === token) {
        setIsLoading(false);
      }
    }
  };

  /** Modal kapanırken bekleyen analizleri geçersiz kılar. */
  const invalidate = () => {
    cancelTokenRef.current++;
    setIsLoading(false);
  };

  return {
    isLoading,
    loadingProgressText,
    errorMsg,
    setErrorMsg,
    analyzedResults,
    activeResultIndex,
    setActiveResultIndex,
    startAnalysis,
    cancelAnalysis,
    resetResults,
    removeResultAt,
    invalidate
  };
}
