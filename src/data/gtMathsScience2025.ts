import { Question } from '../types';
import { GT_2025_STEM_QUESTIONS } from './gtMathsScience2025_stem';
import { GT_2025_CORE_QUESTIONS } from './gtMathsScience2025_core';

/**
 * Combined Official 2025 Sikkim STET GT Maths / Science Question Paper
 * Includes:
 * - English (Language I)
 * - Mathematics (Subject & Pedagogy)
 * - Science (Physics, Chemistry, Biology & Pedagogy)
 * - Child Development and Pedagogy (GT level)
 */
export const GT_MATHS_SCIENCE_2025_QUESTIONS: Question[] = [
  ...GT_2025_CORE_QUESTIONS.filter(q => q.category === 'English'),
  ...GT_2025_STEM_QUESTIONS,
  ...GT_2025_CORE_QUESTIONS.filter(q => q.category === 'CDP')
];

export default GT_MATHS_SCIENCE_2025_QUESTIONS;
