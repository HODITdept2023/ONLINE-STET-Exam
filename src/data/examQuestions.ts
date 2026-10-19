import { Question, StudyGuideItem } from '../types';
import { 
  QUESTION_BANK_1000, 
  OFFICIAL_PREVIOUS_PAPERS, 
  getLogicModeLabel,
  getQuestionsForExamTrack,
  getExamTrackQuestionCount
} from './questionPool1000';
import {
  STET_FRAMING_GUIDELINES,
  STET_COMPETENCY_DOMAINS,
  STET_OFFICIAL_ITEM_BANK_QUESTIONS,
  auditQuestionAgainstGuidelines
} from './stetItemBankData';

export { 
  QUESTION_BANK_1000, 
  OFFICIAL_PREVIOUS_PAPERS, 
  getLogicModeLabel,
  getQuestionsForExamTrack,
  getExamTrackQuestionCount,
  STET_FRAMING_GUIDELINES,
  STET_COMPETENCY_DOMAINS,
  STET_OFFICIAL_ITEM_BANK_QUESTIONS,
  auditQuestionAgainstGuidelines
};

// Core historical bank mapped to the full 1,000 questions bank
export const HISTORICAL_EXAM_QUESTIONS: Question[] = QUESTION_BANK_1000;

export const STUDY_GUIDES: StudyGuideItem[] = [
  {
    id: 'guide-cdp-theorists',
    title: 'Mastering CDP: Piaget, Kohlberg, Vygotsky & Bandura',
    category: 'CDP',
    readMinutes: 12,
    examTracks: ['prt', 'gt-maths-science', 'gt-humanities'],
    summary: 'The comprehensive blueprint for Child Development and Pedagogy: stage-by-stage cognitive breakdown, moral reasoning stages, and social constructivism essentials.',
    keyFormulasAndRules: [
      'IQ Formula: IQ = (Mental Age / Chronological Age) * 100 (William Stern / Lewis Terman)',
      'Piaget Stages: Sensorimotor (0-2y), Pre-operational (2-7y), Concrete (7-11y), Formal (12y+)',
      'Kohlberg Moral Levels: Pre-conventional (Stages 1-2), Conventional (Stages 3-4), Post-conventional (Stages 5-6)',
      'Bandura 4 Steps: Attention -> Retention -> Reproduction -> Reinforcement (ARRR)',
      'NEP 2020 Structure: 5 + 3 + 3 + 4 (Foundational, Preparatory, Middle, Secondary)'
    ],
    highYieldPoints: [
      'Piaget vs. Vygotsky: Piaget believes development precedes learning; Vygotsky states learning precedes development through the Zone of Proximal Development (ZPD) and MKO (More Knowledgeable Other).',
      'Kohlberg Stage IV (Maintaining Social Order): The person respects rules and duties to protect societal stability.',
      'Howard Gardner: Intrapersonal (self-knowledge) vs. Interpersonal (understanding peers). Bodily-kinesthetic = physical control.',
      'UDL (Universal Design for Learning): Multiple means of Representation, Action/Expression, and Engagement.',
      'Growth is strictly quantitative (height, weight, cells); Development is comprehensive and qualitative.'
    ],
    sampleMnemonics: [
      'Piaget Stages Mnemonic: "Some People Can Fly" -> Sensorimotor, Pre-operational, Concrete, Formal.',
      'Bandura Modeling Mnemonic: "A-R-R-M" -> Attention, Retention, Reproduction, Motivation.'
    ]
  },
  {
    id: 'guide-social-science-polity',
    title: 'Indian Polity, Writs & Constitution Mastery',
    category: 'SocialScience',
    readMinutes: 14,
    examTracks: ['gt-humanities'],
    summary: 'Essential constitutional articles, supreme court writs, local self-government (Panchayati Raj), and historical milestones.',
    keyFormulasAndRules: [
      'Article 32 & 226: Power to issue 5 Writs (Habeas Corpus, Mandamus, Prohibition, Certiorari, Quo Warranto)',
      'Article 15: Prohibition of discrimination on grounds of religion, race, caste, sex or place of birth',
      'Longitude & Time: 15° = 1 hour difference; 1° = 4 minutes. East of GMT is ahead (+), West of GMT is behind (-)',
      'Earth Atmospheric Layers: Troposphere -> Stratosphere -> Mesosphere -> Thermosphere -> Exosphere',
      'Earth Core Order (Interior to Surface): Inner Core -> Outer Core -> Mantle -> Crust'
    ],
    highYieldPoints: [
      'Habeas Corpus means "You shall have the body" – safeguards personal liberty against illegal state detention.',
      'Mandamus means "We command" – judicial order commanding a public official or tribunal to perform their statutory duty.',
      'Mughal succession was based on coparcenary (division among all sons) rather than primogeniture (eldest inherits all).',
      'Gram Sabha consists of all adult registered village voters who directly elect the Gram Panchayat members and Sarpanch.',
      'Atmosphere by volume: Nitrogen (~78%), Oxygen (~21%), Argon (~0.93%), Carbon dioxide (~0.04%).'
    ],
    sampleMnemonics: [
      'Writs Mnemonic: "Have More Power Calling Queen" -> Habeas Corpus, Mandamus, Prohibition, Certiorari, Quo Warranto.',
      'Earth Layers: "I-O-M-C" -> Inner core, Outer core, Mantle, Crust.'
    ]
  },
  {
    id: 'guide-gthum-history-sikkim',
    title: 'STET GT: Sikkim History, Chogyals & Indian National Movement',
    category: 'SocialScience',
    readMinutes: 15,
    examTracks: ['gt-humanities'],
    summary: 'Sikkim history (Yuksom consecration 1642, Namgyal dynasty), ancient Indian civilization (Harappan Lothal dockyard, Ashokan Dhamma), and national freedom struggle.',
    keyFormulasAndRules: [
      'First Chogyal: Phuntsog Namgyal consecrated at Yuksom in 1642 by three revered lamas (Lhatsun Chempo, Kartok Rikzin Chempo, Sempa Chempo).',
      'Treaty of Titalia (1817) and Tumlong (1861) defining historical British-Sikkim relations.',
      'Lothal (Gujarat): Ancient Indus Valley civilization dockyard for maritime commerce.',
      'Champaran Satyagraha (1917): Gandhi\'s first satyagraha in India against Tinkathia indigo cultivation.'
    ],
    highYieldPoints: [
      'Rabdentse was the second historic capital of Sikkim established by Tensung Namgyal in 1670.',
      'Mauryan Dhamma emphasized moral codes, truthfulness, ahimsa, and religious tolerance rather than institutional dogmas.',
      'Battle of Plassey (1757) and Buxar (1764) established formal East India Company fiscal mastery over Bengal.'
    ],
    sampleMnemonics: [
      'Sikkim Holy Consecration 1642: "P-Y-3L" -> Phuntsog Namgyal at Yuksom by 3 Lamas.'
    ]
  },
  {
    id: 'guide-english-pedagogy',
    title: 'English Language, Cummins Theories & Literary Devices',
    category: 'English',
    readMinutes: 10,
    examTracks: ['prt', 'gt-maths-science', 'gt-humanities'],
    summary: 'High-frequency grammar rules, language acquisition theories, BICS vs CALP, and poetry analysis tools.',
    keyFormulasAndRules: [
      'BICS: Basic Interpersonal Communicative Skills (surface everyday talk, 1-2 years to develop)',
      'CALP: Cognitive Academic Language Proficiency (context-reduced, formal academic literacy, 5-7 years to develop)',
      'Cummins Interdependence Hypothesis: Skills learned in L1 transfer naturally to L2 through Common Underlying Proficiency (CUP)',
      'Krashen\'s Input Hypothesis: i + 1 (Comprehensible Input slightly ahead of current level)'
    ],
    highYieldPoints: [
      'Translanguaging is an asset-based pedagogy encouraging learners to draw flexibly from their entire linguistic repertoire.',
      'Metaphor: direct implicit comparison without using "like" or "as".',
      'Simile: explicit comparison utilizing "like" or "as" (e.g., "They grow on me like leaves").',
      'Apostrophe: addressing an absent person, deity ("my lord"), or personified abstraction as if present and listening.',
      'Formative Assessment is assessment FOR learning (diagnostic, ongoing feedback); Summative is assessment OF learning.'
    ],
    sampleMnemonics: [
      'Cummins Iceberg: Two visible peaks (L1 and L2) connected by a single submerged mountain (Common Underlying Proficiency).'
    ]
  },
  {
    id: 'guide-evs-sikkim',
    title: 'STET PRT: EVS & Sikkim Biodiversity, Heritage & Ecology',
    category: 'EVS',
    readMinutes: 12,
    examTracks: ['prt'],
    summary: 'Complete guide for Sikkim Environmental Studies: sacred monasteries, pastoral Dokpas, permits (RAP/PAP), sanctuaries, and natural hazards.',
    keyFormulasAndRules: [
      'Dubdi Monastery: Oldest monastery in Sikkim (1701, Yuksom, West Sikkim), known as "Hermit\'s Cell".',
      'Dokpas: Semi-nomadic pastoralists of North Sikkim plateau practicing high-altitude seasonal transhumance.',
      'Permits: Foreigners require RAP + PAP; Domestic tourists require PAP for restricted border regions.',
      'UDID Cards: White (<40%), Yellow (40% - 79% benchmark disability), Blue (80%+ severe disability).',
      'Photosynthesis CO₂ sink: Deforestation raises atmospheric CO₂ and accelerates climate change.'
    ],
    highYieldPoints: [
      'Mt. Khangchendzonga is the Guardian Deity of Sikkim; expeditions from Sikkim side are permanently banned.',
      'Pangolakha Wildlife Sanctuary in East Sikkim connects with Neora Valley National Park (West Bengal) and Bhutan.',
      'Tribal Nature Festivals: Sarhul (Jharkhand tribes worship Sal tree), Losoong/Namsoong (Sikkim harvest).',
      'Honey Adulteration Test: Pure honey sinks without dissolving in water; adulterated honey dissolves readily.'
    ],
    sampleMnemonics: [
      'UDID Colors: "W-Y-B" -> White (mild <40%), Yellow (benchmark 40-79%), Blue (severe 80%+).'
    ]
  },
  {
    id: 'guide-maths-primary',
    title: 'STET PRT: Primary Mathematics & Geometry Pedagogy',
    category: 'Maths',
    readMinutes: 11,
    examTracks: ['prt'],
    summary: 'Core mathematics formulas, number patterns, perimeter invariance, fractions, and manipulative TLMs.',
    keyFormulasAndRules: [
      'Euler\'s Polyhedron Formula: F + V = E + 2 (Faces + Vertices = Edges + 2). Cuboid: 6 + 8 = 12 + 2 = 14.',
      'Perimeter of Circle = 2πr; Area = πr² (π ≈ 22/7).',
      'Division Algorithm: Dividend = (Divisor × Quotient) + Remainder.',
      'Exponents Product Law: aᵐ × aⁿ = aᵐ⁺ⁿ.'
    ],
    highYieldPoints: [
      'Cutting corner squares from a rectangle leaves the outer perimeter invariant (unchanged), because the two removed segments are replaced by two inner segments.',
      'Number Sequences: Check for squares of primes (4, 9, 25, 49, 121) or n³ - 1 (0, 7, 26, 63, 124).',
      'Geoboard is the premier concrete TLM for demonstrating area, perimeter, and polygon properties in primary grades.'
    ],
    sampleMnemonics: [
      'Euler\'s Formula Mnemonic: "Five Very Enthusiastic 2s" -> F + V = E + 2.'
    ]
  },
  {
    id: 'guide-maths-sci-pedagogy',
    title: 'STET GT: Mathematics & Science Pedagogy',
    category: 'MathsScience',
    readMinutes: 13,
    examTracks: ['gt-maths-science'],
    summary: '5E Instructional Model, GeoGebra dynamic tools, Polya\'s heuristic stages, and conceptual conflict in STEM.',
    keyFormulasAndRules: [
      '5E Model Sequence: Engage -> Explore -> Explain -> Elaborate -> Evaluate.',
      'Polya\'s 4 Steps: 1. Understand Problem -> 2. Devise Plan -> 3. Carry Out -> 4. Look Back (Reflect).',
      'Scientific Temper: Constitution Article 51A(h) - inquiry, reform, humanism, and empirical skepticism.'
    ],
    highYieldPoints: [
      'Terminology is formally introduced only during the "Explain" phase, after students explore concrete phenomenon.',
      'GeoGebra enables dynamic slider experimentation for algebraic functions and geometric loci.',
      'Alternative frameworks (misconceptions) should be addressed via cognitive conflict rather than dismissive lecturing.'
    ],
    sampleMnemonics: [
      '5E Order: "Every Explorer Explains Elaborate Evidence" -> Engage, Explore, Explain, Elaborate, Evaluate.'
    ]
  },
  {
    id: 'guide-gtms-stem-formulas',
    title: 'STET GT: Advanced Mathematics & Physical Science Cheat Sheet',
    category: 'MathsScience',
    readMinutes: 16,
    examTracks: ['gt-maths-science'],
    summary: 'Critical equations: Perpendicular slopes (m₁m₂ = -1), thin lens formula (1/f = 1/v - 1/u), work-energy theorem, and AP/GP series formulas.',
    keyFormulasAndRules: [
      'Slope of Perpendicular Lines: m₁ × m₂ = -1. If line 1 is 3/4, line 2 is -4/3.',
      'Thin Lens Formula: 1/f = 1/v - 1/u (f positive for convex lens, negative for concave).',
      'Work Done: W = F · d · cos(θ). 1 Joule = 1 N·m.',
      'Arithmetic Progression: aₙ = a + (n-1)d; Sₙ = n/2 [2a + (n-1)d].',
      'Quadratic Discriminant: D = b² - 4ac. Real & distinct if D > 0; Real & equal if D = 0; Complex if D < 0.'
    ],
    highYieldPoints: [
      'Curved Surface Area of Cylinder = 2πrh; Total Surface Area = 2πr(r + h).',
      'Planaria undergoes true regeneration via pluripotent neoblast stem cells.',
      'Mendeleev arranged elements by atomic mass; Moseley (Modern periodic law) arranged by atomic number (Z).'
    ],
    sampleMnemonics: [
      'Perpendicular Slope: "Flip the fraction, flip the sign". Lens formula: "Minus for Lens, Plus for Mirror".'
    ]
  }
];

