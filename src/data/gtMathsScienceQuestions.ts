import { Question } from '../types';

export const GT_MATHS_SCIENCE_QUESTIONS: Question[] = [
  {
    id: 'gt-ms-ped-01',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: '5E Instructional Model in Science Teaching',
    questionNumber: 61,
    question: 'In the 5E Instructional Model (Engage, Explore, Explain, Elaborate, Evaluate) for teaching secondary science, at which stage are scientific concepts and operational terminology officially introduced to students?',
    options: ['Explore phase', 'Explain phase', 'Elaborate phase', 'Engage phase'],
    correctIndex: 1,
    explanation: 'In the 5E model, students first explore phenomena through hands-on inquiry. In the "Explain" phase, teachers guide students to synthesize observations and formally introduce technical terminology and underlying scientific concepts.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science - 5E constructivist learning model.',
    difficulty: 'Medium',
    tags: ['MathsScience', '5E Model', 'Science Pedagogy', 'STET GT'],
    previousPaperSet: 'STET GT Maths/Science Paper'
  },
  {
    id: 'gt-ms-ped-02',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Mathematical Heuristics: Polya\'s Problem Solving',
    questionNumber: 62,
    question: 'According to George Polya\'s famous four-stage problem-solving framework in mathematics education, what is the fourth and often most neglected critical step?',
    options: ['Devising a plan', 'Carrying out the plan', 'Looking back (Reflecting/Evaluating)', 'Understanding the problem'],
    correctIndex: 2,
    explanation: 'Polya\'s four steps are: 1. Understand the problem, 2. Devise a plan, 3. Carry out the plan, 4. Look back (examine the result, verify logic, and consider alternative generalizations). Step 4 is crucial for metacognitive growth.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science - Polya mathematical heuristics.',
    difficulty: 'Easy',
    tags: ['MathsScience', 'Polya', 'Problem Solving', 'STET GT'],
    previousPaperSet: 'STET GT Maths/Science Paper'
  },
  {
    id: 'gt-ms-ped-03',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'ICT Tools in Mathematics: GeoGebra',
    questionNumber: 63,
    logicMode: 'case-study',
    question: 'A secondary mathematics teacher wants students to observe how varying the coefficient "m" and constant "c" in y = mx + c transforms slope and intercept dynamically in real time. Which digital tool is most effective for this interactive visualization?',
    options: ['MS PowerPoint static slides', 'GeoGebra dynamic geometry software', 'Audacity sound editor', 'Photomath auto-solver'],
    correctIndex: 1,
    explanation: 'GeoGebra is a dynamic mathematics software combining geometry, algebra, spreadsheets, graphing, and calculus with sliders that allow real-time parametric manipulation.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science - ICT and dynamic software integration.',
    difficulty: 'Easy',
    tags: ['MathsScience', 'GeoGebra', 'ICT in Maths', 'STET GT'],
    previousPaperSet: 'STET GT Maths/Science Paper'
  },
  {
    id: 'gt-ms-ped-04',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Scientific Temper & Falsifiability',
    questionNumber: 64,
    question: 'Which of the following best exemplifies fostering "Scientific Temper" among secondary school science learners in alignment with NEP 2020?',
    options: [
      'Encouraging verbatim memorization of laws and formulas.',
      'Accepting scientific theories solely on the unquestioned authority of textbooks.',
      'Encouraging questioning, hypothesis testing, empirical verification, and willingness to revise opinions based on evidence.',
      'Focusing exclusively on scoring high marks in terminal objective examinations.'
    ],
    correctIndex: 2,
    explanation: 'Scientific temper (Article 51A(h) of the Constitution and NEP 2020) entails evidence-based inquiry, critical skepticism, empiricism, open-mindedness, and willingness to revise beliefs in light of falsifying evidence.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science - Scientific temper and philosophy of science.',
    difficulty: 'Easy',
    tags: ['MathsScience', 'Scientific Temper', 'NEP 2020', 'STET GT'],
    previousPaperSet: 'STET GT Maths/Science Paper'
  },
  {
    id: 'gt-ms-ped-05',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Misconceptions vs Preconceptions in Physics',
    questionNumber: 65,
    logicMode: 'assertion-reason',
    question: 'Assertion (A): Common misconceptions (alternative frameworks) in science, such as "a continuous force is required to keep an object moving at constant speed", should not simply be labeled as "wrong" and dismissed.\nReason (R): Students construct alternative frameworks from everyday sensory experiences; effective pedagogy requires cognitive conflict to scaffold transition to Newtonian mechanics.',
    options: [
      'Both A and R are true, and R is the correct explanation of A.',
      'Both A and R are true, but R is NOT the correct explanation of A.',
      'A is true but R is false.',
      'A is false but R is true.'
    ],
    correctIndex: 0,
    explanation: 'Constructivist science pedagogy treats preconceptions as intuitive stepping stones. Presenting disconfirming experiments creates cognitive dissonance (conflict) enabling conceptual change.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science - Misconceptions and conceptual change theory.',
    difficulty: 'Medium',
    tags: ['MathsScience', 'Cognitive Conflict', 'Conceptual Change', 'STET GT'],
    previousPaperSet: 'STET GT Maths/Science Paper'
  }
];
