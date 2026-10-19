import { Question } from '../types';

/**
 * STET GT (Graduate Teacher) Maths & Science - 2022 Official Previous Paper
 * Transcribed verbatim from official 2022 examination booklet:
 * - Mathematics: Questions 31 - 60
 * - Science: Questions 61 - 81
 */
export const GT_MATHS_SCIENCE_2022_QUESTIONS: Question[] = [
  // --- MATHEMATICS (Questions 31 to 60) ---
  {
    id: 'gt-ms-2022-q31',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Real Numbers: Rational and Irrational Numbers',
    questionNumber: 31,
    question: 'Which of the numbers π and 22/7 is/are irrational?',
    options: [
      'π is irrational',
      'Both are irrational',
      '22/7 is irrational',
      'Both are rational'
    ],
    correctIndex: 0,
    explanation: 'π is an irrational and transcendental number whose decimal expansion is non-terminating and non-repeating. In contrast, 22/7 is a quotient of two integers (p/q with q ≠ 0), making it a rational number that is merely an approximation of π.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Number system fundamentals.',
    difficulty: 'Easy',
    tags: ['Mathematics', 'Real Numbers', 'Irrational Numbers', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q32',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Commercial Mathematics: Simple vs Compound Interest',
    questionNumber: 32,
    question: 'What would be the relation between compound and simple interest if the principal and rate of interest remains the same for 1 year for a particular account (compounded annually)?',
    options: [
      'CI ≠ SI',
      'CI > SI',
      'CI = SI',
      'CI < SI'
    ],
    correctIndex: 2,
    explanation: 'For the first compounding period (1 year with annual compounding), the interest is calculated on the same initial principal in both cases: SI = (P × R × 1)/100 and CI = P(1 + R/100)¹ - P = (P × R)/100. Thus, CI = SI.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Commercial arithmetic.',
    difficulty: 'Easy',
    tags: ['Mathematics', 'Simple Interest', 'Compound Interest', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q33',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Percentage & GST: Successive Modifications',
    questionNumber: 33,
    question: 'There are two offers on a book priced ₹800: (A) 10% discount then 5% GST. (B) 5% GST and then 10% discount. Which ends would be cheaper?',
    options: [
      'A',
      'B',
      'Both are same',
      'Incomplete'
    ],
    correctIndex: 2,
    explanation: 'Multiplication is commutative. In offer (A), Final Price = 800 × (1 - 0.10) × (1 + 0.05) = 800 × 0.90 × 1.05 = ₹756. In offer (B), Final Price = 800 × (1 + 0.05) × (1 - 0.10) = 800 × 1.05 × 0.90 = ₹756. Both end at the exact same price.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Percentage and discount commutativity.',
    difficulty: 'Easy',
    tags: ['Mathematics', 'Percentage', 'Discount', 'GST', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q34',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Integers: Directed Number Operations',
    questionNumber: 34,
    question: 'An elevator is on the 20th floor of a hotel. It first goes down 13 floors, then goes up 7 floors, and finally descends 13 floors. What floor is the elevator on now?',
    options: [
      '1st Floor',
      '5th Floor',
      '7th Floor',
      'Basement Floor'
    ],
    correctIndex: 0,
    explanation: 'Initial floor = 20. Net movement = 20 - 13 + 7 - 13 = 20 - 26 + 7 = 1st Floor.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Real-life integer arithmetic.',
    difficulty: 'Easy',
    tags: ['Mathematics', 'Integers', 'Arithmetic', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q35',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Exponents and Powers',
    questionNumber: 35,
    question: 'The value of (-2)⁴ ÷ (-2)² is:',
    options: [
      '1/4',
      '1/64',
      '64',
      '4'
    ],
    correctIndex: 3,
    explanation: 'Using the quotient law of exponents: aᵐ ÷ aⁿ = aᵐ⁻ⁿ. Here, (-2)⁴ ÷ (-2)² = (-2)⁴⁻² = (-2)² = 4. Alternatively, (-2)⁴ = 16 and (-2)² = 4; 16 ÷ 4 = 4.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Laws of indices.',
    difficulty: 'Easy',
    tags: ['Mathematics', 'Exponents', 'Laws of Indices', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q36',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Number Theory: Non-terminating Non-repeating Decimals',
    questionNumber: 36,
    question: 'A teacher told her students: "any number that is non-terminating and non-repeating is irrational". Which of the following numbers best supports the teacher\'s statement?',
    options: [
      '9/11',
      '√5',
      '0.333....',
      '1.41421'
    ],
    correctIndex: 1,
    explanation: '√5 is the square root of a non-perfect square, which expands into an infinite non-terminating, non-repeating decimal (2.2360679...). In contrast, 9/11 = 0.8181... (repeating rational), 0.333... = 1/3 (repeating rational), and 1.41421 is a terminating rational.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Decimal representations.',
    difficulty: 'Easy',
    tags: ['Mathematics', 'Real Numbers', 'Irrationality', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q37',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Quadratic Equations: Nature of Roots',
    questionNumber: 37,
    question: 'A rectangular garden has an area of 96m². Its length is 4 meters more than its width. What is the nature of the roots of the quadratic equation formed, to find the width of the garden?',
    options: [
      'Real and Equal',
      'Real and Distinct',
      'Imaginary',
      'Cannot be determined'
    ],
    correctIndex: 1,
    explanation: 'Let width = w. Then length = w + 4. Area equation: w(w + 4) = 96 ⟹ w² + 4w - 96 = 0. Discriminant D = b² - 4ac = 4² - 4(1)(-96) = 16 + 384 = 400. Since D > 0, the roots are Real and Distinct (specifically w = 8 and w = -12).',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Discriminant analysis.',
    difficulty: 'Medium',
    tags: ['Mathematics', 'Quadratic Equations', 'Discriminant', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q38',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Patterns and Sequences',
    questionNumber: 38,
    question: 'A certain pattern of tiles is made up of squares. The number of tiles in the nth figure is Tₙ = n² + n. What is the number of tiles in the 6th figure?',
    options: [
      '36',
      '42',
      '48',
      '50'
    ],
    correctIndex: 1,
    explanation: 'Substitute n = 6 into the general term formula: T₆ = 6² + 6 = 36 + 6 = 42 tiles.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Quadratic algebraic patterns.',
    difficulty: 'Easy',
    tags: ['Mathematics', 'Sequences', 'Patterns', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q39',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Algebraic Identities',
    questionNumber: 39,
    question: 'If x + y = 7 and xy = 10, find x² + y².',
    options: [
      '29',
      '69',
      '39',
      '59'
    ],
    correctIndex: 0,
    explanation: 'Using the algebraic identity (x + y)² = x² + y² + 2xy. Substituting values: 7² = x² + y² + 2(10) ⟹ 49 = x² + y² + 20 ⟹ x² + y² = 49 - 20 = 29.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Polynomial identities.',
    difficulty: 'Easy',
    tags: ['Mathematics', 'Algebra', 'Identities', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q40',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Number Series Reasoning',
    questionNumber: 40,
    question: 'What is the next term in the following series?\n2, 15, 41, 80, ......?',
    options: [
      '120',
      '121',
      '132',
      '111'
    ],
    correctIndex: 2,
    explanation: 'Examine successive first differences:\n15 - 2 = 13 (13 × 1)\n41 - 15 = 26 (13 × 2)\n80 - 41 = 39 (13 × 3)\nThe differences increase by 13 each time. The next difference is 13 × 4 = 52. Thus, the next term = 80 + 52 = 132.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Arithmetic difference series.',
    difficulty: 'Medium',
    tags: ['Mathematics', 'Number Series', 'Arithmetic Progression', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q41',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Mensuration: Circle Scaling Properties',
    questionNumber: 41,
    question: 'If the diameter of a circle is doubled, how does its area change?',
    options: [
      'Doubles',
      'Becomes four times',
      'Becomes half',
      'Remains the same'
    ],
    correctIndex: 1,
    explanation: 'Area of circle A = πr² = π(d/2)². If the diameter d is doubled to 2d, the new area becomes A\' = π(2d/2)² = 4 × π(d/2)² = 4A. The area quadruples (becomes four times).',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Scaling relations in 2D mensuration.',
    difficulty: 'Easy',
    tags: ['Mathematics', 'Geometry', 'Circles', 'Mensuration', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q42',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: '3D Mensuration: Ratio of Volumes',
    questionNumber: 42,
    question: 'A cone and a cylinder have the same base radius and height. What is the ratio of the volume of the cone to that of the cylinder?',
    options: [
      '1:2',
      '2:3',
      '1:3',
      '3:1'
    ],
    correctIndex: 2,
    explanation: 'Volume of cone = (1/3)πr²h. Volume of cylinder = πr²h. The ratio V_cone : V_cylinder = [(1/3)πr²h] : [πr²h] = 1/3 : 1 = 1:3.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Solid geometry ratios.',
    difficulty: 'Easy',
    tags: ['Mathematics', 'Mensuration', 'Cone', 'Cylinder', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q43',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Area of Composite Figures',
    questionNumber: 43,
    question: 'From a square board of side 14 cm, a semicircle is removed whose diameter equals one side of the square. What will be the area of the remaining board?',
    options: [
      '196 cm²',
      '273 cm²',
      '119 cm²',
      '77 cm²'
    ],
    correctIndex: 2,
    explanation: 'Area of square = side² = 14 × 14 = 196 cm². Semicircle diameter = 14 cm ⟹ radius r = 7 cm. Area of semicircle = (1/2)πr² = (1/2) × (22/7) × 49 = 77 cm². Remaining area = 196 - 77 = 119 cm².',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Plane geometry composite regions.',
    difficulty: 'Medium',
    tags: ['Mathematics', 'Mensuration', 'Square', 'Semicircle', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q44',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Properties of Parallelograms',
    questionNumber: 44,
    question: 'PQRS is a parallelogram in which PQ = (4x + 1) cm, QR = 26 cm, RS = 25 cm and PS = (3y - 1) cm. Then the value of 3x + 2y (in cm) is:',
    options: [
      '39',
      '35',
      '36',
      '38'
    ],
    correctIndex: 2,
    explanation: 'In a parallelogram, opposite sides are equal in length:\n1. PQ = RS ⟹ 4x + 1 = 25 ⟹ 4x = 24 ⟹ x = 6.\n2. PS = QR ⟹ 3y - 1 = 26 ⟹ 3y = 27 ⟹ y = 9.\nNow compute 3x + 2y = 3(6) + 2(9) = 18 + 18 = 36 cm.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Parallelogram side congruence.',
    difficulty: 'Medium',
    tags: ['Mathematics', 'Geometry', 'Parallelogram', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q45',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Arc Length of Circular Sector',
    questionNumber: 45,
    question: 'A sprinkler is placed at the centre of a circular garden. It sprays water to cover a sector of 90°. If the total circumference of the circular garden is 44m, what is the length of the arc watered by the sprinkler?',
    options: [
      '11 m',
      '22 m',
      '44 m',
      '30 m'
    ],
    correctIndex: 0,
    explanation: 'The sector has central angle θ = 90°. Arc length = (θ / 360°) × Total Circumference = (90° / 360°) × 44 m = (1/4) × 44 m = 11 m.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Circular arc geometry.',
    difficulty: 'Easy',
    tags: ['Mathematics', 'Circles', 'Arc Length', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q46',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Parallel Lines and Transversal Angles',
    questionNumber: 46,
    question: 'The two corresponding angles formed by the intersection of two parallel lines by a transversal are (3x - 20°) and (5x - 60°). The value of (4x + 30°) is:',
    options: [
      '150°',
      '90°',
      '110°',
      '130°'
    ],
    correctIndex: 2,
    explanation: 'Corresponding angles on parallel lines are equal:\n3x - 20 = 5x - 60 ⟹ 2x = 40 ⟹ x = 20°.\nNow calculate the required angle: 4x + 30° = 4(20°) + 30° = 80° + 30° = 110°.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Corresponding angles property.',
    difficulty: 'Easy',
    tags: ['Mathematics', 'Geometry', 'Parallel Lines', 'Transversal', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q47',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Inscribed and Circumscribed Geometric Figures',
    questionNumber: 47,
    question: 'A circle is drawn inside a square of side 14 cm, touching all four sides. A smaller square is then drawn inside the circle such that all its corners touch the circle. Find the area of the shaded region outside the smaller square but inside the larger square.',
    options: [
      '28 cm²',
      '58 cm²',
      '98 cm²',
      '112 cm²'
    ],
    correctIndex: 2,
    explanation: '1. Area of outer square = 14 × 14 = 196 cm².\n2. The circle inscribed in the outer square has diameter d = 14 cm (radius r = 7 cm).\n3. The inner square is inscribed in the circle, meaning its diagonal equals the circle\'s diameter = 14 cm.\n4. Area of inner square = (diagonal)² / 2 = 14² / 2 = 196 / 2 = 98 cm².\n5. Area between the two squares = 196 - 98 = 98 cm².',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Inscribed polygon areas.',
    difficulty: 'Medium',
    tags: ['Mathematics', 'Geometry', 'Inscribed Figures', 'Mensuration', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q48',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Data Interpretation: North East Rainfall Analysis',
    questionNumber: 48,
    question: 'The average rainfall in eight North East States on a particular day in August is recorded as: Arunachal Pradesh: 10.8mm, Assam: 8.5mm, Nagaland: 14.3mm, Manipur: 1.3mm, Mizoram: 22.0mm, Tripura: 7.4mm, Meghalaya: 37.7mm, Sikkim: 19.7mm. How does the rainfall of Sikkim compare with the regional average?',
    options: [
      'More than the average of all the North Eastern States',
      'Less than the average of all the North Eastern States',
      'Equal to the average of all the North Eastern States',
      'Data provided is not sufficient'
    ],
    correctIndex: 0,
    explanation: 'Sum of rainfall in all 8 states = 10.8 + 8.5 + 14.3 + 1.3 + 22.0 + 7.4 + 37.7 + 19.7 = 121.7 mm. Average = 121.7 / 8 = 15.21 mm. Since Sikkim\'s rainfall is 19.7 mm, which is greater than 15.21 mm, Sikkim has more rainfall than the regional average.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Contextual data handling.',
    difficulty: 'Medium',
    tags: ['Mathematics', 'Statistics', 'Data Handling', 'Sikkim Rainfall', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q49',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Statistics: Central Tendency Perturbation',
    questionNumber: 49,
    question: 'The marks (out of 20) obtained by 10 students in a test are: 12, 15, 13, 15, 14, 16, 13, 14, 15, 14. The teacher later realizes that one student who scored 16 was wrongly recorded and should have been 10 instead. After correcting the data, which of the following statements is true?',
    options: [
      'The mean decreases, median and mode remain the same',
      'The mode changes, but mean and median remain the same',
      'All the measures change',
      'The range and mode change, but mean and median remain the same'
    ],
    correctIndex: 0,
    explanation: 'Original sorted data: 12, 13, 13, 14, 14, 14, 15, 15, 15, 16. Sum = 141, Mean = 14.1. Median = (14+14)/2 = 14. Modes are 14 and 15 (each appears 3 times).\nCorrected sorted data (replace 16 with 10): 10, 12, 13, 13, 14, 14, 14, 15, 15, 15. Sum = 135, Mean = 13.5 (decreased).\nMedian is still 5th and 6th values: (14+14)/2 = 14 (unchanged). Modes are still 14 and 15 (unchanged). Thus, mean decreases, while median and mode remain unchanged.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Mean, median, and mode robustness.',
    difficulty: 'Hard',
    tags: ['Mathematics', 'Statistics', 'Central Tendency', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q50',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Probability: Odds and Ratio Analysis',
    questionNumber: 50,
    question: 'A bag contains 6 identical red balls and some green balls. A student says that the probability of drawing a red ball is twice the probability of drawing a green ball. How many green balls are there in the bag?',
    options: [
      '3',
      '6',
      '9',
      '12'
    ],
    correctIndex: 0,
    explanation: 'Let the number of green balls be g. Total balls = 6 + g. P(Red) = 6/(6 + g) and P(Green) = g/(6 + g). Given P(Red) = 2 × P(Green) ⟹ 6/(6 + g) = 2g/(6 + g) ⟹ 6 = 2g ⟹ g = 3 green balls.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Probability equations.',
    difficulty: 'Easy',
    tags: ['Mathematics', 'Probability', 'Ratios', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q51',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Mathematics Pedagogy: Role of TLMs',
    questionNumber: 51,
    question: 'What is a key purpose of using TLMs (Teaching-Learning Materials) in mathematics classrooms?',
    options: [
      'To prepare students for exams',
      'To replace textbooks',
      'To visualize abstract concepts',
      'To increase homework'
    ],
    correctIndex: 2,
    explanation: 'Mathematical concepts are inherently abstract and hierarchical. Concrete TLMs (such as geoboards, base-ten blocks, and fractional discs) provide visual and manipulative anchors, helping learners transition from concrete operations to abstract reasoning.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Concrete-representational-abstract continuum.',
    difficulty: 'Easy',
    tags: ['Mathematics Pedagogy', 'TLMs', 'Abstract Thinking', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q52',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Nature of Mathematics: Inductive vs Deductive Reasoning',
    questionNumber: 52,
    question: 'The statement "mathematics is both inductive and deductive in nature" means:',
    options: [
      'Students should memorize steps thoroughly',
      'Teachers must teach both concrete examples and general proofs',
      'Only one method of reasoning should be used',
      'Learning is restricted to symbolic manipulation'
    ],
    correctIndex: 1,
    explanation: 'Inductive mathematics involves exploring patterns, observing specific concrete cases, and formulating conjectures. Deductive mathematics involves logically validating these conjectures through formal axioms and generalized deductive proofs. Effective pedagogy balances both.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Philosophy of mathematics education.',
    difficulty: 'Medium',
    tags: ['Mathematics Pedagogy', 'Inductive-Deductive', 'Epistemology', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q53',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Mathematical Representation: Notation vs Logic',
    questionNumber: 53,
    question: 'If a student uses a non-standard notation but arrives at the correct mathematical answer through sound argumentation, what does this reveal about the nature of mathematics?',
    options: [
      'Mathematics tolerates ambiguity',
      'Symbolic language is not important',
      'Logical reasoning matters more than notation',
      'Without correct symbols, answer is wrong'
    ],
    correctIndex: 2,
    explanation: 'Notation and mathematical symbols are tools for communication, but mathematical truth and understanding stem fundamentally from logical coherence, valid relations, and sound reasoning rather than mechanical adherence to standard symbols.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Mathematical communication.',
    difficulty: 'Medium',
    tags: ['Mathematics Pedagogy', 'Logic vs Notation', 'Assessment', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q54',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Mathematical Communication: Verbalizing Algebra',
    questionNumber: 54,
    question: 'A teacher asks students to explain, in words, the meaning of the algebraic statement 5(x + 7) = 45. Many students can solve it mechanically for x = 2 but cannot verbalize its meaning in natural language. What does this suggest about their learning?',
    options: [
      'They have strong conceptual understanding',
      'They can compute but struggle with translating math into natural language',
      'They do not understand algebraic notation',
      'They need more memorization of definitions'
    ],
    correctIndex: 1,
    explanation: 'Procedural fluency without communicative articulation indicates that learners have memorized computational steps (such as distributing or dividing) but have not internalized the semantic connection between symbolic equations and verbal word contexts.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Procedural vs conceptual understanding.',
    difficulty: 'Medium',
    tags: ['Mathematics Pedagogy', 'Mathematical Communication', 'Algebra', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q55',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Life Skills Development through Mathematics',
    questionNumber: 55,
    question: 'How does mathematics education contribute to developing life skills in students according to NCF 2005?',
    options: [
      'It only teaches calculations for daily calculations',
      'It builds logical thinking, decision-making, and analytical reasoning',
      'It focuses mainly on memorizing formulas',
      'It helps in learning other subjects'
    ],
    correctIndex: 1,
    explanation: 'NCF 2005 underscores that the higher goal of school mathematics is "mathematisation of the child\'s thought processes"—building logical analysis, systematic problem representation, critical evaluation, and sound decision-making.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - NCF 2005 mathematics aims.',
    difficulty: 'Easy',
    tags: ['Mathematics Pedagogy', 'NCF 2005', 'Life Skills', 'Mathematisation', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q56',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Ethnomathematics: Cultural Contextualization',
    questionNumber: 56,
    question: 'A teacher wants to introduce the concept of fraction to the class using an ethnomathematical approach. Which of the following would be the most appropriate pedagogical practice?',
    options: [
      'Explaining fraction using numbers on the board',
      'Using slices of a local dish',
      'Asking them to memorize definitions',
      'Giving worksheet'
    ],
    correctIndex: 1,
    explanation: 'Ethnomathematics connects mathematical ideas to cultural artifacts, culinary practices, local traditions, and everyday community life. Dividing and sharing portions of a familiar local dish contextualizes the part-whole relationship concretely.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Ethnomathematics integration.',
    difficulty: 'Easy',
    tags: ['Mathematics Pedagogy', 'Ethnomathematics', 'Fractions', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q57',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Educational Technology & Formative Evaluation',
    questionNumber: 57,
    question: 'A teacher observes that using interactive smart boards during algebra lessons improves student engagement but not their test scores. What is the best evaluative step?',
    options: [
      'Conclude smart boards are ineffective',
      'Use only textbook-based instruction',
      'Analyze lesson delivery and integrate formative assessments to maximize technology benefits',
      'Increase the number of slides shown per lesson'
    ],
    correctIndex: 2,
    explanation: 'Technology enhances engagement, but deep learning requires reflective pedagogy and timely feedback. The teacher should analyze pedagogical alignment and weave in embedded formative checks (quick quizzes, think-pair-share) to scaffold conceptual mastery.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - EdTech pedagogical integration.',
    difficulty: 'Medium',
    tags: ['Mathematics Pedagogy', 'Smart Boards', 'Formative Assessment', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q58',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Transfer of Learning in Mathematics',
    questionNumber: 58,
    question: 'A teacher notices that despite scoring well in routine textbook tests, some students are unable to apply mathematical concepts in real-life problem-solving tasks. What should be the teacher\'s immediate assessment objective in this case?',
    options: [
      'To verify the authenticity of test score',
      'To reassess the students using more difficult problems',
      'To assess the student\'s ability to transfer knowledge to new situations',
      'To give more textbook based problems'
    ],
    correctIndex: 2,
    explanation: 'The core educational challenge here is "near transfer vs far transfer". The teacher must evaluate students\' ability to map mathematical relationships outside standard textbook prompts into novel, unscripted real-world situations.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Knowledge transfer assessment.',
    difficulty: 'Medium',
    tags: ['Mathematics Pedagogy', 'Transfer of Learning', 'Authentic Assessment', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q59',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Comprehensive Assessment Systems in STEM',
    questionNumber: 59,
    question: 'A school is revising its mathematics assessment system. Which of the following would best ensure assessments support meaningful learning?',
    options: [
      'Focus on speed and accuracy',
      'Emphasize objective-type questions only',
      'Integrate a variety of tools like portfolios, projects, and oral questioning',
      'Give more scope for unit tests'
    ],
    correctIndex: 2,
    explanation: 'NEP 2020 and NCF 2005 recommend multidimensional holistic assessment that combines performance tasks, portfolios, investigative projects, and oral dialogue, moving away from rote timed speed tests.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Holistic assessment tools.',
    difficulty: 'Easy',
    tags: ['Mathematics Pedagogy', 'CCE', 'Portfolios', 'NEP 2020', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q60',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Continuous Assessment: Capacity Building',
    questionNumber: 60,
    question: 'A school wants to improve continuous assessment practices in mathematics. Which step should be implemented first?',
    options: [
      'Increase frequency of final exams',
      'Train teachers to design rubrics and formative tools',
      'Use only objective-type questions',
      'Reduce classroom discussions'
    ],
    correctIndex: 1,
    explanation: 'Teacher professional development in rubric design and formative diagnostic strategies is the foundational prerequisite for implementing authentic continuous and comprehensive evaluation in mathematics.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Assessment literacy.',
    difficulty: 'Easy',
    tags: ['Mathematics Pedagogy', 'Teacher Training', 'Rubrics', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },

  // --- SCIENCE (Questions 61 to 81) ---
  {
    id: 'gt-ms-2022-q61',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Law of Constant Proportions: Electrolysis of Water',
    questionNumber: 61,
    question: 'A student takes two samples of pure water: one from a river and one from a tap. Upon electrolysis, both yield hydrogen and oxygen in the same mass ratio. The mass ratio of hydrogen to oxygen is:',
    options: [
      '1:8',
      '2:1',
      '1:16',
      '4:16'
    ],
    correctIndex: 0,
    explanation: 'In water (H₂O), 2 atoms of hydrogen (mass = 2 × 1 = 2 u) combine with 1 atom of oxygen (mass = 16 u). The mass ratio is 2:16 = 1:8. Under Proust\'s Law of Constant Proportions, this mass ratio remains strictly 1:8 regardless of source.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Stoichiometry and chemical combination laws.',
    difficulty: 'Easy',
    tags: ['Science', 'Chemistry', 'Law of Constant Proportions', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q62',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Atomic Structure: Subatomic Particles',
    questionNumber: 62,
    question: 'If an element X has atomic number 19 and mass number 39, what is the correct combination of subatomic particles in its neutral atom?',
    options: [
      '19 protons, 19 neutrons, 19 electrons',
      '20 protons, 19 electrons, 19 neutrons',
      '19 protons, 20 neutrons, 19 electrons',
      '39 protons, 19 electrons, 20 neutrons'
    ],
    correctIndex: 2,
    explanation: 'Atomic number (Z) = 19, which equals the number of protons and electrons (in a neutral atom). Mass number (A) = 39. Number of neutrons = A - Z = 39 - 19 = 20. Thus: 19 protons, 20 neutrons, 19 electrons (Potassium, K).',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Subatomic particle calculations.',
    difficulty: 'Easy',
    tags: ['Science', 'Chemistry', 'Atomic Structure', 'Neutrons', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q63',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Classification of Chemical Reactions',
    questionNumber: 63,
    question: 'Match Column A (Type of Reaction) with Column B (Example Reaction):\nColumn A:\nA. Combination Reaction\nB. Decomposition Reaction\nC. Displacement Reaction\nD. Double Displacement Reaction\n\nColumn B:\n1. Zn + 2HCl → ZnCl₂ + H₂\n2. 2H₂ + O₂ → 2H₂O\n3. 2HgO → 2Hg + O₂\n4. AgNO₃ + NaCl → AgCl + NaNO₃',
    options: [
      'A-4, B-1, C-2, D-3',
      'A-1, B-4, C-3, D-2',
      'A-3, B-2, C-4, D-1',
      'A-2, B-3, C-1, D-4'
    ],
    correctIndex: 3,
    explanation: '1. Combination: 2H₂ + O₂ → 2H₂O (two substances combine into one, A-2).\n2. Decomposition: 2HgO → 2Hg + O₂ (one substance breaks down, B-3).\n3. Displacement: Zn + 2HCl → ZnCl₂ + H₂ (zinc displaces hydrogen, C-1).\n4. Double Displacement: AgNO₃ + NaCl → AgCl + NaNO₃ (mutual exchange of ions, D-4).',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Chemical equations classification.',
    difficulty: 'Medium',
    tags: ['Science', 'Chemistry', 'Chemical Reactions', 'Redox', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q64',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Carbon Compounds: Acetic Acid and Ethanol in Daily Life',
    questionNumber: 64,
    question: 'Vinegar is used in preparing pickles which is labelled as 4% acetic acid. Ethanol is used in hand sanitizers. Based on this observation, what can be inferred about the importance of ethanol and ethanoic acid?',
    options: [
      'Both compounds are used only in laboratory experiments and not in daily life.',
      'Both are toxic chemicals and should not be used in household products.',
      'Ethanoic acid is used only in industrial processes, while ethanol is only for drinking purposes.',
      'Ethanol has disinfectant properties and ethanoic acid is useful as a preservative.'
    ],
    correctIndex: 3,
    explanation: 'Ethanoic acid (5-8% solution in water, vinegar) lowers pH preventing microbial proliferation, making it an excellent preservative for pickles. Ethanol dissolves lipid membranes of microbes, acting as a potent antiseptic/disinfectant in sanitizers.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Everyday chemistry applications.',
    difficulty: 'Easy',
    tags: ['Science', 'Chemistry', 'Carbon Compounds', 'Ethanol', 'Acetic Acid', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q65',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Atomic Models: Rutherford Solar Analogy',
    questionNumber: 65,
    question: 'Sudharsan says in the classroom "Rutherford\'s nuclear model of an atom resembles the solar system." How valid is this analogy?',
    options: [
      'Valid, because electrons revolve around the nucleus like planets around the sun',
      'Valid, because electrons do not move in orbits',
      'Valid, because both the sun and nucleus are negatively charged',
      'Valid, because atoms do not have orbits'
    ],
    correctIndex: 0,
    explanation: 'In Rutherford\'s planetary model, negatively charged electrons revolve around the tiny, dense, positively charged nucleus in defined orbits, analogous to planets revolving around the central sun under central forces.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Historical atomic models.',
    difficulty: 'Easy',
    tags: ['Science', 'Physics', 'Atomic Models', 'Rutherford', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q66',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Mole Concept: Calculations in Water',
    questionNumber: 66,
    question: 'Ramesh filled a beaker with 450ml of water. The density of water was found to be 1 g ml⁻¹. How many moles of water are present in it?',
    options: [
      '18',
      '25',
      '6.622 × 10²³',
      '450'
    ],
    correctIndex: 1,
    explanation: 'Mass of water = Volume × Density = 450 ml × 1 g/ml = 450 g. Molar mass of water (H₂O) = (2 × 1) + 16 = 18 g/mol. Number of moles = Mass / Molar mass = 450 / 18 = 25 moles.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Mole concept calculations.',
    difficulty: 'Medium',
    tags: ['Science', 'Chemistry', 'Mole Concept', 'Density', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q67',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Laws of Motion: Unbalanced Forces',
    questionNumber: 67,
    question: 'What happens when two unequal forces act on an object in opposite directions along the same line?',
    options: [
      'The object moves in the direction of stronger force',
      'The object always stops moving immediately',
      'The object loses its shape permanently',
      'The object starts spinning'
    ],
    correctIndex: 0,
    explanation: 'When two unequal forces act in opposite directions, the net force is non-zero and points in the direction of the larger force (F_net = F_large - F_small). The object accelerates in the direction of the stronger force according to Newton\'s second law.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Newton\'s laws of motion.',
    difficulty: 'Easy',
    tags: ['Science', 'Physics', 'Force and Motion', 'Net Force', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q68',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Current Electricity: Parallel Resistance Circuit',
    questionNumber: 68,
    question: 'A student has built a circuit with a 12V battery connected to two light bulbs of resistances 3 ohms and 6 ohms respectively, in parallel. What is the total current flowing through the circuit?',
    options: [
      '2A',
      '4A',
      '6A',
      '8A'
    ],
    correctIndex: 2,
    explanation: 'Equivalent parallel resistance: 1/R_p = 1/3 + 1/6 = 3/6 = 1/2 ⟹ R_p = 2 Ω. Total circuit current I = V / R_p = 12V / 2Ω = 6A. Alternatively, current through 3Ω is 12/3 = 4A, and through 6Ω is 12/6 = 2A; Total I = 4A + 2A = 6A.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Ohm\'s law and parallel resistor networks.',
    difficulty: 'Medium',
    tags: ['Science', 'Physics', 'Electricity', 'Ohm\'s Law', 'Resistors', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q69',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Frictional Forces in Everyday Life',
    questionNumber: 69,
    question: 'A cyclist is riding on a muddy path. The cyclist installs thicker tires with deep treads to improve grip. How does this modification affect the force of friction and the cyclist\'s motion?',
    options: [
      'It increases friction reducing slippage but requires more effort to maintain speed',
      'It increases friction making it easier to pedal but harder to stop',
      'It decreases the friction allowing the bicycle to move faster with lesser effort',
      'It decreases friction thereby improving comfort but reducing control'
    ],
    correctIndex: 0,
    explanation: 'Treads increase mechanical interlocking between the tire surface and muddy terrain, increasing traction/friction and preventing hazardous skidding. However, greater rolling resistance means the rider must expend more muscular work.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Applied friction principles.',
    difficulty: 'Medium',
    tags: ['Science', 'Physics', 'Friction', 'Traction', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q70',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Wave Motion: Doppler Effect',
    questionNumber: 70,
    question: 'An ambulance siren\'s pitch appears higher as it approaches a stationary observer because:',
    options: [
      'Sound waves are stretched, increasing frequency',
      'The sound waves are compressed, increasing frequency',
      'Sound waves are compressed, decreasing frequency',
      'The sound waves are stretched, decreasing frequency'
    ],
    correctIndex: 1,
    explanation: 'Under the Doppler effect, as the source moves towards the stationary observer, the wavefronts are crowded (compressed) into a smaller space in front of the vehicle. This decreases apparent wavelength, leading to higher observed frequency (pitch).',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Doppler effect in sound.',
    difficulty: 'Easy',
    tags: ['Science', 'Physics', 'Sound Waves', 'Doppler Effect', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q71',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Universal Law of Gravitation',
    questionNumber: 71,
    question: 'If the distance between two objects doubles, what happens to the gravitational force between them?',
    options: [
      'Force becomes half as strong',
      'Force becomes two times stronger',
      'Force becomes one-fourth as strong',
      'Force becomes four times stronger'
    ],
    correctIndex: 2,
    explanation: 'Newton\'s Universal Law of Gravitation states F = G(m₁m₂)/r². Gravitational force follows the inverse-square law: F ∝ 1/r². When distance r is doubled to 2r, F\' = F / (2)² = F / 4 (one-fourth as strong).',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Inverse square law.',
    difficulty: 'Easy',
    tags: ['Science', 'Physics', 'Gravitation', 'Inverse Square Law', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q72',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Electromagnetism: Right-Hand Thumb Rule',
    questionNumber: 72,
    question: 'The direction of the magnetic field produced by a straight current-carrying conductor can be determined using:',
    options: [
      'Fleming\'s left-hand rule',
      'Faraday\'s law',
      'Right-hand thumb rule',
      'Ohm\'s law'
    ],
    correctIndex: 2,
    explanation: 'Maxwell\'s Right-Hand Thumb Rule states that if you grasp a straight current-carrying conductor with your right hand such that the thumb points in the direction of the electric current, your curled fingers show the direction of concentric magnetic field lines.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Magnetic effects of electric current.',
    difficulty: 'Easy',
    tags: ['Science', 'Physics', 'Electromagnetism', 'Right Hand Rule', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q73',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Optics: Applications of Spherical Mirrors',
    questionNumber: 73,
    question: 'Concave mirrors are used in:\ni) Shaving mirrors\nii) Headlights of cars\niii) Astronomical reflecting telescopes\niv) Rear view mirrors in automobiles\nWhich of the given statements are correct?',
    options: [
      'Options i, ii & iii are correct',
      'Options ii, iii & iv are correct',
      'Options iii, iv & i are correct',
      'Options iv, i & ii are correct'
    ],
    correctIndex: 0,
    explanation: 'Concave mirrors produce enlarged virtual images when close (shaving mirrors), parallel reflected beams when source is at focus (car headlights), and gather light in reflecting telescopes. Rear-view mirrors in cars use CONVEX mirrors to provide a wide, erect field of view.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Spherical mirror applications.',
    difficulty: 'Medium',
    tags: ['Science', 'Physics', 'Optics', 'Concave Mirrors', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q74',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Human Nervous System: Neuron Signal Pathway',
    questionNumber: 74,
    question: 'What is the correct sequence of events when a neuron responds to an incoming stimulus?',
    options: [
      'Dendrites receive, axon transmits, cell body integrates, axon terminals release neurotransmitters.',
      'Cell body receives, dendrites transmit, axon integrates, axon terminals release neurotransmitters.',
      'Dendrites receive, cell body integrates, axon transmits, and axon terminals release neurotransmitters.',
      'Axon receives, cell body integrates, dendrite transmits, axon terminals release neurotransmitters.'
    ],
    correctIndex: 2,
    explanation: 'A nervous impulse travels unidirectionally: Dendrites receive incoming electrochemical signals from adjacent synapses ⟹ Cell body (cyton/soma) sums and integrates impulses ⟹ Axon propagates action potential ⟹ Axon terminals release neurotransmitters across synapse.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Neurobiology impulse transmission.',
    difficulty: 'Medium',
    tags: ['Science', 'Biology', 'Nervous System', 'Neuron', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q75',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Static Electricity: Lightning Conductors',
    questionNumber: 75,
    question: 'What is a lightning conductor primarily used for on tall structures and buildings?',
    options: [
      'To attract lightning and safely conduct it to protect the building',
      'To create lightning during thunderstorms',
      'To store electric energy from lightning',
      'To avoid creation of lightning'
    ],
    correctIndex: 0,
    explanation: 'Invented by Benjamin Franklin, a lightning rod provides a low-resistance metallic conducting path of heavy copper into deep grounding plates in the earth, intercepting lightning strikes and safely dissipating electric charge into the ground without structural fire or damage.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Electrostatics and lightning safety.',
    difficulty: 'Easy',
    tags: ['Science', 'Physics', 'Lightning Conductor', 'Electrostatics', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q76',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Plant Reproduction: Cross-Pollination',
    questionNumber: 76,
    question: 'Which of the following is NOT a characteristic of cross-pollination?',
    options: [
      'Requires external agents like insects, wind, or water',
      'Increases genetic variation in offspring',
      'Happens within the same flower',
      'Promotes healthier, more adaptable offspring'
    ],
    correctIndex: 2,
    explanation: 'Pollination occurring within the same flower is self-pollination (autogamy). Cross-pollination (allogamy/xenogamy) involves transfer of pollen grains from an anther of one flower to the stigma of another flower on a different plant of the same species.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Botanical reproduction mechanisms.',
    difficulty: 'Easy',
    tags: ['Science', 'Biology', 'Pollination', 'Cross-pollination', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q77',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Genetics: Sex Determination in Humans',
    questionNumber: 77,
    question: 'If a sperm carrying the X chromosome fertilizes an egg, what will be the sex of the child?',
    options: [
      'Male',
      'Female',
      'Both',
      'Cannot be determined'
    ],
    correctIndex: 1,
    explanation: 'Human ovum always carries an X chromosome (22 + X). If the fertilizing sperm provides an X chromosome (22 + X), the zygote is 44 + XX, developing into a biological female. (If sperm carries Y, zygote is 44 + XY, developing into male).',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Chromosomal sex determination.',
    difficulty: 'Easy',
    tags: ['Science', 'Biology', 'Genetics', 'Chromosomes', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q78',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Human Health & Diseases: Vector-Borne Pathogens',
    questionNumber: 78,
    question: 'Which of the following diseases is caused by a virus and spread by mosquitoes?',
    options: [
      'Tuberculosis',
      'Malaria',
      'Dengue',
      'Typhoid'
    ],
    correctIndex: 2,
    explanation: 'Dengue is caused by the Dengue virus (flavivirus) and transmitted by female Aedes aegypti mosquitoes. In contrast: Malaria is caused by a protozoan (Plasmodium), Typhoid by a bacterium (Salmonella typhi), and Tuberculosis by a bacterium (Mycobacterium tuberculosis).',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Pathogens and disease vectors.',
    difficulty: 'Easy',
    tags: ['Science', 'Biology', 'Microbiology', 'Dengue', 'Vector Diseases', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q79',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Bioenergetics: Photosynthesis and Cellular Respiration',
    questionNumber: 79,
    question: 'Which of the following statements best describes the physiological relationship between photosynthesis and respiration in living organisms?',
    options: [
      'They are unrelated processes.',
      'Photosynthesis breaks down glucose; respiration builds it.',
      'Photosynthesis stores solar energy in chemical bonds; respiration releases it for cellular work.',
      'Both convert solar energy directly into ATP.'
    ],
    correctIndex: 2,
    explanation: 'Photosynthesis is an anabolic, endergonic process that uses solar energy to synthesize glucose from CO₂ and H₂O. Cellular respiration is a catabolic, exergonic process that oxidizes organic compounds to release ATP for metabolic functions.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Bioenergetics and metabolic pathways.',
    difficulty: 'Easy',
    tags: ['Science', 'Biology', 'Photosynthesis', 'Respiration', 'Bioenergetics', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q80',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Endocrine System vs Nutritional Deficiency',
    questionNumber: 80,
    question: 'Which of the following diseases is NOT caused by a hormonal deficiency?',
    options: [
      'Goitre',
      'Cretinism',
      'Addison\'s disease',
      'Scurvy'
    ],
    correctIndex: 3,
    explanation: 'Scurvy is caused by nutritional deficiency of Vitamin C (ascorbic acid). In contrast: Goitre and Cretinism result from thyroxine hormone deficiency, and Addison\'s disease results from insufficiency of adrenal cortex hormones (cortisol and aldosterone).',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Endocrine hormones vs vitamin disorders.',
    difficulty: 'Medium',
    tags: ['Science', 'Biology', 'Endocrine System', 'Nutritional Deficiency', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  },
  {
    id: 'gt-ms-2022-q81',
    year: '2022',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Science Pedagogy: Constructivist Inquiry for Chemical Reactions',
    questionNumber: 81,
    question: 'Which of the following is the most pedagogically suitable strategy for introducing students to the concept of \'chemical reaction\' at the upper primary level?',
    options: [
      'Explain the concept of valence electrons and electronic configuration',
      'Write the chemical equations in symbolic form and ask students to observe',
      'Define a chemical reaction and give textbook examples to copy',
      'Hold a discussion on everyday chemical transformations which students have observed in their daily lives (rusting, curdling, cooking)'
    ],
    correctIndex: 3,
    explanation: 'In accordance with constructivist science pedagogy (NCF 2005), introductory conceptualization at grades 6-8 should begin with phenomenological observations familiar to students (milk turning to curd, rust forming on iron, effervescence with lemon on baking soda) before transitioning to abstract submicroscopic models and symbolic formulas.',
    examPatternAnalysis: 'Sikkim STET GT Maths/Science 2022 - Upper primary chemistry pedagogy.',
    difficulty: 'Easy',
    tags: ['Science Pedagogy', 'Chemical Reaction', 'NCF 2005', 'Constructivism', 'STET GT 2022'],
    previousPaperSet: 'STET GT Maths & Science 2022 Paper'
  }
];