export const INITIAL_LEADERBOARD: { rank: number; name: string; score: number; accuracy: number; mockTestsCount: number; streak: number; badge: string }[] = [
  { rank: 1, name: 'Tenzing Norbu', score: 2840, accuracy: 94.2, mockTestsCount: 14, streak: 21, badge: 'STET Gold Scholar' },
  { rank: 2, name: 'Ananya Sharma', score: 2710, accuracy: 91.8, mockTestsCount: 12, streak: 18, badge: 'Pedagogy Ace' },
  { rank: 3, name: 'Karma Bhutia', score: 2590, accuracy: 89.5, mockTestsCount: 11, streak: 15, badge: 'Social Science Master' },
  { rank: 4, name: 'Rohit Kulkarni', score: 2420, accuracy: 87.0, mockTestsCount: 10, streak: 12, badge: 'Language Guru' },
  { rank: 5, name: 'You (Learner)', score: 2150, accuracy: 86.4, mockTestsCount: 8, streak: 7, badge: 'Rising Star' },
  { rank: 6, name: 'Sunita Chettri', score: 1980, accuracy: 84.1, mockTestsCount: 7, streak: 9, badge: 'Diligent Aspirant' },
  { rank: 7, name: 'Dawa Lepcha', score: 1850, accuracy: 82.3, mockTestsCount: 6, streak: 5, badge: 'Focus Champion' },
  { rank: 8, name: 'Pooja Verma', score: 1720, accuracy: 80.9, mockTestsCount: 5, streak: 4, badge: 'Curious Explorer' }
];
