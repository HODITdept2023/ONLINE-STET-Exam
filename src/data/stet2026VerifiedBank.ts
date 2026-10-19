import { Question, ExamTrack } from '../types';
import { STET_2026_CDP_QUESTIONS } from './stet2026_cdp_bank';
import { STET_2026_ENGLISH_QUESTIONS } from './stet2026_english_bank';
import { STET_2026_SOCIAL_SCIENCE_QUESTIONS } from './stet2026_social_science_bank';

export {
  STET_2026_CDP_QUESTIONS,
  STET_2026_ENGLISH_QUESTIONS,
  STET_2026_SOCIAL_SCIENCE_QUESTIONS
};

/**
 * Total 900 Authentic STET 2026 Verified Questions:
 * - 250 Child Development & Pedagogy (Batch 1A + 1D)
 * - 250 Language I English (Batch 1A + 1B)
 * - 400 Social Science (Batch 1A + 1B + 1C + 1D)
 * 
 * Target Exam Streams:
 * - GT-Humanities: All 900 questions (CDP, English, Social Science)
 * - GT-Maths & Science: 500 questions (CDP 250 + English 250 shared common core)
 */
export const ALL_STET_2026_VERIFIED_QUESTIONS: Question[] = [
  ...STET_2026_CDP_QUESTIONS,
  ...STET_2026_ENGLISH_QUESTIONS,
  ...STET_2026_SOCIAL_SCIENCE_QUESTIONS
];

export function getGtHumanities2026Questions(): Question[] {
  return ALL_STET_2026_VERIFIED_QUESTIONS.filter(q => q.examTracks?.includes('gt-humanities'));
}

export function getGtMathsScience2026Questions(): Question[] {
  return ALL_STET_2026_VERIFIED_QUESTIONS.filter(q => q.examTracks?.includes('gt-maths-science'));
}
