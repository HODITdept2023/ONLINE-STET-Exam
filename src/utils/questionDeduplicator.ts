import { Question, ExamTrack, QuestionCategory } from '../types';

/**
 * Normalizes question text for robust comparison.
 * Strips artificial prefix labels, question numbers, bracketed headers, whitespace, and punctuation.
 */
export function getQuestionSignature(input: Question | string): string {
  const text = typeof input === 'string' ? input : input.question;
  if (!text) return '';

  let cleaned = text.trim();

  // 1. Iteratively strip leading bracketed expressions, e.g. [STET 2024 Paper II - Q1]
  while (/^\[[^\]]+\]\s*/i.test(cleaned)) {
    cleaned = cleaned.replace(/^\[[^\]]+\]\s*/i, '');
  }

  // 2. Iteratively strip leading parenthetical tags, e.g. (STET 2025)
  while (/^\([^)]+\)\s*/i.test(cleaned)) {
    cleaned = cleaned.replace(/^\([^)]+\)\s*/i, '');
  }

  // 3. Strip labeled wrappers and exam headers
  cleaned = cleaned
    .replace(/^[a-z0-9\s&,.'"-]+(?:\(|\:|\-)\s*(?:q)?\d+[^:]*:\s*/i, '')
    .replace(/^(?:primary pedagogy case|secondary pedagogy assessment|stet gt (?:science inquiry|social studies inquiry|mathematics)|gt humanities english pedagogy|calculation|cognitive development problem|classroom case study on [^:]+|moral dilemma case|historical source inquiry \([^)]+\)|applied sla theory|literary device analysis|syntactic rule logic)\s*:\s*/i, '');

  // 4. Remove non-alphanumeric characters and lowercase
  return cleaned
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Normalizes an option's text for option-set comparison.
 */
function normalizeOptionText(opt: string): string {
  return opt.toLowerCase().replace(/^(?:option\s*[a-d]:|\([a-d]\)|[a-d]\.)\s*/i, '').replace(/[^a-z0-9]/g, '').trim();
}

/**
 * Checks if two questions are substantially identical or repetitive.
 */
export function areQuestionsEquivalent(q1: Question, q2: Question): boolean {
  if (q1.id === q2.id) return true;
  
  const sig1 = getQuestionSignature(q1);
  const sig2 = getQuestionSignature(q2);

  // Exact signature match
  if (sig1.length > 8 && sig1 === sig2) return true;

  // Check options set similarity: if all 4 normalized options match, questions are identical
  if (q1.options && q2.options && q1.options.length >= 4 && q2.options.length >= 4) {
    const opts1 = q1.options.map(normalizeOptionText).filter(Boolean).sort().join('||');
    const opts2 = q2.options.map(normalizeOptionText).filter(Boolean).sort().join('||');
    if (opts1.length > 20 && opts1 === opts2) return true;
  }

  // If very long common prefix (>60 chars) AND at least 2 options match identically
  if (sig1.length >= 60 && sig2.length >= 60 && sig1.slice(0, 60) === sig2.slice(0, 60)) {
    const opts1 = q1.options.map(normalizeOptionText);
    const opts2 = new Set(q2.options.map(normalizeOptionText));
    const matchingOpts = opts1.filter(o => opts2.has(o)).length;
    if (matchingOpts >= 2) return true;
  }

  return false;
}

/**
 * Returns a list of strictly unique questions, discarding duplicates.
 */
export function deduplicateQuestionList(questions: Question[]): Question[] {
  const seenSignatures = new Set<string>();
  const seenIds = new Set<string>();
  const result: Question[] = [];

  for (const q of questions) {
    if (!q || !q.id || !q.question) continue;
    if (seenIds.has(q.id)) continue;

    const sig = getQuestionSignature(q);

    if (sig.length > 8 && seenSignatures.has(sig)) continue;

    // Check against existing selected questions for option set or equivalence
    if (result.some(existing => areQuestionsEquivalent(q, existing))) continue;

    seenIds.add(q.id);
    if (sig.length > 8) {
      seenSignatures.add(sig);
    }
    result.push(q);
  }

  return result;
}

interface SectionSelectionOptions {
  pool: Question[];
  track: ExamTrack;
  category: QuestionCategory;
  count: number;
  usedSignatures: Set<string>;
  topicKeyword?: string;
}

/**
 * Selects a specific number of non-repeating questions for a test section,
 * ensuring they have never appeared in previously selected sections of the same mock test.
 */
export function selectUniqueQuestionsForSection({
  pool,
  track,
  category,
  count,
  usedSignatures,
  topicKeyword,
}: SectionSelectionOptions): Question[] {
  // First pass: track + category + optional topicKeyword
  const primaryCandidates = pool.filter((q) => {
    const trackMatches = !q.examTracks || q.examTracks.includes(track);
    const catMatches = q.category === category;
    const topicMatches = topicKeyword
      ? (q.topic && q.topic.toLowerCase().includes(topicKeyword.toLowerCase())) ||
        (q.tags && q.tags.some((t) => t.toLowerCase().includes(topicKeyword.toLowerCase())))
      : true;
    return trackMatches && catMatches && topicMatches;
  });

  // Second pass: track + category (broader)
  const secondaryCandidates = pool.filter((q) => {
    const trackMatches = !q.examTracks || q.examTracks.includes(track);
    const catMatches = q.category === category;
    return trackMatches && catMatches;
  });

  // Third pass: category only
  const categoryCandidates = pool.filter((q) => q.category === category);

  const selected: Question[] = [];

  const tryAdd = (candidates: Question[]) => {
    for (const q of candidates) {
      if (selected.length >= count) break;
      const sig = getQuestionSignature(q);
      const stem = sig.slice(0, 35);
      const idKey = `id:${q.id}`;
      const sigKey = sig.length > 8 ? `sig:${sig}` : idKey;
      const stemKey = stem.length >= 30 ? `stem:${stem}` : sigKey;

      if (
        !usedSignatures.has(idKey) && 
        !usedSignatures.has(sigKey) && 
        !usedSignatures.has(stemKey) &&
        !selected.some(existing => areQuestionsEquivalent(q, existing))
      ) {
        usedSignatures.add(idKey);
        usedSignatures.add(sigKey);
        if (stem.length >= 30) usedSignatures.add(stemKey);
        selected.push(q);
      }
    }
  };

  tryAdd(primaryCandidates);
  if (selected.length < count) {
    tryAdd(secondaryCandidates);
  }
  if (selected.length < count) {
    tryAdd(categoryCandidates);
  }

  return selected;
}

/**
 * Validates and enforces that an entire mock test suite contains zero repetitive questions.
 * If any duplicate is detected, it replaces it with an unused unique question from the fallbackBank.
 */
export function ensureTestQuestionsAreUnique(
  questions: Question[],
  fallbackBank: Question[],
  track?: ExamTrack
): Question[] {
  const seenSignatures = new Set<string>();
  const seenIds = new Set<string>();
  const seenStems = new Set<string>();
  const uniqueQuestions: Question[] = [];
  const duplicatesIndices: number[] = [];

  questions.forEach((q, idx) => {
    const idKey = `id:${q.id}`;
    const sig = getQuestionSignature(q);
    const stem = sig.slice(0, 35);
    const sigKey = sig.length > 8 ? `sig:${sig}` : idKey;
    const stemKey = stem.length >= 30 ? `stem:${stem}` : sigKey;

    const isDuplicate = 
      seenIds.has(idKey) || 
      seenSignatures.has(sigKey) || 
      (stem.length >= 30 && seenStems.has(stemKey)) ||
      uniqueQuestions.some(existing => areQuestionsEquivalent(q, existing));

    if (isDuplicate) {
      duplicatesIndices.push(idx);
    } else {
      seenIds.add(idKey);
      if (sig.length > 8) seenSignatures.add(sigKey);
      if (stem.length >= 30) seenStems.add(stemKey);
      uniqueQuestions.push(q);
    }
  });

  // If no duplicates, return directly
  if (duplicatesIndices.length === 0) {
    return uniqueQuestions;
  }

  // Need to replace the duplicates with unused unique questions matching the respective categories
  const result = [...uniqueQuestions];
  for (const dupIdx of duplicatesIndices) {
    const origQ = questions[dupIdx];
    const category = origQ.category;

    // Find an unused question from fallbackBank in the same category
    const replacement = fallbackBank.find((cand) => {
      if (cand.category !== category) return false;
      if (track && cand.examTracks && !cand.examTracks.includes(track)) return false;

      const candIdKey = `id:${cand.id}`;
      const candSig = getQuestionSignature(cand);
      const candStem = candSig.slice(0, 35);
      const candSigKey = candSig.length > 8 ? `sig:${candSig}` : candIdKey;
      const candStemKey = candStem.length >= 30 ? `stem:${candStem}` : candSigKey;

      if (seenIds.has(candIdKey) || seenSignatures.has(candSigKey)) return false;
      if (candStem.length >= 30 && seenStems.has(candStemKey)) return false;
      if (result.some(existing => areQuestionsEquivalent(cand, existing))) return false;

      return true;
    });

    if (replacement) {
      const repIdKey = `id:${replacement.id}`;
      const repSig = getQuestionSignature(replacement);
      const repStem = repSig.slice(0, 35);
      const repSigKey = repSig.length > 8 ? `sig:${repSig}` : repIdKey;
      const repStemKey = repStem.length >= 30 ? `stem:${repStem}` : repSigKey;

      seenIds.add(repIdKey);
      if (repSig.length > 8) seenSignatures.add(repSigKey);
      if (repStem.length >= 30) seenStems.add(repStemKey);
      result.push(replacement);
    }
  }

  return result;
}
