import { jsPDF } from 'jspdf';
import { Question, ExamTrack } from '../types';
import { QUESTION_BANK_1000, getQuestionsForExamTrack } from '../data/examQuestions';

export interface PdfExportOptions {
  track: ExamTrack | 'all';
  includeSolutions: boolean;
  maxQuestions?: number;
  onProgress?: (processed: number, total: number, message: string) => void;
}

export function getStreamLabel(track: ExamTrack | 'all'): string {
  switch (track) {
    case 'prt':
      return 'Primary Teacher (PRT - Paper I)';
    case 'gt-maths-science':
      return 'Graduate Teacher (GT Maths & Science - Paper II)';
    case 'gt-humanities':
      return 'Graduate Teacher (GT Humanities & Social Science - Paper II)';
    case 'all':
    default:
      return 'All Streams (Complete Master Question Bank)';
  }
}

export function getStreamShortCode(track: ExamTrack | 'all'): string {
  switch (track) {
    case 'prt':
      return 'PRT_Paper_I';
    case 'gt-maths-science':
      return 'GT_Maths_Science_Paper_II';
    case 'gt-humanities':
      return 'GT_Humanities_Paper_II';
    case 'all':
    default:
      return 'All_Streams_Master';
  }
}

/**
 * Generates and downloads a publication-grade PDF document containing questions
 * for the requested stream or all streams.
 * Chunked asynchronously to ensure zero UI freezing even with 1,000+ items.
 */
