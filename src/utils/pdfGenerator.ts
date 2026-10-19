import { jsPDF } from 'jspdf';
import { StudyGuideItem, Question } from '../types';

export function downloadStudyGuidePDF(guide: StudyGuideItem) {
  console.warn('PDF download option is disabled for offline study guides.');
  return;
  // Previously generated PDF:
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 20;

  // Header Banner
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(margin, cursorY - 6, contentWidth, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.text('STET EXAM PREPARATION REVISION GUIDE', margin + 6, cursorY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`studeezone • Category: ${guide.category}  |  Est. Read: ${guide.readMinutes} mins`, margin + 6, cursorY + 12);

  cursorY += 32;

  // Guide Title
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(guide.title, contentWidth);
  doc.text(titleLines, margin, cursorY);
  cursorY += titleLines.length * 7 + 4;

  // Overview
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  const summaryLines = doc.splitTextToSize(guide.summary, contentWidth);
  doc.text(summaryLines, margin, cursorY);
  cursorY += summaryLines.length * 5 + 8;

  // Section 1: Key Formulas & Exam Rules
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, cursorY - 4, contentWidth, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. KEY FORMULAS & CORE RULES', margin + 3, cursorY + 2);
  cursorY += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);

  guide.keyFormulasAndRules.forEach((rule) => {
    const lines = doc.splitTextToSize(`• ${rule}`, contentWidth - 4);
    doc.text(lines, margin + 4, cursorY);
    cursorY += lines.length * 5 + 2;
  });

  cursorY += 6;

  // Section 2: High-Yield Exam Points
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, cursorY - 4, contentWidth, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. HIGH-YIELD POINTS BASED ON HISTORICAL EXAM PATTERNS', margin + 3, cursorY + 2);
  cursorY += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);

  guide.highYieldPoints.forEach((pt) => {
    const lines = doc.splitTextToSize(`• ${pt}`, contentWidth - 4);
    if (cursorY + lines.length * 5 > 275) {
      doc.addPage();
      cursorY = 20;
    }
    doc.text(lines, margin + 4, cursorY);
    cursorY += lines.length * 5 + 2;
  });

  cursorY += 6;

  // Section 3: Mnemonics & Memory Hacks
  if (cursorY > 240) {
    doc.addPage();
    cursorY = 20;
  }

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, cursorY - 4, contentWidth, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. RAPID RECALL MNEMONICS', margin + 3, cursorY + 2);
  cursorY += 10;

  guide.sampleMnemonics.forEach((m) => {
    const lines = doc.splitTextToSize(`★ ${m}`, contentWidth - 4);
    doc.text(lines, margin + 4, cursorY);
    cursorY += lines.length * 5 + 2;
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `STET Exam Preparation Platform | Offline Revision Document | Page ${i} of ${totalPages}`,
      margin,
      288
    );
  }

  doc.save(`${guide.id}-${guide.category}.pdf`);
}

export function downloadMockTestPaperPDF(testTitle: string, questions: Question[]) {
  console.warn('PDF download option is disabled for mock test papers.');
  return;
  // Previously generated PDF:
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 20;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(testTitle.toUpperCase(), margin, cursorY);
  cursorY += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`studeezone • Official Historical Mock Paper | Total Questions: ${questions.length} | Offline Practice Sheet`, margin, cursorY);
  cursorY += 10;

  doc.setDrawColor(203, 213, 225);
  doc.line(margin, cursorY, margin + contentWidth, cursorY);
  cursorY += 8;

  questions.forEach((q, idx) => {
    if (cursorY > 250) {
      doc.addPage();
      cursorY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    const qText = `Q${idx + 1}. [${q.category} - ${q.year}] ${q.question}`;
    const qLines = doc.splitTextToSize(qText, contentWidth);
    doc.text(qLines, margin, cursorY);
    cursorY += qLines.length * 5 + 3;

    if (q.passageText) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const pLines = doc.splitTextToSize(`Passage Context: ${q.passageText.slice(0, 180)}...`, contentWidth - 4);
      doc.text(pLines, margin + 4, cursorY);
      cursorY += pLines.length * 4.5 + 3;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    q.options.forEach((opt, optIdx) => {
      const optLetter = String.fromCharCode(65 + optIdx);
      const optLines = doc.splitTextToSize(`(${optLetter}) ${opt}`, contentWidth - 6);
      doc.text(optLines, margin + 4, cursorY);
      cursorY += optLines.length * 4.5 + 1.5;
    });

    cursorY += 5;
  });

  // Answer Key Section at end
  doc.addPage();
  cursorY = 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL ANSWER KEY & EXPLANATIONS', margin, cursorY);
  cursorY += 10;

  questions.forEach((q, idx) => {
    if (cursorY > 260) {
      doc.addPage();
      cursorY = 20;
    }
    const correctLetter = String.fromCharCode(65 + q.correctIndex);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(`Q${idx + 1}: (${correctLetter})`, margin, cursorY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const expLines = doc.splitTextToSize(q.explanation, contentWidth - 20);
    doc.text(expLines, margin + 18, cursorY);
    cursorY += Math.max(expLines.length * 4.2 + 3, 7);
  });

  doc.save(`${testTitle.toLowerCase().replace(/\s+/g, '-')}-practice.pdf`);
}
