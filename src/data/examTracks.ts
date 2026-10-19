import { ExamTrack, ExamTrackInfo, SubjectCategory } from '../types';

export const EXAM_TRACKS: Record<ExamTrack, ExamTrackInfo> = {
  'gt-humanities': {
    id: 'gt-humanities',
    title: 'STET - GT - Humanities',
    shortTitle: 'GT Humanities',
    badge: 'Paper II (Secondary)',
    level: 'Graduate Teacher (Humanities & Social Sciences)',
    description: 'Comprehensive preparation for Graduate Teacher (Secondary) in Social Sciences and Humanities.',
    subjects: [
      {
        category: 'English',
        name: 'English Language & Pedagogy',
        description: 'Grammar, Reading Comprehension, Cummins Theories (BICS/CALP), Multilingualism, and Literature.',
      },
      {
        category: 'SocialScience',
        name: 'Pedagogy Social Science',
        description: 'History, Indian Constitution & Polity, Geography, Atmospheric Science, and Social Science Pedagogy.',
      },
      {
        category: 'CDP',
        name: 'Child Development & Pedagogy',
        description: 'Piaget, Kohlberg, Vygotsky, Bandura, NEP 2020, RTE Act 2009, Inclusive Education, and Learning Theories.',
      },
    ],
  },
  'gt-maths-science': {
    id: 'gt-maths-science',
    title: 'STET GT (Graduate Teacher) - Maths / Science',
    shortTitle: 'GT Maths / Science',
    badge: 'Paper II (Secondary)',
    level: 'Graduate Teacher (Mathematics & Science)',
    description: 'Comprehensive preparation for Graduate Teacher in STEM disciplines with modern pedagogical strategies.',
    subjects: [
      {
        category: 'English',
        name: 'English Language & Pedagogy',
        description: 'Reading Comprehension, Syntax, Classroom Discourse, and Language Acquisition Principles.',
      },
      {
        category: 'MathsScience',
        name: 'Pedagogy Maths / Science',
        description: 'Scientific Inquiry, Inductive/Deductive Methods, Mathematical Reasoning, Geogebra, Lab Safety, and Diagnostic Remediation.',
      },
      {
        category: 'CDP',
        name: 'Child Development & Pedagogy',
        description: 'Cognitive Development, Transfer of Learning, Problem Solving Heuristics, Constructivism, and Formative Assessment.',
      },
    ],
  },
  'prt': {
    id: 'prt',
    title: 'STET Primary Teacher (PRT)',
    shortTitle: 'STET Primary Teacher',
    badge: 'Paper I (Primary)',
    level: 'Primary Teacher (Classes I - V)',
    description: 'Complete official question papers (2025 & 2024) and syllabus for Primary Teachers across all 4 key areas.',
    subjects: [
      {
        category: 'CDP',
        name: 'Child Development & Pedagogy',
        description: 'Developmental Milestones, Play Types (Parten), Scaffolding, Inclusive Education, POCSO Act 2012, and FLN.',
      },
      {
        category: 'English',
        name: 'English (Language-1)',
        description: 'Poetry Analysis, Contextual Grammar (Verbs/Adjectives), Sikkim Multilingualism, and Speaking/Listening Skills.',
      },
      {
        category: 'Maths',
        name: 'Mathematics',
        description: 'Number Patterns, Mensuration, Fractions, Real-Life Word Problems, Euler\'s Formula, and Geoboard Pedagogy.',
      },
      {
        category: 'EVS',
        name: 'Environmental Sciences (EVS)',
        description: 'Sikkim Biodiversity (Monasteries, Dokpas, Pangolakha), Plants/Animals, Food/Nutrition, Ecosystems, and Project Surveys.',
      },
    ],
  },
};

export const ALL_EXAM_TRACKS: ExamTrackInfo[] = [
  EXAM_TRACKS['gt-humanities'],
  EXAM_TRACKS['gt-maths-science'],
  EXAM_TRACKS['prt'],
];

export function getExamTrack(id?: ExamTrack | string): ExamTrackInfo {
  if (id === 'gt-maths-science') return EXAM_TRACKS['gt-maths-science'];
  if (id === 'prt' || (typeof id === 'string' && id.toLowerCase().includes('primary'))) return EXAM_TRACKS['prt'];
  return EXAM_TRACKS['gt-humanities'];
}

export function getSubjectsForTrack(trackId: ExamTrack): { category: SubjectCategory; name: string; description: string }[] {
  return EXAM_TRACKS[trackId]?.subjects || EXAM_TRACKS['gt-humanities'].subjects;
}