export async function generateQuestionBankPdf(options: PdfExportOptions): Promise<{ success: boolean; totalExported: number }> {
  const { track, includeSolutions, maxQuestions, onProgress } = options;

  let questionsToExport = getQuestionsForExamTrack(track);
  if (maxQuestions && maxQuestions > 0 && maxQuestions < questionsToExport.length) {
    questionsToExport = questionsToExport.slice(0, maxQuestions);
  }

  const total = questionsToExport.length;
  if (total === 0) {
    throw new Error('No questions found for the selected stream.');
  }

  const streamLabel = getStreamLabel(track);
  const streamCode = getStreamShortCode(track);

  onProgress?.(0, total, 'Initializing PDF document layout...');
  await new Promise((resolve) => setTimeout(resolve, 20));

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const footerReserved = 15;
  const maxY = pageHeight - footerReserved;

  let cursorY = 20;

  // --- COVER / TITLE BANNER (Page 1) ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, cursorY - 4, contentWidth, 36, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('STUDEEZONE.COM • STET OFFICIAL QUESTION BANK', margin + 6, cursorY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(251, 191, 36); // amber-400
  doc.text(`Target Stream: ${streamLabel}`, margin + 6, cursorY + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(
    `Total Questions: ${total} | Export Mode: ${includeSolutions ? 'With Detailed Solutions & Pedagogical Explanations' : 'Question Paper Only (Answer Key in Appendix)'} | Date: ${new Date().toLocaleDateString()}`,
    margin + 6,
    cursorY + 24
  );

  cursorY += 44;

  // Overview box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, cursorY, contentWidth, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('OFFICIAL SYLLABUS & PEDAGOGICAL COVERAGE:', margin + 4, cursorY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const infoText = 'Covers Child Development & Pedagogy (CDP), NEP 2020, RPwD Act 2016, Social Science, Mathematics, Science, Environmental Studies (EVS), English Language & Comprehension, and Sikkim Localized Curricula.';
  const infoLines = doc.splitTextToSize(infoText, contentWidth - 8);
  doc.text(infoLines, margin + 4, cursorY + 12);

  cursorY += 28;

  const optionLabels = ['A', 'B', 'C', 'D'];
  const answerKeyMap: { qNum: number; id: string; correctLetter: string; category: string }[] = [];

  // Render questions in chunks to keep browser completely responsive
  const chunkSize = 25;
  for (let i = 0; i < total; i++) {
    if (i % chunkSize === 0) {
      onProgress?.(i, total, `Formatting questions (${i} of ${total})...`);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    const q = questionsToExport[i];
    const qNum = i + 1;
    const correctLetter = optionLabels[q.correctIndex] || 'A';
    answerKeyMap.push({ qNum, id: q.id, correctLetter, category: q.category });

    // Measure needed height for this question to decide if page break is needed
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    const qLines = doc.splitTextToSize(`Q${qNum}. ${q.question}`, contentWidth - 4);
    let neededHeight = 7 + qLines.length * 4.5 + q.options.length * 4.5 + 4;

    if (includeSolutions) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const explLines = doc.splitTextToSize(`Explanation: ${q.explanation || 'Refer to standard NCERT/SCERT curriculum.'}`, contentWidth - 6);
      neededHeight += 6 + explLines.length * 3.8 + 6;
    }

    if (cursorY + neededHeight > maxY) {
      doc.addPage();
      cursorY = 20;
    }

    // Question Header Tag (Category & Year badge)
    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(margin, cursorY - 3, contentWidth, 6, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text(`[${q.category.toUpperCase()}]`, margin + 3, cursorY + 1.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // slate-500
    const metaTag = `Topic: ${q.topic || 'General Pedagogy'} • Exam Year: ${q.year || '2025'} • Diff: ${q.difficulty || 'Medium'}`;
    doc.text(metaTag, margin + 35, cursorY + 1.2);

    cursorY += 7;

    // Question Text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(qLines, margin + 2, cursorY);
    cursorY += qLines.length * 4.5 + 2;

    // Options (A, B, C, D)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    q.options.forEach((opt, optIdx) => {
      const optLetter = optionLabels[optIdx] || `${optIdx + 1}`;
      const isCorrect = includeSolutions && optIdx === q.correctIndex;

      if (isCorrect) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(5, 150, 105); // emerald-600
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85); // slate-700
      }

      const optLines = doc.splitTextToSize(`(${optLetter}) ${opt}`, contentWidth - 8);
      doc.text(optLines, margin + 4, cursorY);
      cursorY += optLines.length * 4.2;
    });

    cursorY += 2;

    // Solution & Explanation (if requested)
    if (includeSolutions) {
      doc.setFillColor(236, 253, 245); // emerald-50
      doc.setDrawColor(167, 243, 208); // emerald-200
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);

      const explText = `Explanation: ${q.explanation || 'Based on official STET benchmark curriculum standards.'}`;
      const explLines = doc.splitTextToSize(explText, contentWidth - 8);
      const boxHeight = 7 + explLines.length * 3.8;

      doc.roundedRect(margin + 2, cursorY, contentWidth - 4, boxHeight, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(6, 95, 70); // emerald-800
      doc.text(`Correct Option: (${correctLetter}) ${q.options[q.correctIndex] || ''}`, margin + 5, cursorY + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(4, 120, 87); // emerald-700
      doc.text(explLines, margin + 5, cursorY + 9);

      cursorY += boxHeight + 4;
    }

    // Divider line between questions
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(margin, cursorY, margin + contentWidth, cursorY);
    cursorY += 5;
  }

  // --- APPENDIX: ANSWER KEY GRID (If Solutions Were Not In-Line) ---
  if (!includeSolutions) {
    onProgress?.(total, total, 'Generating final Answer Key appendix...');
    doc.addPage();
    cursorY = 20;

    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin, cursorY, contentWidth, 14, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text('OFFICIAL ANSWER KEY APPENDIX', margin + 6, cursorY + 9);
    cursorY += 20;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    const cols = 5;
    const colWidth = contentWidth / cols;
    let colIdx = 0;
    let colStartY = cursorY;

    answerKeyMap.forEach((item, idx) => {
      if (cursorY > maxY) {
        colIdx++;
        if (colIdx >= cols) {
          doc.addPage();
          cursorY = 20;
          colStartY = 20;
          colIdx = 0;
        } else {
          cursorY = colStartY;
        }
      }

      const x = margin + colIdx * colWidth;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`Q${item.qNum}:`, x + 1, cursorY);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 150, 105);
      doc.text(`(${item.correctLetter})`, x + 13, cursorY);

      cursorY += 4.5;
    });
  }

  // --- FOOTERS & HEADERS (Numbering) ---
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Header on pages > 1
    if (p > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`studeezone.com • STET Complete Question Bank • ${streamLabel}`, margin, 10);
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, 12, margin + contentWidth, 12);
    }

    // Footer on all pages
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `studeezone.com • Confidential Preparation & Backup • Page ${p} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  onProgress?.(total, total, 'Finalizing PDF download...');
  await new Promise((resolve) => setTimeout(resolve, 30));

  const safeDate = new Date().toISOString().split('T')[0];
  const modeSuffix = includeSolutions ? 'with_solutions' : 'questions_only';
  const fileName = `studeezone_STET_${streamCode}_${total}_questions_${modeSuffix}_${safeDate}.pdf`;

  doc.save(fileName);

  return { success: true, totalExported: total };
}

/**
 * Exports complete Question Bank as structured JSON for complete offline backup.
 * Can be re-uploaded if app ever crashes.
 */
export function exportQuestionBankJSON(track: ExamTrack | 'all'): { total: number; fileName: string } {
  const questions = getQuestionsForExamTrack(track);
  const streamLabel = getStreamLabel(track);
  const streamCode = getStreamShortCode(track);

  const payload = {
    app: 'studeezone.com',
    type: 'question-bank-backup',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    stream: track,
    streamTitle: streamLabel,
    totalQuestions: questions.length,
    questions,
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeDate = new Date().toISOString().split('T')[0];
  const fileName = `studeezone_question_bank_backup_${streamCode}_${questions.length}_Qs_${safeDate}.json`;

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { total: questions.length, fileName };
}

/**
 * Validates and restores questions from a re-uploaded JSON backup file.
 */
export async function restoreQuestionBankFromJSON(fileContent: string): Promise<{
  success: boolean;
  totalRestored: number;
  stream?: string;
  message: string;
}> {
  try {
    const parsed = JSON.parse(fileContent);
    const rawQuestions: any[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.questions)
      ? parsed.questions
      : [];

    if (rawQuestions.length === 0) {
      throw new Error('No valid question items found in the uploaded file.');
    }

    // Validate and sanitize questions
    const validQuestions: Question[] = [];
    rawQuestions.forEach((q, idx) => {
      if (q && typeof q.question === 'string' && Array.isArray(q.options) && q.options.length >= 2) {
        validQuestions.push({
          id: q.id || `restored-q-${Date.now()}-${idx}`,
          year: q.year || '2025',
          category: q.category || 'CDP',
          examTracks: Array.isArray(q.examTracks) ? q.examTracks : ['prt', 'gt-maths-science', 'gt-humanities'],
          topic: q.topic || 'Curriculum Pedagogy',
          subtopic: q.subtopic,
          questionNumber: q.questionNumber || idx + 1,
          question: q.question,
          options: q.options,
          correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
          explanation: q.explanation || 'Standard curriculum explanation.',
          examPatternAnalysis: q.examPatternAnalysis || 'High-yield STET pattern.',
          difficulty: q.difficulty || 'Medium',
          tags: Array.isArray(q.tags) ? q.tags : ['stet-restored'],
          logicMode: q.logicMode || 'all',
        });
      }
    });

    if (validQuestions.length === 0) {
      throw new Error('None of the items in the file matched the STET Question specification.');
    }

    // Save restored questions to local custom storage
    const CUSTOM_QUESTIONS_KEY = 'studeezone_custom_question_bank';
    try {
      const existing = localStorage.getItem(CUSTOM_QUESTIONS_KEY);
      const existingList: Question[] = existing ? JSON.parse(existing) : [];
      const idMap = new Map<string, Question>();
      existingList.forEach((eq) => idMap.set(eq.id, eq));
      validQuestions.forEach((vq) => idMap.set(vq.id, vq));
      const combined = Array.from(idMap.values());
      localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(combined));
      window.dispatchEvent(new CustomEvent('studeezone_questions_restored', { detail: combined }));
    } catch (e) {
      console.warn('Local storage write warning:', e);
    }

    // Also notify server backend
    try {
      await fetch('/api/questions/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: validQuestions }),
      });
    } catch {}

    return {
      success: true,
      totalRestored: validQuestions.length,
      stream: parsed.stream || 'all',
      message: `Successfully validated and restored ${validQuestions.length} questions into the active system!`,
    };
  } catch (err: any) {
    throw new Error(err?.message || 'Failed to parse question bank file. Please check JSON structure.');
  }
}
