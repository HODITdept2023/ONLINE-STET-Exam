import { Question } from '../types';

/**
 * 2025 STET GT Maths / Science - Official Paper (Mathematics & Science Sections)
 * Transcribed verbatim from official 2025 examination booklet:
 * - Mathematics: Questions 31 - 60
 * - Science: Questions 61 - 90
 */
export const GT_2025_STEM_QUESTIONS: Question[] = [
  // --- MATHEMATICS (Questions 31 to 60) ---
  {
    id: 'gt-ms-2025-q31',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Real-Life Arithmetic: Local Weekly Haat',
    questionNumber: 31,
    question: 'On a day of \'weekly haat\' in the local market, a vendor sells portions of radish weighing 800 g, 1170 g, 9 1/4 kg, and 6 3/4 kg respectively, to four customers, from a sack of local radish which weighs 2 quintals. How much radish is still left in the sack?',
    options: [
      '182.97 kg',
      '193.13 kg',
      '182.03 kg',
      '183.03 kg'
    ],
    correctIndex: 2,
    explanation: '1 quintal = 100 kg ⟹ 2 quintals = 200 kg.\nPortions sold:\n1. 800 g + 1170 g = 1970 g = 1.97 kg.\n2. 9 1/4 kg = 9.25 kg, 6 3/4 kg = 6.75 kg (Sum = 16 kg).\nTotal sold = 16 kg + 1.97 kg = 17.97 kg.\nRadish left = 200 kg - 17.97 kg = 182.03 kg.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Contextual arithmetic at weekly haat.',
    difficulty: 'Medium',
    tags: ['Mathematics', 'Arithmetic', 'Fractions', 'Weekly Haat', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q32',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Real Numbers: Rationality of Pi and 22/7',
    questionNumber: 32,
    question: 'Which of these statements is true regarding π and 22/7?',
    options: [
      '22/7 and π are both rational',
      '22/7 is rational and π is irrational',
      '22/7 and π are both irrational',
      'π is rational and 22/7 is irrational'
    ],
    correctIndex: 1,
    explanation: '22/7 is represented as a fraction p/q where p and q are integers and q ≠ 0, making it rational (with repeating decimal 3.142857...). π is an irrational transcendental real number whose decimal digits never repeat nor terminate.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Rational vs irrational numbers.',
    difficulty: 'Easy',
    tags: ['Mathematics', 'Real Numbers', 'Irrationality', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q33',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Triangle Inequality Theorem',
    questionNumber: 33,
    question: 'A student attempted to draw a triangle with sides 3 cm, 4 cm, and 8 cm, but was not able to draw the triangle. Which fundamental property of triangles did the student miss?',
    options: [
      'Sum of the interior angles of a triangle is 180°',
      'The sum of any two sides of a triangle is always greater than the third side',
      '3, 4, and 8 do not form a Pythagorean triplet',
      'SAS criteria not satisfied'
    ],
    correctIndex: 1,
    explanation: 'By the Triangle Inequality Theorem, the sum of lengths of any two sides must be strictly greater than the third side. Here, 3 cm + 4 cm = 7 cm, which is less than 8 cm. Thus, these side lengths cannot close to form a triangle.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Triangle geometric inequalities.',
    difficulty: 'Easy',
    tags: ['Mathematics', 'Geometry', 'Triangle Inequality', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q34',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Geometric Constructions with Ruler and Compass',
    questionNumber: 34,
    question: 'Given below are measures of certain sides and angles of triangles to be constructed with ruler and compass:\n1. m∠A = 60°, m∠B = 115°; AB = 5 cm\n2. m∠E = 45°, m∠F = 60°; EF = 6.4 cm\n3. m∠Q = 35°, m∠R = 55°; QR = 7.3 cm\nIdentify those triangles which CANNOT be constructed without using a protractor for measuring given angles:',
    options: [
      '1 and 2',
      '2 and 3',
      '1, 2 & 3',
      '1 & 3'
    ],
    correctIndex: 3,
    explanation: 'With ruler and compass alone, one can construct angles that are multiples of 15° (e.g., 15°, 30°, 45°, 60°, 75°, 90°, 105°, 120°). 115° (in set 1) and 35° / 55° (in set 3) cannot be constructed without a protractor. In set 2, 45° and 60° are standard compass constructions. Thus, sets 1 and 3 require a protractor.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Ruler-and-compass constructible angles.',
    difficulty: 'Medium',
    tags: ['Mathematics', 'Geometry', 'Constructions', 'Compass and Ruler', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q35',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Quadratic Equations: Discriminant Condition for Real Roots',
    questionNumber: 35,
    question: 'Under what condition are the roots of a quadratic equation real? (Here D is the discriminant of the quadratic equation):',
    options: [
      'D > 0',
      'D ≤ 0',
      'D ≥ 0',
      'D = 0'
    ],
    correctIndex: 2,
    explanation: 'For ax² + bx + c = 0, roots are given by x = (-b ± √D) / 2a. Real roots exist when the quantity under the radical is non-negative, meaning D = b² - 4ac ≥ 0 (distinct if D > 0, equal if D = 0).',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Discriminant conditions.',
    difficulty: 'Easy',
    tags: ['Mathematics', 'Algebra', 'Quadratic Equations', 'Discriminant', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q36',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Probability: Sample Space of Dice',
    questionNumber: 36,
    question: 'The total number of outcomes in the sample space when a fair six-sided die is thrown twice is:',
    options: [
      '12',
      '6',
      '36',
      '18'
    ],
    correctIndex: 2,
    explanation: 'By the fundamental counting principle, when a 6-sided die is thrown twice, the number of possible outcomes in the sample space S is 6 × 6 = 6² = 36.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Elementary probability theory.',
    difficulty: 'Easy',
    tags: ['Mathematics', 'Probability', 'Sample Space', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q37',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Laws of Exponents: Sum of Identical Powers',
    questionNumber: 37,
    question: 'The expression 4³⁰ + 4³⁰ + 4³⁰ + 4³⁰ is equal to:',
    options: [
      '16³⁰',
      '4¹²⁰',
      '16³¹',
      '4³¹'
    ],
    correctIndex: 3,
    explanation: 'Factor out the common term: 4³⁰ + 4³⁰ + 4³⁰ + 4³⁰ = 4 × (4³⁰) = 4¹ × 4³⁰ = 4¹⁺³⁰ = 4³¹.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Exponential manipulation.',
    difficulty: 'Easy',
    tags: ['Mathematics', 'Exponents', 'Algebra', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q38',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Commercial Arithmetic: Free Article Discount Percentage',
    questionNumber: 38,
    question: 'A shop gives a free shirt to each customer who buys a certain number of shirts. If the discount offered here is 25%, what is the number of shirts bought to get one free?',
    options: [
      '5',
      '4',
      '3',
      '2'
    ],
    correctIndex: 2,
    explanation: 'Effective discount = [Free shirts / Total shirts received] × 100%. Here, 25% = 1/4. So 1 out of every 4 shirts is free. This means the customer buys 3 shirts and receives 1 additional shirt free (Buy 3 Get 1 Free). Thus, the number of shirts bought is 3.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Retail discount formulations.',
    difficulty: 'Medium',
    tags: ['Mathematics', 'Commercial Arithmetic', 'Discount Percentage', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q39',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Descriptive Statistics: Measures of Central Tendency',
    questionNumber: 39,
    question: 'In a bar graph showing choice of fruits of a class, the tallest bar depicting the most liked fruit directly represents which statistical measure?',
    options: [
      'Only Mode',
      'Only Median',
      'Only Mean',
      'All the three'
    ],
    correctIndex: 0,
    explanation: 'The mode is defined as the value or category that occurs with the highest frequency in a dataset. On a frequency bar chart, the tallest bar represents the modal category (Only Mode).',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Graphical representation of central tendency.',
    difficulty: 'Easy',
    tags: ['Mathematics', 'Statistics', 'Mode', 'Bar Charts', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q40',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Mensuration: Perimeter Invariance Under Wire Reshaping',
    questionNumber: 40,
    question: 'A wire rod is bent in the shape of a triangle with side lengths 5 cm, 7 cm, and 4 cm. If the same wire rod is reshaped into a square, what will be the length of each side of the square?',
    options: [
      '4 cm',
      '5 cm',
      '6 cm',
      '7 cm'
    ],
    correctIndex: 0,
    explanation: 'The length of the wire remains constant (invariant perimeter):\nPerimeter of triangle = 5 cm + 7 cm + 4 cm = 16 cm.\nPerimeter of square = 4 × side = 16 cm ⟹ side = 16 / 4 = 4 cm.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Perimeter conservation.',
    difficulty: 'Easy',
    tags: ['Mathematics', 'Mensuration', 'Perimeter', 'Triangle to Square', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q41',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Compound vs Simple Interest Difference Formula',
    questionNumber: 41,
    question: 'What will be the difference between the Compound Interest and the Simple Interest at the rate of 5% p.a. on an amount of Rs. 6000 at the end of two years?',
    options: [
      'Rs. 15',
      'Rs. 20',
      'Rs. 25',
      'Rs. 30'
    ],
    correctIndex: 0,
    explanation: 'The standard formula for the difference between CI and SI for 2 years is:\nDifference = P × (R / 100)²\nSubstituting values: Difference = 6000 × (5 / 100)² = 6000 × (25 / 10000) = 6000 × 0.0025 = Rs. 15.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - CI and SI 2-year difference.',
    difficulty: 'Medium',
    tags: ['Mathematics', 'Commercial Arithmetic', 'CI vs SI', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q42',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Quadrilateral Angles: Supplementary & Complementary Angles',
    questionNumber: 42,
    question: 'The interior angles of a convex quadrilateral are in the ratio 2 : 3 : 5 : 8. What is the difference between the supplement of the largest angle and the complement of the smallest angle?',
    options: [
      '120°',
      '60°',
      '30°',
      '20°'
    ],
    correctIndex: 2,
    explanation: 'Sum of angles in a quadrilateral = 360°.\nRatio parts: 2x + 3x + 5x + 8x = 18x = 360° ⟹ x = 20°.\nSmallest angle = 2 × 20° = 40°.\nLargest angle = 8 × 20° = 160°.\nComplement of smallest angle = 90° - 40° = 50°.\nSupplement of largest angle = 180° - 160° = 20°.\nDifference = |50° - 20°| = 30°.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Quadrilateral and angle geometry.',
    difficulty: 'Medium',
    tags: ['Mathematics', 'Geometry', 'Quadrilaterals', 'Angles', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q43',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Mensuration: Percentage Change in Cylinder Dimensions',
    questionNumber: 43,
    question: 'The diameter of the base of a cylinder with radius r is decreased by 25%. What is the new radius of the base?',
    options: [
      'r / 4',
      'r / 8',
      '3r / 4',
      '3r / 8'
    ],
    correctIndex: 2,
    explanation: 'Decreasing diameter d by 25% means the new diameter d\' = d × (1 - 0.25) = 0.75d = (3/4)d. Since radius is half the diameter (r = d/2), the new radius r\' = (3/4)r = 3r / 4.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Proportional scaling in mensuration.',
    difficulty: 'Easy',
    tags: ['Mathematics', 'Mensuration', 'Cylinder', 'Percentage', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q44',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Axioms of Probability',
    questionNumber: 44,
    question: 'Which of the following values CANNOT represent the probability of an event?',
    options: [
      '5/7',
      '0.6',
      '1.2',
      '12%'
    ],
    correctIndex: 2,
    explanation: 'By Kolmogorov\'s first axiom of probability, the probability P(E) of any event must satisfy 0 ≤ P(E) ≤ 1. Since 1.2 > 1, it cannot be a valid probability. (5/7 ≈ 0.71, 0.6, and 12% = 0.12 are all within [0, 1]).',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Axiomatic probability bounds.',
    difficulty: 'Easy',
    tags: ['Mathematics', 'Probability', 'Axioms', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q45',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Linear Equations in Two Variables: Mathematical Modeling',
    questionNumber: 45,
    question: 'A mother\'s age is 7 years more than thrice her daughter\'s age. If x and y years respectively represent the ages of the mother and daughter, which is the corresponding mathematical model?',
    options: [
      'y = 3x + 7',
      '3x = y + 7',
      '3y = x + 7',
      'x = 3y + 7'
    ],
    correctIndex: 3,
    explanation: 'Mother\'s age = x, Daughter\'s age = y. "Thrice her daughter\'s age" = 3y. "7 years more than thrice daughter\'s age" = 3y + 7. Equating mother\'s age: x = 3y + 7.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Algebraic translation.',
    difficulty: 'Easy',
    tags: ['Mathematics', 'Algebra', 'Linear Equations', 'Word Problems', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q46',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: '3D Mensuration: Curved Surface Area of Cone',
    questionNumber: 46,
    question: 'The curved surface area of a right circular cone with height h and slant height l is expressed as:',
    options: [
      'π l √(l² - h²)',
      'π l √(l² + h²)',
      'π l / √(l² + h²)',
      'π l √(l² × h²)'
    ],
    correctIndex: 0,
    explanation: 'Curved surface area of a cone is CSA = πrl. In a right circular cone, l² = r² + h² ⟹ r = √(l² - h²). Substituting r into the CSA formula gives CSA = π l √(l² - h²).',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Surface area derivations.',
    difficulty: 'Medium',
    tags: ['Mathematics', 'Mensuration', 'Cone', 'Curved Surface Area', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q47',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Percentage Change in 2D Mensuration',
    questionNumber: 47,
    question: 'If the radius of a circle is increased by 4%, by what percentage does its area increase?',
    options: [
      '8.16%',
      '8.64%',
      '16%',
      '16.8%'
    ],
    correctIndex: 0,
    explanation: 'Area A = πr². If radius becomes r\' = r(1 + 0.04) = 1.04r, the new area becomes A\' = π(1.04r)² = 1.0816(πr²) = 1.0816A. The percentage increase is (1.0816 - 1) × 100% = 8.16%. (Or via formula: 2x + x²/100 = 8 + 0.16 = 8.16%).',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Percentage variations in geometry.',
    difficulty: 'Medium',
    tags: ['Mathematics', 'Geometry', 'Circles', 'Percentage Increase', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q48',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Algebraic Identities: Sum of Three Cubes',
    questionNumber: 48,
    question: 'The algebraic identity x³ + y³ + z³ - 3xyz is identically equal to:',
    options: [
      '(x + y + z)[(x - y)² + (y - z)² + (z - x)²]',
      '(x + y + z)[(x + y)² - (y + z)² - (z + x)²]',
      '1/2 (x + y + z)[(x - y)² + (y - z)² + (z - x)²]',
      '(x + y + z)[(x + y)² - (y + z)² - (z + x)²]'
    ],
    correctIndex: 2,
    explanation: 'x³ + y³ + z³ - 3xyz = (x + y + z)(x² + y² + z² - xy - yz - zx). Multiplying and dividing by 2 gives: (1/2)(x + y + z)[2x² + 2y² + 2z² - 2xy - 2yz - 2zx] = 1/2 (x + y + z)[(x - y)² + (y - z)² + (z - x)²].',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Higher algebraic identities.',
    difficulty: 'Medium',
    tags: ['Mathematics', 'Algebra', 'Polynomial Identities', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q49',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Triangles: Converse of Pythagoras Theorem',
    questionNumber: 49,
    question: 'In ΔABC, AB = 5 cm, BC = 12 cm, and AC = 13 cm. Which of the following statements is correct?',
    options: [
      '∠A = 90°',
      '∠B = 90°',
      '∠A > ∠B',
      '∠C = 90°'
    ],
    correctIndex: 1,
    explanation: 'Observe that 5² + 12² = 25 + 144 = 169 = 13². Thus AB² + BC² = AC². By the converse of Pythagoras\' theorem, ΔABC is a right-angled triangle with hypotenuse AC. The right angle is opposite to AC, which is ∠B = 90°.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Pythagorean triplets.',
    difficulty: 'Easy',
    tags: ['Mathematics', 'Geometry', 'Pythagoras Theorem', 'Right Triangle', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q50',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Number Patterns: Consecutive Cubes and Sum of Odds',
    questionNumber: 50,
    question: 'If \'a\', \'b\' and \'c\' are whole numbers and a³ = 1 + 7, 5³ = 1 + 7 + b, and 6³ = 1 + 7 + c, then the value of a + c - b is:',
    options: [
      '93',
      '39',
      '9',
      '3'
    ],
    correctIndex: 0,
    explanation: '1. a³ = 1 + 7 = 8 ⟹ a = 2.\n2. 5³ = 125 = 8 + b ⟹ b = 125 - 8 = 117.\n3. 6³ = 216 = 8 + c ⟹ c = 216 - 8 = 208.\nNow compute a + c - b = 2 + 208 - 117 = 210 - 117 = 93.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Number theory and pattern equations.',
    difficulty: 'Hard',
    tags: ['Mathematics', 'Number Patterns', 'Cubes', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q51',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Data Representation: Central Angles for Pie Charts',
    questionNumber: 51,
    question: 'There are 40 students in a class. For Independence Day, the teacher bought snack items: a. Samosa - 80, b. Jalebi - 120, c. Cake pieces - 160, d. Bread pieces - 320, e. Juice bottles - 40. Which option correctly matches each Item with its Central Angle in a pie chart?\nAngles: I. 160°, II. 40°, III. 60°, IV. 80°, V. 20°',
    options: [
      'a-V, b-III, c-IV, d-II, e-I',
      'a-II, b-III, c-V, d-IV, e-I',
      'a-V, b-III, c-IV, d-I, e-II',
      'a-II, b-III, c-IV, d-I, e-V'
    ],
    correctIndex: 3,
    explanation: 'Total count = 80 + 120 + 160 + 320 + 40 = 720 items.\nCentral angle θ = (Item count / 720) × 360° = Item count / 2:\n• a (Samosa: 80) ⟹ 80 / 2 = 40° (II)\n• b (Jalebi: 120) ⟹ 120 / 2 = 60° (III)\n• c (Cake: 160) ⟹ 160 / 2 = 80° (IV)\n• d (Bread: 320) ⟹ 320 / 2 = 160° (I)\n• e (Juice: 40) ⟹ 40 / 2 = 20° (V)\nMatching: a-II, b-III, c-IV, d-I, e-V.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Pie chart central angles.',
    difficulty: 'Medium',
    tags: ['Mathematics', 'Statistics', 'Pie Chart', 'Data Handling', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q52',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Van Hiele Model of Geometric Thought',
    questionNumber: 52,
    question: 'A teacher conducts the following activity: I. Draw a quadrilateral ABCD on paper. II. Trace the 4 angles with tracing paper. III. Cut out the angles and color them. IV. Draw a line MN with point O and arrange the 4 angles around O to form a complete 360° circle. Which Van Hiele level is the teacher working on?',
    options: [
      'Recognition (Visualization)',
      'Description (Analysis)',
      'Informal Deduction (Abstraction / Relational)',
      'Formal Deduction'
    ],
    correctIndex: 2,
    explanation: 'In Van Hiele Level 2 (Informal Deduction / Abstraction), students empirically discover and establish relationships between properties of figures (e.g., verifying that the sum of angles of any quadrilateral is 360° by rearranging angle cutouts around a point).',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Van Hiele geometric progression.',
    difficulty: 'Medium',
    tags: ['Mathematics Pedagogy', 'Van Hiele', 'Geometry', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q53',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Interdisciplinary Assessment Opportunities',
    questionNumber: 53,
    question: 'A teacher uses assessment opportunities to test inter-disciplinary understanding over the academic year: I. Field Trips, II. Unit test, III. Projects, IV. Mathematics Olympiad. Which is the most appropriate combination of strategies to achieve this outcome?',
    options: [
      'I & II',
      'I & III',
      'II, III & IV',
      'I, III & IV'
    ],
    correctIndex: 1,
    explanation: 'Interdisciplinary understanding involves connecting mathematical concepts with geography, environmental science, economics, and culture. Authentic strategies like Field Trips (I) and thematic Projects (III) provide real-world interdisciplinary contexts, unlike isolated standardized tests.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Interdisciplinary STEM pedagogy.',
    difficulty: 'Easy',
    tags: ['Mathematics Pedagogy', 'Interdisciplinary', 'Projects', 'Field Trips', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q54',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Role of Errors in Mathematics Learning',
    questionNumber: 54,
    question: '"Errors in mathematics play a crucial role in the learning of mathematics." This statement is:',
    options: [
      'True, because errors provide feedback about the marks obtained by students',
      'True, because errors reflect the thinking and alternative conceptions of students',
      'False, because mathematics is exact and intolerant of error',
      'False, because errors occur only due to carelessness of students'
    ],
    correctIndex: 1,
    explanation: 'Modern constructivist pedagogy emphasizes that student errors are not mere careless slips; they provide valuable diagnostic windows into students\' underlying cognitive schemas, reasoning patterns, and intuitive alternative frameworks.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Constructivist error analysis.',
    difficulty: 'Easy',
    tags: ['Mathematics Pedagogy', 'Error Analysis', 'Constructivism', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q55',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Objectives of Secondary School Mathematics',
    questionNumber: 55,
    question: 'The overarching objective for students studying mathematics at the secondary level (Grades IX-X) is:',
    options: [
      'Gaining understanding of mathematical concepts and their applications in solving problems logically',
      'Getting admission into a good college',
      'Learning lots of new formulae and using algorithms rapidly',
      'Remembering methods of various types of mathematical problems'
    ],
    correctIndex: 0,
    explanation: 'According to NCF 2005 and the SCERT Sikkim curriculum framework, secondary mathematics aims to transition from basic computation to abstract logical reasoning, formal proofs, relational understanding, and mathematical problem-solving in everyday life.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Secondary mathematics curriculum goals.',
    difficulty: 'Easy',
    tags: ['Mathematics Pedagogy', 'Curriculum Goals', 'NCF 2005', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q56',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Open-ended vs Closed-ended Assessment Items',
    questionNumber: 56,
    question: '"Write a pair of integers (a, b) such that a + b = -1". This question is an example of a/an:',
    options: [
      'Open-ended question',
      'Closed-ended question',
      'Reflective question',
      'Multi-disciplinary question'
    ],
    correctIndex: 0,
    explanation: 'An open-ended question has multiple valid responses (e.g., (0, -1), (1, -2), (2, -3), (-4, 3)). It encourages divergent mathematical reasoning, exploration of number relationships, and creative problem solving.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Open vs closed assessment items.',
    difficulty: 'Easy',
    tags: ['Mathematics Pedagogy', 'Open-Ended Questions', 'Integers', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q57',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Definition and Scope of Mathematical Tools',
    questionNumber: 57,
    question: 'In contemporary mathematics pedagogy, the term \'Mathematical Tools\' refers to:',
    options: [
      'Charts based on formulas and concepts, graph papers, dotted sheets, etc.',
      'Physical material like geo-board and 3D models, cubic rods, etc.',
      'Calculators, rulers, tape measures, protractors, compass, etc.',
      'All types of materials including language, written symbols, manipulatives and meaningful instructions to establish their purpose'
    ],
    correctIndex: 3,
    explanation: 'Socio-cultural and constructivist perspectives define mathematical tools broadly to include semiotic resources (mathematical language, algebraic symbols, diagrams) as well as physical manipulatives, digital tools, and instructional scaffolding.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Semiometrics and mathematical tools.',
    difficulty: 'Medium',
    tags: ['Mathematics Pedagogy', 'Mathematical Tools', 'Semiotic Resources', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q58',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Mathematics Anxiety: Psychosocial Factors',
    questionNumber: 58,
    question: 'Which of the following is NOT an inherent contributing factor to Mathematics anxiety among school learners?',
    options: [
      'Gender',
      'Nature of subject (high abstraction)',
      'Examination system (high-stakes speed drills)',
      'Rigid curriculum'
    ],
    correctIndex: 0,
    explanation: 'Empirical educational research consistently shows that mathematical cognitive aptitude is independent of gender. Gender differences in math anxiety are cultural myths, whereas the high abstraction of the subject, timed examinations, and rigid pedagogical demands are established systemic causes.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Math anxiety and gender neutrality.',
    difficulty: 'Easy',
    tags: ['Mathematics Pedagogy', 'Math Anxiety', 'Gender Neutrality', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q59',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Inductive Experimentation: Cylinder and Cone Volume',
    questionNumber: 59,
    question: 'A teacher tries out an experiment with a hollow cylinder and a cone with identical base radius and height. Students fill the cone to the brim with water and empty it into the cylinder, observing that it takes exactly three full cones to fill the cylinder completely. Using this observation, which pedagogical stage is possible?\nI. Help students make an empirical conjecture on the relation between the volume of a cone and that of a cylinder.\nII. Deductively prove that the volume of a cylinder is three times the volume of a cone.',
    options: [
      'Both I and II are possible',
      'Neither I nor II is possible',
      'Only I is possible',
      'Only II is possible'
    ],
    correctIndex: 2,
    explanation: 'This hands-on experiment provides inductive empirical evidence allowing students to formulate the conjecture V_cylinder = 3 × V_cone. Formal mathematical deductive proof requires integral calculus or Cavalieri\'s principle, which cannot be derived solely from pouring water.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Inductive inquiry vs deductive proof.',
    difficulty: 'Medium',
    tags: ['Mathematics Pedagogy', 'Inductive Method', 'Mensuration', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q60',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Surface Area of Cylinder: Relational Understanding',
    questionNumber: 60,
    question: 'A teacher asks ways to find the curved surface area of a right circular cylinder. Three students argue:\n• Pema: We have to multiply base area of cylinder by its height.\n• Amar: We have to multiply circumference of the base of the cylinder by its height.\n• Uma: We have to unroll/wrap a rectangular paper around the cylinder and find the area of the paper.\nWhich of the arguments are mathematically sound?',
    options: [
      'Both Pema and Uma are correct',
      'Only Pema is correct',
      'Both Amar and Uma are correct',
      'Only Amar is correct'
    ],
    correctIndex: 2,
    explanation: 'Curved surface area = 2πrh. Amar correctly multiplies base circumference (2πr) by height h (2πrh). Uma recognizes that unwrapping the cylinder produces a rectangle of length 2πr and width h, with area = length × width = 2πrh. Pema mistakenly calculates volume (πr²h). Thus, Amar and Uma are correct.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Conceptual understanding of cylinder CSA.',
    difficulty: 'Medium',
    tags: ['Mathematics Pedagogy', 'Mensuration', 'Curved Surface Area', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },

  // --- SCIENCE (Questions 61 to 90) ---
  {
    id: 'gt-ms-2025-q61',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Kinematics: Distance-Time Graph Interpretation',
    questionNumber: 61,
    question: 'Four cars A, B, C and D are moving on a leveled straight road. Their distance-time graphs are straight lines originating from the origin with increasing slopes from A (flattest) to D (steepest). Which statement is correct?',
    options: [
      'Car A is slowest',
      'Car D is slowest',
      'Car A is faster than car D',
      'Car D is faster than car C'
    ],
    correctIndex: 0,
    explanation: 'On a distance-time graph, the slope (gradient = Δs/Δt) represents speed. Car A has the lowest angle of inclination and smallest slope, meaning it covers the least distance per unit time and is the slowest of all four cars.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Kinematics graph slopes.',
    difficulty: 'Easy',
    tags: ['Science', 'Physics', 'Kinematics', 'Distance-Time Graph', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q62',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Work-Energy Theorem: Change in Kinetic Energy',
    questionNumber: 62,
    question: 'If a moving car of mass 2000 kg increases its velocity from 10 m/s to 15 m/s, then the net work done by the engine on the car is:',
    options: [
      '-125 kJ',
      '125 kJ',
      '-250 kJ',
      '250 kJ'
    ],
    correctIndex: 1,
    explanation: 'By the Work-Energy Theorem: Work done W = ΔKE = (1/2)m(v₂² - v₁²).\nW = (1/2) × 2000 × (15² - 10²) = 1000 × (225 - 100) = 1000 × 125 = 125,000 J = 125 kJ.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Work-energy calculations.',
    difficulty: 'Medium',
    tags: ['Science', 'Physics', 'Work Energy', 'Kinetic Energy', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q63',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Ray Optics: Convex Lens Image Formation',
    questionNumber: 63,
    question: 'An object AB is placed in front of a convex lens between F₁ and 2F₁. An observer observes the image from the opposite side of the lens. The image seen by the observer is:',
    options: [
      'Real, inverted and enlarged',
      'Virtual, inverted and enlarged',
      'Virtual, erect and enlarged',
      'Real, erect and enlarged'
    ],
    correctIndex: 0,
    explanation: 'When an object is placed between F₁ and 2F₁ of a convex lens, refracted rays converge beyond 2F₂ on the opposite side to form a real, inverted, and magnified (enlarged) image.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Ray diagrams for convex lenses.',
    difficulty: 'Medium',
    tags: ['Science', 'Physics', 'Optics', 'Convex Lens', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q64',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Magnetic Field Around a Vertical Conductor',
    questionNumber: 64,
    question: 'For a vertical straight conductor carrying electric current directed upwards, what is the orientation and direction of the induced magnetic field lines when viewed from above?',
    options: [
      'Anti-clockwise and in the plane of the current carrying conductor',
      'Anti-clockwise and in a plane perpendicular to the current carrying conductor',
      'Clockwise and in the plane of the current carrying conductor',
      'Clockwise and in a plane perpendicular to the current carrying conductor'
    ],
    correctIndex: 1,
    explanation: 'According to Maxwell\'s Right-Hand Thumb Rule, if the thumb points upward in the direction of current, the fingers encircle the wire in concentric circles in a horizontal plane perpendicular to the conductor. Viewed from above, the field direction is anti-clockwise.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Right hand thumb rule geometry.',
    difficulty: 'Medium',
    tags: ['Science', 'Physics', 'Electromagnetism', 'Right Hand Rule', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q65',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Gravitation: Simultaneous Scaling of Mass and Distance',
    questionNumber: 65,
    question: 'If the distance between two masses becomes 4 times and the mass of each body is doubled, what happens to the gravitational force between them?',
    options: [
      '1/8 of original',
      '1/6 of original',
      '1/4 of original',
      'Remains the same'
    ],
    correctIndex: 2,
    explanation: 'Original force F = G(m₁m₂)/r². New masses m₁\' = 2m₁, m₂\' = 2m₂, new distance r\' = 4r. New force F\' = G(2m₁ × 2m₂) / (4r)² = 4 G(m₁m₂) / (16r²) = (4/16) F = (1/4) F.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Scaling laws in Newtonian gravitation.',
    difficulty: 'Easy',
    tags: ['Science', 'Physics', 'Gravitation', 'Inverse Square Law', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q66',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Acoustics: Amplitude vs Pitch',
    questionNumber: 66,
    question: 'During the Independence Day parade, a drummer strikes a drum much harder. What is the immediate acoustic result?',
    options: [
      'Amplitude of the sound becomes higher',
      'Pitch of the sound becomes higher',
      'Pitch and amplitude of the sound remains unchanged',
      'Pitch changes and amplitude of sound remains unchanged'
    ],
    correctIndex: 0,
    explanation: 'Striking the membrane with greater mechanical energy causes greater displacement of the drumhead, which increases the amplitude of the sound wave (producing higher loudness). Pitch depends on frequency (tension, mass per unit area), which remains constant.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Acoustics and wave dynamics.',
    difficulty: 'Easy',
    tags: ['Science', 'Physics', 'Sound', 'Amplitude', 'Loudness', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q67',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Electric Circuits: Bulbs in Series Network',
    questionNumber: 67,
    question: 'Two electric bulbs, one rated 40W at 220V and the other 60W at 220V, are connected in series across a 220V power supply. What total current is drawn from the supply?',
    options: [
      '0.11 A',
      '0.22 A',
      '0.011 A',
      '0.022 A'
    ],
    correctIndex: 0,
    explanation: 'Resistance of 40W bulb: R₁ = V² / P₁ = 220² / 40 = 48400 / 40 = 1210 Ω.\nResistance of 60W bulb: R₂ = V² / P₂ = 220² / 60 = 48400 / 60 = 806.67 Ω.\nTotal series resistance: R_total = 1210 + 806.67 = 2016.67 Ω.\nTotal current: I = V / R_total = 220 / 2016.67 ≈ 0.109 A ≈ 0.11 A.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Power, resistance and series current.',
    difficulty: 'Hard',
    tags: ['Science', 'Physics', 'Electricity', 'Power', 'Series Circuit', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q68',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Redox Reactions: Identification of Agents',
    questionNumber: 68,
    question: 'Which of the following statements about the given reaction are correct?\n3Fe + 4H₂O → Fe₃O₄ + 4H₂\n1. Iron metal is getting oxidized\n2. Water is getting reduced\n3. Water is acting as a reducing agent\n4. Water is acting as an oxidizing agent',
    options: [
      '1 and 2',
      '2 and 4',
      '1, 2 and 4',
      '1, 2 and 3'
    ],
    correctIndex: 2,
    explanation: 'In 3Fe + 4H₂O → Fe₃O₄ + 4H₂: Iron gains oxygen to form Fe₃O₄ (Fe is oxidized). H₂O loses oxygen to become H₂ (H₂O is reduced). The substance that is reduced (H₂O) provides oxygen and acts as the oxidizing agent. Thus, statements 1, 2, and 4 are correct.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Redox definitions and oxidizing agents.',
    difficulty: 'Medium',
    tags: ['Science', 'Chemistry', 'Redox', 'Oxidation', 'Reduction', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q69',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Nuclear Chemistry: Definition of Isotopes',
    questionNumber: 69,
    question: 'Which of the following pairs of atoms represent isotopes?\n1. Atom with nucleus containing 20p + 15n\n2. Atom with nucleus containing 20p + 17n\n3. Atom with nucleus containing 18p + 22n\n4. Atom with nucleus containing 18p + 21n',
    options: [
      '1 and 3',
      '1 and 2',
      '2 and 3',
      '2 and 4'
    ],
    correctIndex: 1,
    explanation: 'Isotopes are atoms of the same chemical element having the same atomic number (same number of protons) but different mass numbers (different number of neutrons). Atoms 1 and 2 both have 20 protons (isotopes of each other), and atoms 3 and 4 both have 18 protons.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Nuclear structure of isotopes.',
    difficulty: 'Easy',
    tags: ['Science', 'Chemistry', 'Isotopes', 'Protons and Neutrons', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q70',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Chemical Equations: Balanced Displacement Reaction',
    questionNumber: 70,
    question: 'The reaction of aluminum atoms displacing hydrogen ions from dilute sulphuric acid can be represented by which balanced chemical equation?',
    options: [
      '2Al + 3H₂SO₄ → Al₂(SO₄)₃ + 3H₂',
      'Al + 3H₂SO₄ → Al₂(SO₄)₃ + H₂',
      '3Al + 2H₂SO₄ → Al₂(SO₄)₂ + 2H₂',
      '2Al + 6H₂SO₄ → Al₂(SO₄)₆ + 6H₂'
    ],
    correctIndex: 0,
    explanation: 'Aluminum has a valency of +3 (Al³⁺) and sulfate is SO₄²⁻, forming aluminum sulfate Al₂(SO₄)₃. Balancing the equation: 2Al + 3H₂SO₄ → Al₂(SO₄)₃ + 3H₂. The equation conserves atoms on both sides (2 Al, 6 H, 3 S, 12 O).',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Stoichiometric balancing.',
    difficulty: 'Easy',
    tags: ['Science', 'Chemistry', 'Displacement Reaction', 'Balancing Equations', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q71',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Carbon Compounds: Homologous Series Physical Gradation',
    questionNumber: 71,
    question: 'Consider the following statements:\nAssertion (A): In any homologous series, a gradual gradation in physical properties is observed as the molecular mass increases.\nReason (R): The melting and boiling points increase due to strengthening of intermolecular forces with increasing molecular mass.',
    options: [
      'Both (A) and (R) are true, and (R) is the correct explanation of (A).',
      '(A) is true, but (R) is false.',
      '(A) is false, but (R) is true.',
      'Both (A) and (R) are false.'
    ],
    correctIndex: 0,
    explanation: 'As molecular mass increases along a homologous series (by -CH₂- units), the surface area of molecules increases, leading to stronger van der Waals intermolecular attractions. This directly causes a smooth upward gradation in boiling and melting points.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Homologous series assertion-reason.',
    difficulty: 'Medium',
    tags: ['Science', 'Chemistry', 'Homologous Series', 'Carbon Compounds', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q72',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Acids, Bases & Salts: Universal Indicator pH Scale',
    questionNumber: 72,
    question: 'On adding a few drops of universal indicator to Glucose (M), Curd (N) and Caustic soda solution (O) taken separately in three test tubes, which option represents the decreasing order of pH of the solutions?',
    options: [
      'M > N > O',
      'O > M > N',
      'N > M > O',
      'O > N > M'
    ],
    correctIndex: 1,
    explanation: '• Caustic soda (NaOH, O) is a strong base with pH ~ 13-14 (purple/violet with universal indicator).\n• Glucose solution (M) is a neutral organic compound with pH ≈ 7 (green).\n• Curd (N) contains lactic acid, with an acidic pH ~ 4-4.5 (orange/yellow).\nDecreasing order of pH: O (Caustic soda) > M (Glucose) > N (Curd).',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Universal indicator and pH ranking.',
    difficulty: 'Medium',
    tags: ['Science', 'Chemistry', 'Acids and Bases', 'pH Scale', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q73',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Matter: Compounds vs Mixtures',
    questionNumber: 73,
    question: 'Consider the statements (X) and (Y) about compounds and choose the correct answer:\n(X) Elements mix chemically together in fixed proportion to form a new compound with entirely new properties.\n(Y) Constituent elements of a compound can be separated by simple physical methods like filtration or distillation.',
    options: [
      '(X) is true, (Y) is false.',
      '(X) is false, (Y) is true.',
      'Both (X) and (Y) are true.',
      'Both (X) and (Y) are false.'
    ],
    correctIndex: 0,
    explanation: 'A chemical compound consists of elements chemically bonded in fixed proportions by mass, possessing distinct properties from its elements (X is true). The constituent elements of a compound can only be separated by chemical or electrochemical reactions, never by physical separation techniques (Y is false).',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Compounds and chemical bonding.',
    difficulty: 'Easy',
    tags: ['Science', 'Chemistry', 'Compounds', 'Physical vs Chemical Separation', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q74',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Human Nervous System: Functional Anatomy of the Brain',
    questionNumber: 74,
    question: 'Look at the statements given by students about the human brain:\n(i) Involuntary actions like salivation and blood pressure are controlled by the medulla in the hindbrain.\n(ii) Sensory centres of hearing, smell, memory, and sight are located in the forebrain (cerebrum).\n(iii) The centre for sensation of hunger is located in the medulla.\n(iv) Riding a bicycle and posture control are coordinated by the forebrain.\nWhich statements are correct?',
    options: [
      '(iii), (i)',
      '(ii), (iii)',
      '(i), (ii)',
      '(i), (ii), (iii), (iv)'
    ],
    correctIndex: 2,
    explanation: 'Statement (i) is correct: medulla oblongata (hindbrain) regulates autonomic involuntary reflexes (salivation, vomiting, BP). Statement (ii) is correct: cerebrum (forebrain) coordinates sensory perception and cognition. Statement (iii) is incorrect: hunger centre is in the hypothalamus (forebrain). Statement (iv) is incorrect: motor coordination and equilibrium (riding a bicycle) are governed by the cerebellum (hindbrain).',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Divisions of the human brain.',
    difficulty: 'Hard',
    tags: ['Science', 'Biology', 'Human Brain', 'Hindbrain', 'Forebrain', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q75',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Human Digestion: Digestive Glands and Enzymes',
    questionNumber: 75,
    question: 'In the anatomical diagram of the human digestive system, glands are labelled: P (Salivary Gland), Q (Liver), R (Pancreas), S (Stomach). Which option correctly pairs a gland with its secreted enzyme?',
    options: [
      'P — Pepsin',
      'P — Ptyalin (Salivary Amylase)',
      'S — Trypsin',
      'R — Bile'
    ],
    correctIndex: 1,
    explanation: 'P (Salivary glands in buccal cavity) secretes Ptyalin (salivary amylase) which breaks down starch into maltose. S (Stomach) secretes Pepsin. R (Pancreas) secretes Trypsin and Lipase. Q (Liver) secretes Bile (which contains no enzymes).',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Digestive enzymes and organs.',
    difficulty: 'Medium',
    tags: ['Science', 'Biology', 'Digestion', 'Enzymes', 'Ptyalin', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q76',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Plant Physiology: Daytime Gas Exchange',
    questionNumber: 76,
    question: 'Assertion (A): During daytime, oxygen release is the major gaseous event in plants.\nReason (R): CO₂ generated during cellular respiration is consumed in photosynthesis during the day.',
    options: [
      '(A) is true, but (R) is false.',
      '(A) is false, but (R) is true.',
      'Both (A) and (R) are true, and (R) is the correct explanation of (A).',
      'Both (A) and (R) are true, but (R) is not the correct explanation of (A).'
    ],
    correctIndex: 2,
    explanation: 'During daylight hours, the rate of photosynthesis exceeds the rate of cellular respiration. The CO₂ released by respiration is immediately assimilated by photosynthetic carbon fixation, and the surplus O₂ produced by photolysis of water is released into the atmosphere.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Gaseous exchange in green plants.',
    difficulty: 'Medium',
    tags: ['Science', 'Biology', 'Photosynthesis', 'Respiration', 'Assertion-Reason', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q77',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Morphology of Flowering Plants: Longitudinal Section of Flower',
    questionNumber: 77,
    question: 'In the longitudinal section of a typical flower, parts are labelled: A (Stigma), B (Petal), C (Style), D (Anther). Which row correctly assigns the biological function to its labelled part?',
    options: [
      'A — Receives pollen grains during pollination',
      'B — Produces male gametes',
      'C — Produces the ovules',
      'D — Protects the flower in bud stage'
    ],
    correctIndex: 0,
    explanation: 'Part A is the Stigma, the sticky receptive surface of the carpel designed to receive pollen grains. Part C is the Style (elongated neck supporting stigma). Part D is the Anther (produces pollen/male germ cells). Part B is the Petal (attracts pollinators and maintains symmetry).',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Flower anatomy and pollination.',
    difficulty: 'Easy',
    tags: ['Science', 'Biology', 'Flower Anatomy', 'Stigma', 'Pollination', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q78',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Developmental Biology: Planarian Regeneration Capacity',
    questionNumber: 78,
    question: 'Planaria A is cut horizontally into three pieces 1, 2, and 3. Planaria B is cut vertically into two halves 4 and 5. Which of the cut pieces could regenerate into a complete organism?',
    options: [
      'Only 1, 2 and 3',
      'Only 1 and 3',
      'Only 4 and 5',
      'All 1, 2, 3, 4 and 5'
    ],
    correctIndex: 3,
    explanation: 'Planarians possess exceptional regenerative capabilities due to a population of adult pluripotent somatic stem cells known as "neoblasts". Whether sectioned horizontally (transversely) into head, middle, and tail (1, 2, 3) or longitudinally into halves (4, 5), each piece can regenerate missing tissues to form a whole organism.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Asexual reproduction and stem cell regeneration.',
    difficulty: 'Medium',
    tags: ['Science', 'Biology', 'Planaria', 'Regeneration', 'Neoblasts', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q79',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Environmental Health: Coliform Bacteria Contamination',
    questionNumber: 79,
    question: 'In an epidemiological survey analyzing coliform bacteria concentration versus the age of village wells, which conclusion reflects standard public health patterns?',
    options: [
      'Coliform bacteria presence decreases after a decade',
      'Coliform contamination is completely absent in shallow wells',
      'Older wells show higher percentage of coliform contamination due to structural cracking and leachate infiltration',
      'Well depth and lining materials have zero correlation with microbial contamination'
    ],
    correctIndex: 2,
    explanation: 'Total coliform and fecal coliform contamination in rural water supplies increases with well age due to mortar degradation, surface casing cracks, proximity to septic seepage, and biofilm accumulation, necessitating periodic testing and chlorination.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Environmental microbiology and water quality.',
    difficulty: 'Medium',
    tags: ['Science', 'Environmental Science', 'Coliform Bacteria', 'Water Quality', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q80',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Atmospheric Physics: Mechanism of Lightning',
    questionNumber: 80,
    question: 'During the monsoon season, lightning strikes occur frequently. What is the fundamental physical cause of lightning discharges in the atmosphere?',
    options: [
      'The collision of positive and positive electrical charges in the atmosphere',
      'The repulsion of negative and negative electrical charges in the atmosphere',
      'The massive electrostatic discharge resulting from separation and buildup of opposite positive and negative charges in clouds and ground',
      'The repulsion of positive and positive electrical charges in the atmosphere'
    ],
    correctIndex: 2,
    explanation: 'Updrafts and downdrafts in cumulonimbus clouds cause friction between ice pellets and supercooled water droplets, separating charges (positive charges accumulate near the cloud top, negative charges near the base). When electric fields exceed dielectric breakdown of air, rapid electrostatic discharge occurs between opposite charges.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Electrostatic discharge and atmospheric phenomena.',
    difficulty: 'Easy',
    tags: ['Science', 'Physics', 'Lightning', 'Electrostatics', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q81',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Cognitive Domains in Science Assessment',
    questionNumber: 81,
    question: 'After conducting a rectangular glass slab refraction experiment, a teacher asks two questions:\nQuestion 1: "State Snell\'s law of refraction."\nQuestion 2: "Calculate the refractive index from your recorded angles and label the incident, refracted, and emergent rays on the diagram."\nWhich cognitive domains (Bloom\'s revised taxonomy) do these two questions assess?',
    options: [
      'Question 1: Recall of facts; Question 2: Understanding only',
      'Question 1: Recall of facts; Question 2: Application of concepts',
      'Question 1: Understanding; Question 2: Application of concepts',
      'Question 1: Understanding; Question 2: Understanding'
    ],
    correctIndex: 1,
    explanation: 'Stating Snell\'s law (sin i / sin r = constant) tests retrieval of memorized definitions from long-term memory (Recall/Remembering facts). Calculating values from experimental data and labeling rays tests the ability to apply abstract optical formulas to novel concrete situations (Application of concepts).',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Bloom\'s taxonomy cognitive domains in science.',
    difficulty: 'Medium',
    tags: ['Science Pedagogy', 'Bloom\'s Taxonomy', 'Refraction', 'Assessment', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q82',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Laboratory Inquiry: Ohm\'s Law Non-Linearity',
    questionNumber: 82,
    question: 'During an Ohm\'s law verification experiment, a student plots an I-V graph and observes a curve that bends upward rather than a straight line passing through the origin. What should be the teacher\'s pedagogical response?',
    options: [
      'Ask the student to erase the graph and copy the theoretical line from the textbook',
      'Scaffold the student to investigate whether the resistor heated up or if a non-ohmic device (e.g., diode or filament bulb) was used',
      'Penalize the student for careless meter readings',
      'Conclude that Ohm\'s law has been disproven'
    ],
    correctIndex: 1,
    explanation: 'A scientific anomaly provides an authentic learning moment. Ohm\'s law assumes constant temperature (V ∝ I for ohmic conductors). Non-linearity typically arises from Joule heating changing resistance or using a non-ohmic component. Guiding the student to investigate causes fosters true inquiry.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Science lab inquiry and error investigation.',
    difficulty: 'Medium',
    tags: ['Science Pedagogy', 'Ohm\'s Law', 'Laboratory Inquiry', 'Non-Ohmic Devices', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q83',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'NCF 2005 Science Curriculum at Upper Primary',
    questionNumber: 83,
    question: 'Which of the following are explicit recommendations made by NCF 2005 for teaching the science curriculum at the upper primary stage?\n(i) Learning principles of science through familiar lived experiences\n(ii) Experimentation as a tool to discover and verify theoretical principles\n(iii) Emphasis on experiments, technology, and real-life problem solving\n(iv) Designing simple technological units and working modules using low-cost materials',
    options: [
      '(iii), (i)',
      '(ii), (iii)',
      '(i), (iv)',
      '(i), (ii), (iii), (iv)'
    ],
    correctIndex: 3,
    explanation: 'NCF 2005 mandates that at the upper primary stage, science should be engaged as hands-on inquiry: grounded in familiar everyday contexts, leveraging low-cost experiments, encouraging model-making, and integrating technology and problem-solving.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - NCF 2005 science curriculum criteria.',
    difficulty: 'Easy',
    tags: ['Science Pedagogy', 'NCF 2005', 'Inquiry Science', 'Curriculum', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q84',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Curriculum Validity: Historical Validity of Science',
    questionNumber: 84,
    question: 'A teacher in a 10th-grade class screens a video on the evolution of atomic models (from Dalton to Thomson, Rutherford, Bohr, and quantum mechanical model) highlighting the contributions and limitations of each scientist. Which validity criterion of a sound science curriculum is she fulfilling?',
    options: [
      'Cognitive validity',
      'Ethical validity',
      'Historical validity',
      'Environmental validity'
    ],
    correctIndex: 2,
    explanation: 'According to NCF 2005, Historical Validity requires that science teaching demonstrates how scientific concepts evolve over time through empirical evidence, challenges to existing paradigms, and social contexts, showing science as a dynamic, tentative human enterprise.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - NCF 2005 curriculum validities.',
    difficulty: 'Easy',
    tags: ['Science Pedagogy', 'Historical Validity', 'Atomic Models', 'NCF 2005', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q85',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Laboratory Equipment Confidence & Pedagogy',
    questionNumber: 85,
    question: 'Before teaching a microscopy unit on the cell in Grade 9, the teacher senses students\' hesitation and anxiety regarding handling a compound microscope. The best pedagogical approach to overcome this is:',
    options: [
      'Repeatedly demonstrating the parts, coarse/fine focus adjustment, and safe handling procedures while guiding hands-on trial',
      'Allowing students to dismantle and reassemble the microscope optical lenses',
      'Repeatedly talking about the theoretical working principle of light refraction',
      'Showing a video illustrating parts and canceling physical microscope sessions'
    ],
    correctIndex: 0,
    explanation: 'Laboratory self-efficacy is built through teacher demonstration paired with scaffolded, low-stakes hands-on practice. Explaining how to carry the microscope with two hands, rack down with coarse adjustment, and focus with fine adjustment alleviates fear of damaging delicate lenses.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Science lab safety and equipment training.',
    difficulty: 'Easy',
    tags: ['Science Pedagogy', 'Microscope', 'Lab Pedagogy', 'Hands-on Learning', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q86',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Cytology Practical: Temporary Mount of Human Cheek Cell',
    questionNumber: 86,
    question: 'Students prepare a temporary stained mount of human cheek epithelial cells under a compound microscope:\ni. Focusing the objective lens using adjustment knobs\nii. Scraping and placing the cheek cell scrapings on the glass slide\niii. Gently lowering the coverslip to avoid air bubbles\niv. Adding a drop of dilute methylene blue or safranin stain\nWhich sequence represents the correct chronological laboratory procedure?',
    options: [
      'iv, iii, i, ii',
      'iii, i, ii, iv',
      'ii, iv, iii, i',
      'i, ii, iv, iii'
    ],
    correctIndex: 2,
    explanation: 'The standard histological protocol for mounting human cheek cells is:\n1. Place the cellular scraping in a drop of water on a clean glass slide (ii).\n2. Add a drop of stain (methylene blue or safranin) to highlight the nucleus (iv).\n3. Carefully cover with a coverslip using a mounting needle to avoid bubbles (iii).\n4. Place on microscope stage and focus under low power then high power (i).\nCorrect sequence: ii, iv, iii, i.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Cell biology laboratory procedures.',
    difficulty: 'Medium',
    tags: ['Science Pedagogy', 'Cheek Cell', 'Staining', 'Microscopy Protocol', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q87',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Digital Pedagogical Resources: Open Educational Resources (OER)',
    questionNumber: 87,
    question: 'Which of the following statements are correct about Open Educational Resources (OER)?\n(i) Teaching, learning, and research resources residing in the public domain or released under an open intellectual property license\n(ii) Involves substantial commercial royalty payment for classroom re-use\n(iii) Permits free no-cost access, reuse, adaptation, and redistribution by teachers and students\n(iv) Strictly forbids teachers from adapting or translating content into local vernacular languages',
    options: [
      '(ii), (i)',
      'Only (i)',
      '(i), (iii)',
      'Only (iii)'
    ],
    correctIndex: 2,
    explanation: 'As defined by UNESCO and NEP 2020, OER encompasses learning materials that are either in the public domain or released under open copyright licenses (such as Creative Commons), granting educators and students free legal rights to retain, reuse, revise, remix, and redistribute content without paying royalties.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - OER and educational technology.',
    difficulty: 'Easy',
    tags: ['Science Pedagogy', 'OER', 'Digital Resources', 'NEP 2020', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q88',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Community-Based Project Learning: 21st Century Skills',
    questionNumber: 88,
    question: 'A science teacher creates sub-groups of Class 10 students and engages them with farmers of the local Sikkim neighbourhood to investigate seasonal flooding and terraced field run-off. Each group analyzes the problem and presents probable ecological solutions. Which skills is she actively promoting and assessing?\ni. Collaboration\nii. Creativity\niii. Problem solving\niv. Communication',
    options: [
      'i, ii, iii',
      'i, ii, iii, iv',
      'ii, iii',
      'iv, iii, ii'
    ],
    correctIndex: 1,
    explanation: 'Community-linked project-based learning targets the complete 4Cs of 21st-century education:\n• Collaboration (sub-group teamwork)\n• Creativity (devising novel ecological solutions)\n• Problem solving (analyzing run-off and drainage)\n• Communication (interviewing farmers and presenting findings to peers).',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Project-based 21st century competencies.',
    difficulty: 'Easy',
    tags: ['Science Pedagogy', 'Project-Based Learning', '4Cs Skills', 'Sikkim Context', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q89',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Constructivist Lesson Sequencing: Acids, Bases and Salts',
    questionNumber: 89,
    question: 'A chemistry teacher is planning to teach the concept of acids and bases to Grade 7 students. What is the most pedagogically effective constructivist sequence?\n(i) Student groups present findings moderated by the teacher\n(ii) Students use indicators on different available test solutions in groups\n(iii) Exploring students\' prior everyday knowledge about acidic and basic substances in their homes\n(iv) Introducing indicators (litmus, turmeric, china rose) that can be used to test substances',
    options: [
      '(iii), (iv), (ii), (i)',
      '(iii), (ii) and (i)',
      '(iv), (ii) and (i)',
      'Only (ii) and (i)'
    ],
    correctIndex: 0,
    explanation: 'A sound constructivist learning trajectory follows the 5E sequence:\n1. Prior Knowledge Activation (Engage): (iii) elicit familiar tastes and household substances (lemon, soap).\n2. Tool Introduction (Explain/Explore setup): (iv) introduce indicator reagents.\n3. Hands-on Experimentation (Explore): (ii) test various samples with indicators in small groups.\n4. Synthesis & Communication (Elaborate/Evaluate): (i) present group findings with teacher moderation.\nCorrect sequence: (iii), (iv), (ii), (i).',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Constructivist lesson sequencing.',
    difficulty: 'Medium',
    tags: ['Science Pedagogy', 'Acids and Bases', '5E Sequence', 'Inquiry Teaching', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  },
  {
    id: 'gt-ms-2025-q90',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Assessment of Learning: Formative Diagnostic Testing',
    questionNumber: 90,
    question: 'Which of the following statements are true regarding Diagnostic Assessment in secondary science teaching?\ni. It is used to gauge learners\' alternative conceptions and intuitive preconceptions.\nii. It is used to ascertain the level of students\' prior existing foundational knowledge.\niii. It can be conducted during instruction or at the conclusion of a topic to pinpoint precise learning gaps.\niv. Its results are used to design targeted scaffolding and remedial interventions rather than assigning comparative grades.',
    options: [
      'Only i, ii and iii',
      'Only i, ii and iv',
      'Only ii, iii and iv',
      'All i, ii, iii and iv'
    ],
    correctIndex: 3,
    explanation: 'Diagnostic assessment is purely formative and non-evaluative. Its primary pedagogical functions are uncovering misconceptions, evaluating prerequisite knowledge, pinpointing where gaps occur, and providing evidence to adapt teaching and scaffold remedial instruction.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2025 - Diagnostic assessment principles.',
    difficulty: 'Easy',
    tags: ['Science Pedagogy', 'Diagnostic Assessment', 'Formative Assessment', 'STET GT 2025'],
    previousPaperSet: 'STET GT Maths & Science 2025 Official Paper'
  }
];
