import { Question, StetFramingGuideline, StetCompetencyDomain } from '../types';

/**
 * SCERT Sikkim & Azim Premji University
 * Sikkim Teacher Eligibility Test (STET) Official Item Bank & Question Framing Guidelines
 * Reference Repository and Psychometric Standards Blueprint
 */

export const STET_FRAMING_GUIDELINES: StetFramingGuideline[] = [
  {
    id: 'guideline-1',
    ruleNumber: 1,
    title: 'Single Assessment Objective & Syllabus Alignment',
    category: 'Stem Design',
    shortSummary: 'Every item must measure a distinct, well-defined learning outcome or pedagogical competency.',
    corePrinciple: 'Avoid compounding multiple disparate competencies into one item stem. The question must be anchored in the STET curriculum blueprint and test candidate ability to apply pedagogical knowledge in real educational contexts rather than trivia.',
    dos: [
      'Pinpoint a single competency from the curriculum (e.g., diagnosing fraction misconceptions, applying Vygotskian scaffolding).',
      'Ensure the stem alone poses a clear problem that the candidate can anticipate answering before reading the options.',
      'Align cognitive demand with the intended level of teacher certification (PRT Paper I vs. GT Paper II).'
    ],
    donts: [
      'Do not write vague stems that lack a focused problem (e.g., "Which of the following is true about education?").',
      'Do not test obscure historical dates or idiosyncratic trivia that has zero correlation with teacher effectiveness.'
    ],
    classroomExample: {
      flawedItem: 'Education in Sikkim is:\n(A) Progressive\n(B) Regulated by SCERT\n(C) Based on 5+3+3+4\n(D) All of the above',
      flawExplanation: 'The stem does not state a clear pedagogical problem. It conflates policy, regulatory body, and descriptive adjectives, and relies on "All of the above".',
      improvedItem: 'A primary teacher in Soreng observes that Grade 3 learners struggle to transfer addition skills to money transactions at the local weekly haat. According to constructivist pedagogy, which learning experience should the teacher design first?',
      improvedExplanation: 'The improved item presents an authentic contextual pedagogical dilemma measuring competency in contextualized experiential learning.'
    }
  },
  {
    id: 'guideline-2',
    ruleNumber: 2,
    title: 'Authentic Classroom Scenarios & Pedagogical Stems',
    category: 'Stem Design',
    shortSummary: 'Frame questions using realistic teacher dilemmas, student work samples, dialogues, or observations.',
    corePrinciple: 'Teacher eligibility testing must evaluate applied classroom reasoning. Construct stems around actual student responses, common errors, lesson planning decisions, and inclusive classroom challenges.',
    dos: [
      'Include verbatim student quotes, sample student work (e.g. calculation errors), or classroom interactions.',
      'Set scenarios in realistic elementary and secondary school environments.',
      'Make the scenario concise; provide necessary contextual details without wordy padding.'
    ],
    donts: [
      'Do not present detached textbook definitions that only reward mechanical recall.',
      'Do not create convoluted stories where the key problem is buried in irrelevant narrative.'
    ],
    classroomExample: {
      flawedItem: 'What is dyscalculia?\n(A) Reading difficulty\n(B) Writing difficulty\n(C) Math learning disability\n(D) Hearing loss',
      flawExplanation: 'Tests purely rote nomenclature without assessing diagnostic sensitivity or instructional adaptation.',
      improvedItem: 'When asked to compute 402 - 187, a Grade 5 student writes:\n   402\n - 187\n ------\n   385\n(subtracting smaller digits from larger ones: 7-2=5, 8-0=8, 4-1=3).\nAs a diagnostic teacher, what foundational conceptual deficit does this student error demonstrate?',
      improvedExplanation: 'Evaluates the teacher\'s ability to analyze authentic pupil work and identify regrouping/place-value misconceptions.'
    }
  },
  {
    id: 'guideline-3',
    ruleNumber: 3,
    title: 'Diagnostic Distractor Engineering with Explicit Rationale',
    category: 'Distractor Engineering',
    shortSummary: 'Every distractor must represent a genuine learner misconception or faulty pedagogical assumption.',
    corePrinciple: 'Distractors are not merely wrong answers to fool students; they are diagnostic instruments. An effective distractor identifies exactly what conceptual gap, overgeneralization, or procedural misunderstanding led the candidate to choose it.',
    dos: [
      'Formulate each distractor based on verified misconceptions documented in teacher education research.',
      'Write an explicit "Distractor Rationale" for every incorrect option during item authoring.',
      'Ensure all options are plausible to an unprepared candidate but unambiguously incorrect compared to the key.'
    ],
    donts: [
      'Do not include implausible, humorous, or nonsensical filler distractors that can be discarded at a glance.',
      'Do not create trick options based on minute grammatical catches.'
    ],
    classroomExample: {
      flawedItem: 'Which theorist proposed the Zone of Proximal Development?\n(A) Lev Vygotsky\n(B) Albert Einstein\n(C) Napoleon Bonaparte\n(D) William Shakespeare',
      flawExplanation: 'Distractors B, C, and D are absurd filler items that require zero pedagogical understanding to eliminate.',
      improvedItem: 'A teacher provides temporary sentence starters and graphic organizers to assist students writing their first descriptive essay, gradually withdrawing support as proficiency grows.\nWhich pedagogical construct is being enacted?\n(A) Operant conditioning\n(B) Scaffolding within ZPD\n(C) Assimilation without accommodation\n(D) Discovery learning through negative reinforcement',
      improvedExplanation: 'Each distractor represents a distinct theoretical construct that candidates frequently confuse with socio-cultural scaffolding.'
    }
  },
  {
    id: 'guideline-4',
    ruleNumber: 4,
    title: 'Cognitive Rigor & Bloom\'s Taxonomy Distribution',
    category: 'Cognitive Rigor',
    shortSummary: 'Maintain a balanced blueprint: ~15% Recall, ~35% Understanding, ~30% Application, and ~20% Analysis.',
    corePrinciple: 'STET is a professional licensing exam. High-stakes credibility requires minimizing pure recall in favor of higher-order cognitive processes: evaluating pedagogical choices, analyzing student errors, and synthesizing interventions.',
    dos: [
      'Target Higher-Order Thinking Skills (HOTS): analyze, evaluate, diagnose, adapt, and differentiate.',
      'Use action verbs linked to cognitive demands (e.g., "diagnose", "infer", "justify", "differentiate").',
      'Distribute items across Bloom\'s Revised Taxonomy to ensure fair stratification of candidates.'
    ],
    donts: [
      'Do not tilt the test toward 80% rote recall of chapter names, acronyms, and theorists\' birth years.',
      'Do not confuse item length with cognitive difficulty (a long stem can still test trivial recall).'
    ],
    classroomExample: {
      flawedItem: 'In what year was the Right to Education (RTE) Act enacted?\n(A) 2005  (B) 2007  (C) 2009  (D) 2011',
      flawExplanation: 'Tests purely date recall (Low Cognitive Demand / Recall).',
      improvedItem: 'Under Section 29 of the RTE Act 2009 and NEP 2020 guidelines on Continuous and Comprehensive Evaluation (CCE), which assessment practice is prohibited in elementary schools?\n(A) Maintaining cumulative student portfolios\n(B) Conducting periodic diagnostic rubrics\n(C) Failing a student based on a single high-stakes summative board examination\n(D) Engaging peer review for group projects',
      improvedExplanation: 'Tests the legal and pedagogical application of RTE mandates on non-retention and authentic assessment.'
    }
  },
  {
    id: 'guideline-5',
    ruleNumber: 5,
    title: 'Absolute Elimination of Flawed Options',
    category: 'Distractor Engineering',
    shortSummary: 'Prohibit "All of the above", "None of the above", and "Both A and B" options.',
    corePrinciple: 'Meta-options destroy psychometric validity. If a test-taker recognizes two options as correct, "All of the above" gives away the answer without requiring knowledge of the third. "None of the above" measures skepticism rather than knowledge.',
    dos: [
      'Write four independent, mutually exclusive, homogeneous options.',
      'Keep options within similar word counts and grammatical complexity.',
      'Verify that only one option is unambiguously the best answer.'
    ],
    donts: [
      'Never use "All of the above" or "None of the above".',
      'Avoid composite options like "Both A and B" or "A and C but not B" unless formatted as structured Roman numeral statements (I, II, III).'
    ],
    classroomExample: {
      flawedItem: 'Formative assessment aims to:\n(A) Diagnose learning gaps\n(B) Provide continuous feedback\n(C) Improve learning outcomes\n(D) All of the above',
      flawExplanation: 'Candidates who only know option A and B will guess D with zero knowledge of C, inflating guessing reliability.',
      improvedItem: 'What is the primary pedagogical purpose of formative assessment during a teaching unit?\n(A) Assigning final percentile ranks for institutional reporting\n(B) Providing timely descriptive feedback to modify ongoing learning and teaching\n(C) Screening students for streaming into differentiated ability tracks\n(D) Certifying end-of-term minimum level of learning mastery',
      improvedExplanation: 'Four distinct assessment objectives with contrasting purposes, where only (B) captures the true formative mandate.'
    }
  },
  {
    id: 'guideline-6',
    ruleNumber: 6,
    title: 'Grammatical Parallelism & Clue Elimination',
    category: 'Distractor Engineering',
    shortSummary: 'Maintain grammatical symmetry and eliminate accidental clues (articles, syntax leaks, length disparities).',
    corePrinciple: 'Test-wise candidates can often identify the correct answer simply because it is noticeably longer, more carefully qualified, or the only option that agrees grammatically with the stem.',
    dos: [
      'Ensure every option completes the stem grammatically in number, tense, and case.',
      'Keep option lengths balanced within +/- 15% word count.',
      'Place common introductory words in the stem rather than repeating them in every option.'
    ],
    donts: [
      'Do not end the stem with "an" or "a" if some options begin with consonants and others with vowels.',
      'Do not make the correct answer significantly longer and full of pedagogical buzzwords while distractors are brief.'
    ],
    classroomExample: {
      flawedItem: 'A constructivist teacher is an:\n(A) dictator\n(B) facilitator who actively scaffolds collaborative student inquiry\n(C) lecturer\n(D) spectator',
      flawExplanation: '"an" at the end of the stem grammatically eliminates (A), (C), and (D). Moreover, (B) is four times longer than any other option.',
      improvedItem: 'In a constructivist classroom, the primary role of the teacher is characterized as a:\n(A) dispenser of predetermined objective knowledge\n(B) facilitator of collaborative inquiry and sense-making\n(C) passive observer of self-directed child play\n(D) strict enforcer of rote algorithmic compliance',
      improvedExplanation: 'All four options start with the same grammatical structure, are of comparable length, and test distinct pedagogical stances.'
    }
  },
  {
    id: 'guideline-7',
    ruleNumber: 7,
    title: 'Disciplined Negative Phrasing',
    category: 'Stem Design',
    shortSummary: 'Avoid negative stems; if strictly necessary, capitalize "NOT" or "EXCEPT" and verify pedagogical purpose.',
    corePrinciple: 'Negative questions increase cognitive load unrelated to the construct being tested. Candidates often overlook "not" and pick the first correct statement they see, resulting in false negatives.',
    dos: [
      'Phrase items positively whenever possible (ask what a teacher SHOULD do, not what they should avoid).',
      'When negative phrasing is pedagogically indispensable (e.g. identifying a malpractice), format in bold uppercase: NOT, EXCEPT, LEAST.',
      'Ensure all options remain positive statements to prevent confusing double negatives.'
    ],
    donts: [
      'Never write double-negative items (e.g., "Which of the following is NOT an unconstructive approach?").',
      'Never bury the word "not" in the middle of a long sentence.'
    ],
    classroomExample: {
      flawedItem: 'Which of the following does not fail to encourage learner autonomy?\n(A) Authoritarian control\n(B) Student self-assessment rubrics\n(C) Corporal punishment\n(D) Rote dictation',
      flawExplanation: '"does not fail to encourage" is a confusing double negative that tests reading puzzle-solving rather than pedagogy.',
      improvedItem: 'Which instructional practice most effectively fosters learner autonomy in an elementary science classroom?\n(A) Dictating solved workbook questions for rote reproduction\n(B) Guiding students to maintain reflective inquiry learning logs\n(C) Restricting investigations strictly to teacher demonstration\n(D) Grading students solely on verbatim memorization of definitions',
      improvedExplanation: 'Positively phrased, transparent, and tests the target construct directly.'
    }
  },
  {
    id: 'guideline-8',
    ruleNumber: 8,
    title: 'Sikkim Contextualization & Cultural Inclusivity',
    category: 'Sikkim Context',
    shortSummary: 'Root items in Sikkim\'s ecological, linguistic, cultural, and geographic realities.',
    corePrinciple: 'STET certifies educators for schools across Sikkim. Items must reflect local environmental diversity (Khangchendzonga biosphere, alpine terrain, biodiversity), multi-ethnic classrooms (Bhutia, Lepcha, Nepali), organic agriculture, and remote hill-school dynamics.',
    dos: [
      'Incorporate authentic Sikkim geography (districts: Gangtok, Namchi, Mangan, Gyalshing, Soreng, Pakyong).',
      'Use contextual scenarios: terraced farming, seasonal landslides, multilingual translanguaging, rhododendron sanctuaries.',
      'Highlight inclusive practices suited for multi-grade classrooms in rural Himalayan habitations.'
    ],
    donts: [
      'Do not rely exclusively on urban metropolitan contexts (e.g. subway trains, massive multi-lane highways).',
      'Do not present cultural stereotypes or marginalize any of the state\'s indigenous communities.'
    ],
    classroomExample: {
      flawedItem: 'To teach about transportation, the teacher should take students to observe:\n(A) The city metro railway station\n(B) The sea port cargo terminal\n(C) An underground subway\n(D) An interstate multi-deck flyover',
      flawExplanation: 'Alien and irrelevant to children living in mountainous regions like Sikkim where ropeways, mountain paths, and shared jeeps predominate.',
      improvedItem: 'An EVS teacher in North Sikkim (Mangan district) plans a lesson on local sustainable livelihoods. Which experiential activity best connects with the regional context?\n(A) Studying industrial petroleum extraction methods\n(B) Investigating indigenous large cardamom farming and organic soil management\n(C) Analyzing coastal fishing harbor economies\n(D) Reviewing mechanized cotton ginning textile factories',
      improvedExplanation: 'Directly leverages Sikkim\'s premier organic agriculture and ecological reality, fostering meaningful environmental education.'
    }
  },
  {
    id: 'guideline-9',
    ruleNumber: 9,
    title: 'Universal Design for Learning (UDL) & Inclusion (RPwD 2016)',
    category: 'Fairness & Bias',
    shortSummary: 'Test teacher readiness to identify, accommodate, and empower diverse learners and CWSN.',
    corePrinciple: 'Under the Rights of Persons with Disabilities (RPwD) Act 2016 and NEP 2020, inclusive education is non-negotiable. Questions must evaluate pedagogical adaptations, assistive aids, flexible assessments, and asset-based mindsets.',
    dos: [
      'Test knowledge of accommodations for neurodiversity (ADHD, autism, dyslexia, dyscalculia) and sensory impairments.',
      'Reflect Universal Design for Learning (multiple means of representation, engagement, and expression).',
      'Frame diversity as an asset rather than a deficit to be remediated.'
    ],
    donts: [
      'Do not frame children with disabilities using stigmatizing medical-deficit terminology.',
      'Do not endorse segregationist or exclusionist strategies (e.g. "sending struggling children to separate special schools").'
    ],
    classroomExample: {
      flawedItem: 'What should a teacher do with an abnormal child?\n(A) Segregate them in a corner\n(B) Advise parents to withdraw them\n(C) Send them to a mentally retarded asylum\n(D) Treat them nicely',
      flawExplanation: 'Offensive, archaic, non-pedagogical, and violates basic human rights legislation.',
      improvedItem: 'A teacher notices that a student with low vision in Grade 4 struggles to read text written on the chalkboard. In alignment with inclusive education, which accommodation should the teacher implement first?\n(A) Excuse the student from taking part in all visual classroom activities\n(B) Seat the student in the front row with clear lighting and provide large-print worksheets\n(C) Advise the parents to enroll the child in a segregated residential school\n(D) Instruct peer classmates to write the student\'s notes entirely on their behalf',
      improvedExplanation: 'Tests practical, respectful, and classroom-based accommodations supporting active participation.'
    }
  },
  {
    id: 'guideline-10',
    ruleNumber: 10,
    title: 'Assessment FOR, OF, and AS Learning Distinction',
    category: 'Cognitive Rigor',
    shortSummary: 'Differentiate between formative diagnostic feedback, summative certification, and metacognitive self-regulation.',
    corePrinciple: 'Educators must master the modern assessment paradigms under NEP 2020: Assessment FOR Learning (formative/scaffolding), Assessment OF Learning (summative/achievement), and Assessment AS Learning (student self-monitoring and metacognition).',
    dos: [
      'Test candidate understanding of student self-assessment, peer feedback, and rubric co-creation (Assessment AS Learning).',
      'Focus on qualitative diagnostic feedback rather than punitive numerical grading.',
      'Examine formative adjustments based on formative evidence.'
    ],
    donts: [
      'Do not treat all assessment as synonymous with end-of-year pen-and-paper examinations.',
      'Do not confuse ranking/grading with diagnostic feedback.'
    ],
    classroomExample: {
      flawedItem: 'Assessment is used to:\n(A) Give marks\n(B) Promote students\n(C) Filter failures\n(D) Teach students',
      flawExplanation: 'Vague, simplistic, and reinforces punitive exam-centric habits.',
      improvedItem: 'During a peer-review session in English writing, students use a shared checklist to evaluate whether their partner\'s paragraph includes a topic sentence and supporting evidence. This activity exemplifies:\n(A) Assessment of Learning\n(B) Assessment as Learning\n(C) Norm-referenced diagnostic grading\n(D) Summative psychometric screening',
      improvedExplanation: 'Accurately tests the metacognitive, reflective nature of Assessment AS Learning.'
    }
  }
];

export const STET_COMPETENCY_DOMAINS: StetCompetencyDomain[] = [
  {
    domainId: 'domain-cdp',
    subject: 'CDP',
    title: 'Child Development & Pedagogical Processes',
    description: 'Foundations of cognitive, physical, moral, and socio-emotional growth; learning paradigms; inclusive education; continuous evaluation.',
    subDomains: [
      {
        code: 'CDP.COG.01',
        name: 'Cognitive Development & Constructivist Theories',
        keyLearningOutcomes: ['Piagetian stages of operations', 'Vygotskian socio-cultural mediation & ZPD', 'Bruner enactive-iconic-symbolic', 'Information processing']
      },
      {
        code: 'CDP.INC.02',
        name: 'Inclusive Education & Differentiated Instruction',
        keyLearningOutcomes: ['RPwD Act 2016 21 disability categories', 'UDL frameworks', 'Addressing gifted and struggling learners', 'Gender sensitivity']
      },
      {
        code: 'CDP.ASS.03',
        name: 'Assessment Paradigms & Diagnostic Feedback',
        keyLearningOutcomes: ['Assessment For, Of, and As Learning', 'Formative rubrics', 'Student portfolios & holistic report cards', 'Error analysis']
      },
      {
        code: 'CDP.MOT.04',
        name: 'Motivation, Emotion & Classroom Dynamics',
        keyLearningOutcomes: ['Intrinsic vs extrinsic motivation', 'Growth mindset (Carol Dweck)', 'Self-efficacy (Bandura)', 'Restorative classroom management']
      }
    ]
  },
  {
    domainId: 'domain-maths',
    subject: 'Maths',
    title: 'Mathematics Pedagogy & Conceptual Content',
    description: 'Number sense, spatial-geometric reasoning, algebraic generalization, fractions & proportional thinking, Concrete-Representational-Abstract (CRA) pedagogy.',
    subDomains: [
      {
        code: 'MATH.NUM.01',
        name: 'Number Concepts & Place Value Reasoning',
        keyLearningOutcomes: ['Place value bundling', 'Decomposition algorithms', 'Regrouping misconceptions', 'Order of operations']
      },
      {
        code: 'MATH.FRAC.02',
        name: 'Fractions, Decimals & Proportional Reasoning',
        keyLearningOutcomes: ['Part-whole models', 'Fraction addition misconception', 'Multiplicative vs additive thinking', 'Ratio & unit rates']
      },
      {
        code: 'MATH.GEO.03',
        name: 'Spatial Thinking & Van Hiele Geometric Levels',
        keyLearningOutcomes: ['Van Hiele levels (Visualization to Deduction)', 'Perimeter vs area invariance', 'Symmetry & 3D net unfolding']
      },
      {
        code: 'MATH.PED.04',
        name: 'CRA Model & Mathematics Anxiety Remediation',
        keyLearningOutcomes: ['Concrete-Representational-Abstract sequencing', 'Open-ended problem solving', 'Error diagnosis in student work', 'Math talk in class']
      }
    ]
  },
  {
    domainId: 'domain-evs-sci',
    subject: 'EVS',
    title: 'Environmental Studies & Science Inquiry Pedagogy',
    description: 'Inquiry-based learning, ecosystem interdependence, Sikkim Himalayan ecology, scientific misconceptions, hands-on scientific methods.',
    subDomains: [
      {
        code: 'EVS.ECO.01',
        name: 'Himalayan Biodiversity & Ecological Interdependence',
        keyLearningOutcomes: ['Khangchendzonga biosphere reserves', 'Sikkim alpine flora and fauna', 'Food webs and ecological niches', 'Local conservation heritage']
      },
      {
        code: 'EVS.CLIM.02',
        name: 'Climate, Glaciers & Disaster Preparedness',
        keyLearningOutcomes: ['Glacial Lake Outburst Floods (GLOF)', 'South Lhonak Lake dynamics', 'Landslide mitigation', 'Water resources & springsheds']
      },
      {
        code: 'SCI.INQ.03',
        name: 'Scientific Inquiry & Constructivist Science',
        keyLearningOutcomes: ['Formulating testable hypotheses', 'Controlling variables in fair tests', 'Misconceptions in heat, light, and forces', 'Observation logs']
      }
    ]
  },
  {
    domainId: 'domain-soc',
    subject: 'SocialScience',
    title: 'Social Science Pedagogy & Critical Inquiry',
    description: 'Source-based historical inquiry, geographical patterns, democratic governance, Sikkim local history & cultural heritage, critical pedagogy.',
    subDomains: [
      {
        code: 'SOC.HIST.01',
        name: 'Source-Based History & Historiography',
        keyLearningOutcomes: ['Primary vs secondary sources', 'Interpreting archival records & oral traditions', 'Avoiding presentism', 'Chronological empathy']
      },
      {
        code: 'SOC.SIK.02',
        name: 'Sikkim Heritage, Chogyal Era & Democratic Integration',
        keyLearningOutcomes: ['Treaty of Tumlong (1861)', '36th Constitutional Amendment Act 1975', 'Article 371F safeguards', 'Old Sikkimese administrative institutions']
      },
      {
        code: 'SOC.CIV.03',
        name: 'Democratic Institutions, Equity & Social Justice',
        keyLearningOutcomes: ['Panchayati Raj in Sikkim', 'Fundamental Rights & Directive Principles', 'Gender equity & anti-discrimination', 'Civic engagement']
      }
    ]
  },
  {
    domainId: 'domain-eng',
    subject: 'English',
    title: 'English Language Teaching (ELT) & Literacy Pedagogy',
    description: 'Communicative language teaching, phonemic awareness, reading comprehension strategies, translanguaging, diagnostic error analysis in writing.',
    subDomains: [
      {
        code: 'ENG.LSRW.01',
        name: 'Integrative Skills & Communicative Competence',
        keyLearningOutcomes: ['Receptive vs productive skills', 'Communicative language teaching (CLT)', 'Task-based language learning', 'Fluency vs accuracy']
      },
      {
        code: 'ENG.READ.02',
        name: 'Reading Pedagogy & Text Comprehension',
        keyLearningOutcomes: ['Skimming, scanning, inferential reading', 'Phonemic awareness vs whole language', 'Reciprocal teaching', 'Vocabulary in context']
      },
      {
        code: 'ENG.ERR.03',
        name: 'Second Language Acquisition & Error Analysis',
        keyLearningOutcomes: ['Interlanguage & developmental errors', 'Translanguaging in multilingual classrooms', 'Formative feedback on writing', 'Syntax vs usage']
      }
    ]
  }
];

/**
 * Authentic STET Item Bank Reference Questions
 * Sourced from SCERT Sikkim & Azim Premji University STET Item Bank Blueprint
 * Equipped with comprehensive item metadata, competency mapping, and diagnostic distractor rationales.
 */
export const STET_OFFICIAL_ITEM_BANK_QUESTIONS: Question[] = [
  // ==========================================
  // CHILD DEVELOPMENT AND PEDAGOGY (CDP)
  // ==========================================
  {
    id: 'stet-ref-cdp-001',
    year: '2025',
    category: 'CDP',
    examTracks: ['prt', 'gt-maths-science', 'gt-humanities'],
    topic: 'Vygotskian Socio-Cultural Theory',
    subtopic: 'Scaffolding within the Zone of Proximal Development',
    questionNumber: 1,
    competencyCode: 'CDP.COG.01',
    cognitiveLevel: 'Application',
    isStetItemBankRef: true,
    sourceDoc: 'SCERT Sikkim & Azim Premji University STET Item Bank',
    contentDomain: 'Child Development & Pedagogical Processes',
    question: 'A Grade 6 mathematics teacher observes that students can comfortably solve single-variable linear equations like 2x + 5 = 15, but get completely confused when presented with word problems requiring them to formulate the equation first. The teacher models how to underline clue words, introduces a visual translation template, works through two examples collaboratively with the class, and then gradually has students work in pairs with diminishing hints.\n\nFrom a Vygotskian socio-cultural perspective, this instructional intervention is best characterized as:',
    options: [
      'Applying negative reinforcement to extinguish incorrect equation formulations',
      'Providing pedagogical scaffolding within the learners’ Zone of Proximal Development (ZPD)',
      'Stimulating equilibration through cognitive conflict and autonomous individual accommodation',
      'Drilling rote stimulus-response bonds until algorithmic overlearning is achieved'
    ],
    correctIndex: 1,
    explanation: 'According to Lev Vygotsky, the Zone of Proximal Development (ZPD) is the distance between what a learner can achieve independently and what they can achieve with guidance from a More Knowledgeable Other (MKO). Scaffolding refers to the temporary, adjustable instructional supports (modeling, graphic organizers, paired collaboration) that are systematically withdrawn as learner autonomy develops.',
    distractorRationales: [
      'Diagnostic Misconception (Behaviorist): Conflates supportive cognitive guidance with operant conditioning (negative reinforcement, which involves removing an aversive stimulus to increase behavior frequency).',
      'Correct Pedagogical Target: Identifies the intentional, temporary mediation tailored precisely within the learners’ current developmental zone.',
      'Diagnostic Misconception (Piagetian Confusion): Attributes the learning to Piagetian autonomous equilibration rather than socio-cultural mediated assistance with an MKO.',
      'Diagnostic Misconception (Rote Drill): Mistaking constructivist guided modeling for behaviorist drill-and-practice and mechanical habit formation.'
    ],
    examPatternAnalysis: 'SCERT Sikkim & Azim Premji University STET Item Bank reference standard item. Tests application of socio-cultural learning theory in secondary classroom lesson design.',
    difficulty: 'Medium',
    tags: ['Vygotsky', 'ZPD', 'Scaffolding', 'SCERT STET Item Bank', 'Pedagogy'],
    logicMode: 'theorist-stage',
    previousPaperSet: 'SCERT Sikkim & APU STET Item Bank'
  },
  {
    id: 'stet-ref-cdp-002',
    year: '2025',
    category: 'CDP',
    examTracks: ['prt', 'gt-maths-science', 'gt-humanities'],
    topic: 'Inclusive Education & Learning Disabilities',
    subtopic: 'Diagnostic Evaluation of Dyslexia under RPwD Act 2016',
    questionNumber: 2,
    competencyCode: 'CDP.INC.02',
    cognitiveLevel: 'Analysis',
    isStetItemBankRef: true,
    sourceDoc: 'SCERT Sikkim & Azim Premji University STET Item Bank',
    contentDomain: 'Child Development & Pedagogical Processes',
    question: 'A Grade 4 student exhibits sharp verbal intellect, actively participates in oral discussions, and grasps complex scientific concepts easily when spoken. However, the student consistently reverses mirror letters (confusing "b" and "d", "p" and "q"), struggles to decode unfamiliar words phonetically, reads at a very halting pace, and skips lines during oral reading.\n\nWhich learning profile does this child most likely exhibit, and what is the most appropriate inclusive pedagogical accommodation?',
    options: [
      'Intellectual Disability; the student should be exempted from standard academic curriculum and transferred to a vocational facility',
      'Dyslexia; the teacher should provide multi-sensory phonics instruction, audiobooks, and extra time during reading assessments',
      'Attention Deficit Hyperactivity Disorder (ADHD); the teacher should enforce strict behavioral seat-time punishments during silent reading',
      'Dyscalculia; the teacher should provide concrete abacuses and drill basic multiplication tables'
    ],
    correctIndex: 1,
    explanation: 'Dyslexia is a specific learning disability of neurobiological origin characterized by difficulties with accurate and/or fluent word recognition and by poor spelling and decoding abilities. Cognitive ability is typically average to above average. Under the RPwD Act 2016 and inclusive pedagogy, appropriate accommodations include multi-sensory structured literacy (Orton-Gillingham), assistive audio text, and extended time without stigmatizing segregation.',
    distractorRationales: [
      'Diagnostic Misconception (Deficit Model): Falsely equates specific reading difficulties with generalized cognitive/intellectual deficit, violating RPwD inclusive principles.',
      'Correct Pedagogical Target: Accurately identifies dyslexia and selects evidence-based multi-sensory accommodations that preserve dignity and high expectations.',
      'Diagnostic Misconception (Behavioral Attribution): Conflates neurodivergent decoding struggles with willful defiance or inattention, prescribing punitive measures.',
      'Diagnostic Misconception (Domain Error): Confuses dyslexia (reading/language) with dyscalculia (mathematics/number processing).'
    ],
    examPatternAnalysis: 'SCERT Sikkim & APU STET Item Bank exemplar. Assesses differential diagnosis of learning disabilities and rights-based inclusive classroom adjustments.',
    difficulty: 'Medium',
    tags: ['Inclusive Education', 'Dyslexia', 'RPwD Act 2016', 'Accommodations', 'SCERT STET Item Bank'],
    logicMode: 'case-study',
    previousPaperSet: 'SCERT Sikkim & APU STET Item Bank'
  },
  {
    id: 'stet-ref-cdp-003',
    year: '2025',
    category: 'CDP',
    examTracks: ['prt', 'gt-maths-science', 'gt-humanities'],
    topic: 'Piaget’s Stages of Cognitive Development',
    subtopic: 'Conservation and Centration in Concrete Operational Stage',
    questionNumber: 3,
    competencyCode: 'CDP.COG.01',
    cognitiveLevel: 'Understanding',
    isStetItemBankRef: true,
    sourceDoc: 'SCERT Sikkim & Azim Premji University STET Item Bank',
    contentDomain: 'Child Development & Pedagogical Processes',
    question: 'A teacher pours an identical volume of orange juice into two identical wide glasses (A and B). A 5-year-old child agrees both glasses contain the same amount. The teacher then pours the contents of glass B into a tall, narrow glass C in front of the child. The child immediately asserts that glass C now has "more juice because it is taller".\n\nAccording to Jean Piaget, which cognitive limitation characterizes this child\'s thinking?',
    options: [
      'Hypothetico-deductive reasoning within the Formal Operational stage',
      'Centration and lack of reversibility characteristic of the Pre-operational stage',
      'Abstract formal conservation achieved in the Concrete Operational stage',
      'Object permanence deficit characteristic of the Sensorimotor stage'
    ],
    correctIndex: 1,
    explanation: 'In Piaget’s theory, children in the Pre-operational stage (approx. 2 to 7 years) exhibit "centration"—the tendency to focus on only one salient perceptual aspect of a situation (in this case, height) while ignoring other relevant dimensions (such as width). They also lack cognitive reversibility (the mental operation to imagine pouring the liquid back). Conservation develops during the Concrete Operational stage (7-11 years).',
    distractorRationales: [
      'Diagnostic Misconception (Stage Overestimation): Confuses early childhood perceptual centration with adolescent abstract formal reasoning.',
      'Correct Pedagogical Target: Identifies centration and irreversibility as hallmark limitations of pre-operational thought.',
      'Diagnostic Misconception (Inverted Criterion): Mistakenly asserts that the child HAS achieved conservation when the child clearly failed the conservation task.',
      'Diagnostic Misconception (Sensorimotor Confusion): Confuses liquid conservation with infant object permanence (which develops around 8-12 months).'
    ],
    examPatternAnalysis: 'SCERT Sikkim & APU STET Item Bank classic exemplar. Evaluates developmental psychology principles foundational for foundational and preparatory stage educators.',
    difficulty: 'Easy',
    tags: ['Piaget', 'Pre-operational', 'Centration', 'Conservation', 'SCERT STET Item Bank'],
    logicMode: 'theorist-stage',
    previousPaperSet: 'SCERT Sikkim & APU STET Item Bank'
  },
  {
    id: 'stet-ref-cdp-004',
    year: '2025',
    category: 'CDP',
    examTracks: ['prt', 'gt-maths-science', 'gt-humanities'],
    topic: 'Assessment Paradigms (NEP 2020 & CCE)',
    subtopic: 'Formative Assessment vs Summative Certification',
    questionNumber: 4,
    competencyCode: 'CDP.ASS.03',
    cognitiveLevel: 'Analysis',
    isStetItemBankRef: true,
    sourceDoc: 'SCERT Sikkim & Azim Premji University STET Item Bank',
    contentDomain: 'Child Development & Pedagogical Processes',
    question: 'Consider the following four assessment activities in an upper primary school in Namchi district:\n\nI. Conducting a mid-unit quiz and using the error patterns to reorganize the next day\'s lesson into small guided inquiry stations.\nII. Holding a teacher-student dialogue where the student compares their science project draft against a qualitative rubric to identify areas for revision.\nIII. Administering a sealed annual examination, converting raw scores to percentile ranks, and publishing a class honor roll.\nIV. Having peer partners exchange story drafts and write two positive comments and one suggestion for plot clarity.\n\nWhich combination of activities accurately exemplifies "Assessment FOR Learning" and "Assessment AS Learning" respectively?',
    options: [
      'Assessment FOR Learning: III; Assessment AS Learning: I',
      'Assessment FOR Learning: I; Assessment AS Learning: II and IV',
      'Assessment FOR Learning: III; Assessment AS Learning: II',
      'Assessment FOR Learning: II and IV; Assessment AS Learning: III'
    ],
    correctIndex: 1,
    explanation: 'Assessment FOR Learning (formative) occurs during instructional delivery to inform teaching choices and provide diagnostic adjustments (Activity I). Assessment AS Learning involves learners acting as active assessors who monitor their own metacognitive learning processes using rubrics or peer exchange (Activities II and IV). Activity III is purely Assessment OF Learning (summative certification/ranking).',
    distractorRationales: [
      'Diagnostic Misconception: Confuses summative high-stakes ranking (III) with formative instructional feedback (FOR learning).',
      'Correct Pedagogical Target: Accurately classifies teacher-directed formative adaptation as FOR learning and student-directed metacognitive self/peer reflection as AS learning.',
      'Diagnostic Misconception: Fails to recognize that publishing honor rolls and annual exams (III) is summative certification (OF learning).',
      'Diagnostic Misconception: Reverses formative instructional design and summative judgment categories.'
    ],
    examPatternAnalysis: 'SCERT Sikkim & APU STET Item Bank benchmark. Rigorously tests the tripartite assessment framework mandated by NEP 2020.',
    difficulty: 'Hard',
    tags: ['Assessment for Learning', 'Assessment as Learning', 'NEP 2020', 'CCE', 'SCERT STET Item Bank'],
    logicMode: 'case-study',
    previousPaperSet: 'SCERT Sikkim & APU STET Item Bank'
  },
  {
    id: 'stet-ref-cdp-005',
    year: '2025',
    category: 'CDP',
    examTracks: ['prt', 'gt-maths-science', 'gt-humanities'],
    topic: 'Kohlberg’s Theory of Moral Development',
    subtopic: 'Conventional Morality & Law and Order Orientation',
    questionNumber: 5,
    competencyCode: 'CDP.COG.01',
    cognitiveLevel: 'Understanding',
    isStetItemBankRef: true,
    sourceDoc: 'SCERT Sikkim & Azim Premji University STET Item Bank',
    contentDomain: 'Child Development & Pedagogical Processes',
    question: 'When asked why citizens must follow traffic signals at intersections even late at night when no police officers or cameras are present, a 14-year-old student responds: "Because rules must be obeyed by everyone equally; if people choose which laws to break whenever it suits them, society would collapse into complete chaos and disorder."\n\nIn Lawrence Kohlberg’s framework of moral reasoning, which stage does this student\'s rationale represent?',
    options: [
      'Stage 1: Heteronomous Obedience and Punishment Avoidance',
      'Stage 2: Individualism, Instrumental Purpose, and Exchange',
      'Stage 4: Social System and Conscience Maintenance (Law and Order)',
      'Stage 6: Universal Ethical Principles based on abstract moral rights'
    ],
    correctIndex: 2,
    explanation: 'Stage 4 (within Kohlberg’s Conventional Level) focuses on maintaining the social order. Moral reasoning at this stage emphasizes duty, respecting social authority, and obeying laws to preserve societal functioning, stability, and predictability.',
    distractorRationales: [
      'Diagnostic Misconception (Pre-conventional): Equating adherence to rules with immediate fear of physical punishment or retribution from authority figures.',
      'Diagnostic Misconception (Instrumental Egoism): Assuming the reasoning is driven by personal transactional benefit ("what\'s in it for me").',
      'Correct Pedagogical Target: Pinpoints the systemic concern for upholding societal order and institutional functioning characteristic of Stage 4.',
      'Diagnostic Misconception (Post-conventional): Mistaking legal order maintenance for Stage 6 autonomous universal ethical principles that can supersede existing civil laws.'
    ],
    examPatternAnalysis: 'SCERT Sikkim & APU STET Item Bank standard item. Tests understanding of developmental morality stages.',
    difficulty: 'Medium',
    tags: ['Kohlberg', 'Moral Development', 'Stage 4', 'SCERT STET Item Bank'],
    logicMode: 'theorist-stage',
    previousPaperSet: 'SCERT Sikkim & APU STET Item Bank'
  },

  // ==========================================
  // MATHEMATICS & PEDAGOGY
  // ==========================================
  {
    id: 'stet-ref-math-001',
    year: '2025',
    category: 'Maths',
    examTracks: ['prt', 'gt-maths-science'],
    topic: 'Fractions & Proportional Reasoning',
    subtopic: 'Diagnosing Common Misconceptions in Fraction Addition',
    questionNumber: 6,
    competencyCode: 'MATH.FRAC.02',
    cognitiveLevel: 'Analysis',
    isStetItemBankRef: true,
    sourceDoc: 'SCERT Sikkim & Azim Premji University STET Item Bank',
    contentDomain: 'Mathematics Pedagogy & Conceptual Content',
    question: 'A teacher writes the following problem on the board: 1/3 + 1/4 = ?\nA student writes down the solution: 1/3 + 1/4 = 2/7\n\nAs a reflective mathematics educator, what is the underlying conceptual misconception generating this error, and what is the most effective constructivist remedial intervention?',
    options: [
      'The student has forgotten the multiplication table; the teacher should mandate rote memorization of prime factorizations.',
      'The student is treating numerators and denominators as independent whole numbers (additive whole-number bias); the teacher should use fraction strips or visual area models to demonstrate equivalence of unit parts.',
      'The student has dyscalculia; the teacher should excuse the student from all future rational number computation.',
      'The student simply made a computational slip; the teacher should instruct the student to re-do the same algorithmic calculation ten times.'
    ],
    correctIndex: 1,
    explanation: 'The error 1/3 + 1/4 = (1+1)/(3+4) = 2/7 is the most prevalent fraction misconception in elementary mathematics, known as "whole-number bias". Students over-generalize whole-number addition rules, treating the top and bottom integers independently. Remediation requires moving back to the Concrete-Representational stage (fraction bars, paper folding, grid models) so the student visibly sees that 1/3 and 1/4 represent different partition sizes that must be renamed into common equivalent units (12ths) before joining.',
    distractorRationales: [
      'Diagnostic Misconception (Procedural Blame): Misdiagnosing a fundamental conceptual partition error as a simple lack of multiplication table drill.',
      'Correct Pedagogical Target: Identifies whole-number bias and selects a developmentally sound Concrete-Representational-Abstract (CRA) visual intervention.',
      'Diagnostic Misconception (Pathologizing Learning): Inappropriately labeling a normal developmental misconception as a clinical pathology (dyscalculia).',
      'Diagnostic Misconception (Meaningless Repetition): Prescribing algorithmic drill of an uncomprehended procedure, which only reinforces faulty habits.'
    ],
    examPatternAnalysis: 'SCERT Sikkim & APU STET Item Bank flagship question. Embodies the APU emphasis on diagnosing pupil misconceptions in school mathematics.',
    difficulty: 'Medium',
    tags: ['Fractions', 'Whole Number Bias', 'CRA Model', 'Diagnostic Error', 'SCERT STET Item Bank'],
    logicMode: 'case-study',
    previousPaperSet: 'SCERT Sikkim & APU STET Item Bank'
  },
  {
    id: 'stet-ref-math-002',
    year: '2025',
    category: 'Maths',
    examTracks: ['prt', 'gt-maths-science'],
    topic: 'Van Hiele Model of Geometric Thinking',
    subtopic: 'Level 1 (Analysis) vs Level 2 (Informal Deduction)',
    questionNumber: 7,
    competencyCode: 'MATH.GEO.03',
    cognitiveLevel: 'Understanding',
    isStetItemBankRef: true,
    sourceDoc: 'SCERT Sikkim & Azim Premji University STET Item Bank',
    contentDomain: 'Mathematics Pedagogy & Conceptual Content',
    question: 'When asked whether a square is a special type of rectangle, a middle school student replies:\n"No, a square cannot be a rectangle because all four sides of a square are equal, whereas a rectangle must always have two long sides and two short sides."\n\nAccording to the Van Hiele levels of geometric thought, at which level is this student operating, and why?',
    options: [
      'Level 0 (Visualization); the student sorts shapes solely on their holistic physical appearance like everyday objects.',
      'Level 1 (Analysis/Descriptive); the student recognizes properties of shapes independently but cannot yet perceive class inclusions or hierarchical relationships between shapes.',
      'Level 2 (Abstraction/Relational); the student easily deduces that the set of all squares is a subset of all rectangles.',
      'Level 4 (Rigor); the student is comparing non-Euclidean axiomatic systems.'
    ],
    correctIndex: 1,
    explanation: 'In the Van Hiele model, at Level 1 (Analysis), learners perceive shapes as collections of properties (e.g. "a rectangle has opposite sides equal, a square has four equal sides"). However, they view these properties in isolation and cannot grasp class inclusion (that a square satisfies all necessary definitions of a rectangle). Understanding hierarchical classification occurs at Level 2 (Abstraction / Informal Deduction).',
    distractorRationales: [
      'Diagnostic Misconception: Fails to see that the student IS analyzing properties (four sides equal, opposite sides), so they are past pure visual holistic matching (Level 0).',
      'Correct Pedagogical Target: Correctly identifies Level 1 where properties are recognized but hierarchical class inclusion is not yet formed.',
      'Diagnostic Misconception: Contradicts the student\'s stated denial that a square can be a rectangle.',
      'Diagnostic Misconception: Far beyond secondary school geometry; Level 4 involves collegiate axiomatic comparison.'
    ],
    examPatternAnalysis: 'SCERT Sikkim & APU STET Item Bank exemplar. Direct test of Van Hiele geometry hierarchy.',
    difficulty: 'Medium',
    tags: ['Van Hiele', 'Geometry', 'Class Inclusion', 'SCERT STET Item Bank'],
    logicMode: 'theorist-stage',
    previousPaperSet: 'SCERT Sikkim & APU STET Item Bank'
  },
  {
    id: 'stet-ref-math-003',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Algebraic Reasoning & Function Generalization',
    subtopic: 'Pattern Generalization in Elementary Number Theory',
    questionNumber: 8,
    competencyCode: 'MATH.NUM.01',
    cognitiveLevel: 'Application',
    isStetItemBankRef: true,
    sourceDoc: 'SCERT Sikkim & Azim Premji University STET Item Bank',
    contentDomain: 'Mathematics Pedagogy & Conceptual Content',
    question: 'A teacher presents students with a sequence of growing matchstick patterns where Stage 1 uses 4 matchsticks to make 1 square, Stage 2 uses 7 matchsticks to make 2 joined squares, Stage 3 uses 10 matchsticks to make 3 joined squares, and so on.\n\nTo foster algebraic generalization rather than trial-and-error counting, which guiding question should the teacher pose to help students derive the general rule for n squares?',
    options: [
      '"Can you count every single matchstick in Stage 50 one by one on your notebook?"',
      '"What is 4 times 7 times 10 divided by 3?"',
      '"Notice how many new matchsticks are added for each new square after the very first starting matchstick. How does this repeated addition connect to the stage number n?"',
      '"Why don\'t you memorize the formula Tn = a + (n-1)d without questioning why it works?"'
    ],
    correctIndex: 2,
    explanation: 'Effective pedagogical questioning in algebra guides students from recursive thinking ("add 3 each time") to functional/explicit generalization: each new square requires 3 sticks, plus 1 initial boundary stick (Formula: 3n + 1). Guiding students to deconstruct the structure builds genuine algebraic reasoning.',
    distractorRationales: [
      'Diagnostic Misconception (Brute Force): Encourages tedious empirical counting that breaks down for large values of n.',
      'Diagnostic Misconception (Nonsense Arithmetic): Prompts arbitrary calculation unrelated to the structural pattern.',
      'Correct Pedagogical Target: Promotes structural decomposition and leads to functional generalization (3n + 1).',
      'Diagnostic Misconception (Rote Formula): Forces memorization of formulas without structural geometric grounding.'
    ],
    examPatternAnalysis: 'SCERT Sikkim & APU STET Item Bank question framing exemplar. Illustrates how to assess teacher questioning techniques in mathematics.',
    difficulty: 'Medium',
    tags: ['Algebraic Thinking', 'Pattern Generalization', 'Pedagogical Questioning', 'SCERT STET Item Bank'],
    logicMode: 'case-study',
    previousPaperSet: 'SCERT Sikkim & APU STET Item Bank'
  },

  // ==========================================
  // ENVIRONMENTAL STUDIES (EVS) & SCIENCE
  // ==========================================
  {
    id: 'stet-ref-evs-001',
    year: '2025',
    category: 'EVS',
    examTracks: ['prt'],
    topic: 'Himalayan Ecosystem & Water Resources',
    subtopic: 'Dhara Vikas (Springshed Management in Sikkim)',
    questionNumber: 9,
    competencyCode: 'EVS.ECO.01',
    cognitiveLevel: 'Application',
    isStetItemBankRef: true,
    sourceDoc: 'SCERT Sikkim & Azim Premji University STET Item Bank',
    contentDomain: 'Environmental Studies & Science Inquiry Pedagogy',
    question: 'During a local field study in a village in South Sikkim, primary students observe dried-up natural water springs ("Dharas") that previously supplied drinking water throughout the dry winter months. The teacher introduces the concept of Sikkim’s "Dhara Vikas" (springshed management) initiative.\n\nWhich experiential inquiry activity best helps elementary students understand how digging recharge trenches and planting indigenous vegetation on uphill slopes restores downhill water springs?',
    options: [
      'Having students copy dictionary definitions of "groundwater aquifer" five times into their homework notebooks',
      'Constructing a dual-tray sloping soil model with sponges and vegetation to simulate rainwater infiltration versus bare compacted runoff',
      'Telling students that dried springs are inevitable acts of nature beyond human understanding',
      'Showing a documentary on industrial nuclear desalination plants operating in the Persian Gulf'
    ],
    correctIndex: 1,
    explanation: 'Constructivist EVS emphasizes experiential, hands-on modeling of local environmental phenomena. Sikkim\'s Dhara Vikas program relies on artificially enhancing rain infiltration in recharge zones (sponges/trenches) to replenish aquifers feeding downhill springs. A physical slope model provides immediate sensory and conceptual proof of infiltration vs. runoff.',
    distractorRationales: [
      'Diagnostic Misconception (Rote Copying): Relies on mechanical dictionary transcription with zero conceptual understanding.',
      'Correct Pedagogical Target: Active inquiry modeling mirroring Sikkim\'s indigenous springshed hydrology.',
      'Diagnostic Misconception (Fatalism): Discourages scientific inquiry and environmental agency.',
      'Diagnostic Misconception (Contextual Alienation): Replaces vital local Himalayan hydrology with geographically disconnected foreign technologies.'
    ],
    examPatternAnalysis: 'SCERT Sikkim & APU STET Item Bank benchmark. Perfect exemplar of local ecological contextualization aligned with Sikkim State initiatives.',
    difficulty: 'Easy',
    tags: ['EVS', 'Dhara Vikas', 'Sikkim Ecology', 'Experiential Learning', 'SCERT STET Item Bank'],
    logicMode: 'case-study',
    previousPaperSet: 'SCERT Sikkim & APU STET Item Bank'
  },
  {
    id: 'stet-ref-sci-002',
    year: '2025',
    category: 'MathsScience',
    examTracks: ['gt-maths-science'],
    topic: 'Scientific Inquiry & Experimental Design',
    subtopic: 'Controlling Variables in Photosynthesis & Plant Respiration',
    questionNumber: 10,
    competencyCode: 'SCI.INQ.03',
    cognitiveLevel: 'Analysis',
    isStetItemBankRef: true,
    sourceDoc: 'SCERT Sikkim & Azim Premji University STET Item Bank',
    contentDomain: 'Environmental Studies & Science Inquiry Pedagogy',
    question: 'A science teacher wants students to investigate whether light intensity affects the rate of photosynthesis in an aquatic plant (Hydrilla). Student groups set up beakers with Hydrilla submerged in water containing dissolved sodium bicarbonate under lamps placed at varying distances (10 cm, 30 cm, 50 cm) and count the oxygen bubbles produced per minute.\n\nGroup C changes the lamp distance from 10 cm to 50 cm, but simultaneously turns off the water heater in the 50 cm beaker, allowing the water temperature to drop from 25°C to 12°C. Why is Group C\'s experiment invalid as a scientific test?',
    options: [
      'Because Hydrilla is an aquatic weed that never produces gas bubbles under artificial light.',
      'Because they failed to maintain a "fair test" by simultaneously altering two independent variables (light intensity and temperature), confounding the cause of the reduced bubble rate.',
      'Because oxygen dissolves completely in water and cannot ever be observed as rising bubbles.',
      'Because sodium bicarbonate neutralizes the chlorophyll pigment inside plant chloroplasts.'
    ],
    correctIndex: 1,
    explanation: 'A fundamental competency in scientific inquiry is conducting a "fair test" by manipulating only one independent variable at a time (here, light intensity via lamp distance) while holding all other confounding variables constant (controlled variables: temperature, CO2 concentration via sodium bicarbonate, species, plant mass). Changing both temperature and light distance makes it impossible to attribute changes in bubble count to light alone.',
    distractorRationales: [
      'Diagnostic Misconception (Scientific Fact Error): Ignores basic textbook biology on aquatic plant photosynthesis demonstrations.',
      'Correct Pedagogical Target: Identifies the violation of variable control in experimental inquiry.',
      'Diagnostic Misconception (Physical Misconception): Denies the visible evolution of oxygen bubbles during photosynthesis in water.',
      'Diagnostic Misconception (Chemical Misconception): Erroneously believes sodium bicarbonate harms chlorophyll, when in reality it provides dissolved CO2 for photosynthesis.'
    ],
    examPatternAnalysis: 'SCERT Sikkim & APU STET Item Bank exemplar. Assesses science pedagogy and core experimental inquiry competencies.',
    difficulty: 'Medium',
    tags: ['Science Pedagogy', 'Fair Test', 'Inquiry', 'Variables', 'SCERT STET Item Bank'],
    logicMode: 'case-study',
    previousPaperSet: 'SCERT Sikkim & APU STET Item Bank'
  },

  // ==========================================
  // SOCIAL SCIENCE & HUMANITIES
  // ==========================================
  {
    id: 'stet-ref-soc-001',
    year: '2025',
    category: 'SocialScience',
    examTracks: ['gt-humanities'],
    topic: 'Historical Inquiry & Critical Historiography',
    subtopic: 'Interpreting Primary Sources vs Secondary Narratives',
    questionNumber: 11,
    competencyCode: 'SOC.HIST.01',
    cognitiveLevel: 'Analysis',
    isStetItemBankRef: true,
    sourceDoc: 'SCERT Sikkim & Azim Premji University STET Item Bank',
    contentDomain: 'Social Science Pedagogy & Critical Inquiry',
    question: 'To teach Grade 8 students about the historical integration of Sikkim into the Indian Union in 1975, a social science teacher brings copies of three documents to class:\n\n1. The official text of the Constitution (Thirty-Sixth Amendment) Act, 1975.\n2. Front-page newspaper reports published on April 27, 1975, in Gangtok and national dailies.\n3. A reflective chapter from a history textbook written in 2021 analyzing the political transition.\n\nHow should the teacher guide students to critically engage with these documents in accordance with pedagogical standards of historical thinking?',
    options: [
      'Instruct students to accept the 2021 textbook as the sole factual authority and discard documents 1 and 2 as outdated.',
      'Have students treat document 1 as an objective primary legislative record, compare the contemporary perspectives and biases in document 2, and evaluate how the secondary analysis in document 3 synthesizes these sources with historical hindsight.',
      'Instruct students to memorize the dates and paragraph numbers verbatim for an upcoming pen-and-paper quiz.',
      'Prohibit discussion of the documents since historical events should only be taught through fictional cinema.'
    ],
    correctIndex: 1,
    explanation: 'Historical thinking requires differentiating primary sources (the 1975 amendment text and contemporary newspaper reports from the era) from secondary interpretations (the 2021 textbook). Students learn that history is an evidence-based interpretive inquiry where historians cross-examine primary evidence, identify perspective/bias, and construct reasoned narratives.',
    distractorRationales: [
      'Diagnostic Misconception (Textbook Dogmatism): Elevates a secondary textbook to unquestioned gospel while discarding authentic primary records.',
      'Correct Pedagogical Target: Applies source criticism, perspective taking, and historical empathy as outlined in the STET curriculum.',
      'Diagnostic Misconception (Rote Reductionism): Reduces rich primary historical inquiry to mechanical date memorization.',
      'Diagnostic Misconception (Anti-Intellectual Avoidance): Avoids evidence-based history in favor of unverified popular fiction.'
    ],
    examPatternAnalysis: 'SCERT Sikkim & APU STET Item Bank flagship question for Graduate Teacher Humanities. Tests source-based historical pedagogy.',
    difficulty: 'Medium',
    tags: ['Historical Thinking', 'Primary Sources', 'Sikkim 1975', 'Social Science', 'SCERT STET Item Bank'],
    logicMode: 'case-study',
    previousPaperSet: 'SCERT Sikkim & APU STET Item Bank'
  },
  {
    id: 'stet-ref-soc-002',
    year: '2025',
    category: 'SocialScience',
    examTracks: ['gt-humanities'],
    topic: 'Democratic Governance & Local Institutions',
    subtopic: 'Article 371F and Sikkim Special Constitutional Provisions',
    questionNumber: 12,
    competencyCode: 'SOC.SIK.02',
    cognitiveLevel: 'Understanding',
    isStetItemBankRef: true,
    sourceDoc: 'SCERT Sikkim & Azim Premji University STET Item Bank',
    contentDomain: 'Social Science Pedagogy & Critical Inquiry',
    question: 'Under Article 371F of the Constitution of India (inserted via the 36th Constitutional Amendment Act, 1975), which unique democratic and constitutional safeguard was specifically provided to protect Sikkim’s historical identity and social equilibrium?',
    options: [
      'The complete dissolution of all pre-existing Sikkimese customary laws and land tenure regulations without exception',
      'The continuation of existing laws in force prior to merger until amended by a competent legislature, alongside provisions for representation of diverse ethnic sections of the population in the Legislative Assembly',
      'The exemption of Sikkim from having an elected Legislative Assembly or Governor',
      'The prohibition of all developmental central grants and funding to the state'
    ],
    correctIndex: 1,
    explanation: 'Article 371F provides special provisions with respect to the State of Sikkim. Key clauses include: sub-clause (k) continuing in force all existing laws until altered, repealed, or amended by a competent legislature; sub-clause (f) enabling Parliament to provide for reservation of seats in the Legislative Assembly for different sections of the population to protect ethnic harmony (Bhutia-Lepcha, Sangha, etc.); and vesting special responsibility in the Governor for peace and equitable social and economic advancement.',
    distractorRationales: [
      'Diagnostic Misconception (Assimilationist Myth): Incorrectly presumes all pre-merger laws and ethnic land safeguards were immediately nullified.',
      'Correct Pedagogical Target: Identifies the historic constitutional compromises preserving existing laws (Old Laws) and ethnic legislative representation.',
      'Diagnostic Misconception (Democratic Denial): Falsely claims Sikkim was denied legislative representation when in fact it instituted a democratic state assembly.',
      'Diagnostic Misconception (Fiscal Distortion): Inverts reality regarding Special Category status and central plan assistance.'
    ],
    examPatternAnalysis: 'SCERT Sikkim & APU STET Item Bank core item. Essential civic and constitutional literacy for Sikkim GT Humanities candidates.',
    difficulty: 'Hard',
    tags: ['Article 371F', 'Constitution of India', 'Sikkim History', 'Governance', 'SCERT STET Item Bank'],
    logicMode: 'policy-statute',
    previousPaperSet: 'SCERT Sikkim & APU STET Item Bank'
  },

  // ==========================================
  // ENGLISH & LANGUAGE PEDAGOGY
  // ==========================================
  {
    id: 'stet-ref-eng-001',
    year: '2025',
    category: 'English',
    examTracks: ['prt', 'gt-humanities', 'gt-maths-science'],
    topic: 'Second Language Acquisition & Multilingualism',
    subtopic: 'Translanguaging as a Pedagogical Resource (NEP 2020)',
    questionNumber: 13,
    competencyCode: 'ENG.ERR.03',
    cognitiveLevel: 'Application',
    isStetItemBankRef: true,
    sourceDoc: 'SCERT Sikkim & Azim Premji University STET Item Bank',
    contentDomain: 'English Language Teaching (ELT) & Literacy Pedagogy',
    question: 'In an English language classroom in West Sikkim, Grade 3 students whose mother tongues are Nepali and Bhutia occasionally use regional words and expressions when explaining scientific observations during pair work (e.g. saying "The water is babbling like a khola during monsoons").\n\nIn line with modern communicative language pedagogy and NEP 2020 multilingualism directives, what is the most constructive response from the teacher?',
    options: [
      'Impose a monetary fine or verbal reprimand whenever any student speaks a non-English word inside the classroom.',
      'Acknowledge and validate the students’ rich linguistic repertoire (translanguaging), using their home language expressions as a cognitive bridge to scaffold equivalent English vocabulary and idiomatic phrases.',
      'Completely discontinue English instruction and teach exclusively in the regional language forever.',
      'Instruct the students to remain completely silent until they can speak with a British RP accent.'
    ],
    correctIndex: 1,
    explanation: 'Modern language acquisition research and NEP 2020 reject the deficit model of "English-only" immersion that punishes students for using their mother tongue. "Translanguaging" views a multilingual learner\'s linguistic system as an integrated communicative resource. By honoring their home language conceptual anchor ("khola"), the teacher bridges to target language vocabulary ("stream", "torrent", "creek") without causing affective filter shutdown.',
    distractorRationales: [
      'Diagnostic Misconception (Monolingual Purism): Punishing home language usage raises the affective filter and impedes second-language acquisition.',
      'Correct Pedagogical Target: Harnesses translanguaging as a legitimate cognitive and linguistic scaffold.',
      'Diagnostic Misconception (Abandonment): Over-corrects into abandoning English language learning objectives entirely.',
      'Diagnostic Misconception (Elitist Prescriptivism): Promotes unrealistic and alien phonetic standards that silence young learners.'
    ],
    examPatternAnalysis: 'SCERT Sikkim & APU STET Item Bank exemplar. Demonstrates asset-based multilingual pedagogy in Himalayan schools.',
    difficulty: 'Easy',
    tags: ['ELT', 'Translanguaging', 'Multilingualism', 'NEP 2020', 'SCERT STET Item Bank'],
    logicMode: 'case-study',
    previousPaperSet: 'SCERT Sikkim & APU STET Item Bank'
  },
  {
    id: 'stet-ref-eng-002',
    year: '2025',
    category: 'English',
    examTracks: ['prt', 'gt-humanities', 'gt-maths-science'],
    topic: 'Reading Pedagogy & Comprehension Strategies',
    subtopic: 'Inferential Reading vs Literal Recall',
    questionNumber: 14,
    competencyCode: 'ENG.READ.02',
    cognitiveLevel: 'Analysis',
    isStetItemBankRef: true,
    sourceDoc: 'SCERT Sikkim & Azim Premji University STET Item Bank',
    contentDomain: 'English Language Teaching (ELT) & Literacy Pedagogy',
    question: 'Read the short excerpt below:\n"Tenzing packed his woolen bakhu, secured his walking stick, and glanced up at the menacing slate-grey clouds shrouding the pass. His grandmother pressed a packet of dried churpi into his palm, her eyes lingering silently on the snowline before she whispered, ‘Return before the shadows lengthen across the valley.’"\n\nTo evaluate students\' "inferential comprehension" rather than mere literal recall, which question should the English teacher ask?',
    options: [
      '"What traditional dress did Tenzing pack?"',
      '"What food item did the grandmother press into Tenzing\'s palm?"',
      '"Why did grandmother look at the snowline with silent concern, and what unspoken perils does Tenzing\'s journey entail?"',
      '"On what part of the body did Tenzing wear his bakhu?"'
    ],
    correctIndex: 2,
    explanation: 'Literal comprehension questions (options A, B, and D) merely ask students to retrieve surface-level facts explicitly stated in the text (bakhu, churpi). Inferential comprehension requires reading "between the lines"—synthesizing textual clues (slate-grey clouds, grandmother\'s lingering look at the snowline, warning about lengthening shadows) with background knowledge to deduce danger, climate risk, and emotional subtext.',
    distractorRationales: [
      'Diagnostic Misconception (Literal Level): Simple factual retrieval question explicitly stated in line 1.',
      'Diagnostic Misconception (Literal Level): Simple factual retrieval question explicitly stated in line 3.',
      'Correct Pedagogical Target: Requires inferring unspoken emotional subtext, impending blizzards, and rugged terrain challenges.',
      'Diagnostic Misconception (Low-Level Vocabulary): Tests basic trivia rather than literary text comprehension.'
    ],
    examPatternAnalysis: 'SCERT Sikkim & APU STET Item Bank reading comprehension standard. Differentiates literal, inferential, and evaluative reading.',
    difficulty: 'Medium',
    tags: ['Reading Comprehension', 'Inferential Reading', 'English Pedagogy', 'SCERT STET Item Bank'],
    logicMode: 'case-study',
    previousPaperSet: 'SCERT Sikkim & APU STET Item Bank'
  },
  {
    id: 'stet-ref-eng-003',
    year: '2025',
    category: 'English',
    examTracks: ['prt', 'gt-humanities', 'gt-maths-science'],
    topic: 'Writing Pedagogy & Process Approach',
    subtopic: 'Formative Feedback on Student Writing',
    questionNumber: 15,
    competencyCode: 'ENG.LSRW.01',
    cognitiveLevel: 'Application',
    isStetItemBankRef: true,
    sourceDoc: 'SCERT Sikkim & Azim Premji University STET Item Bank',
    contentDomain: 'English Language Teaching (ELT) & Literacy Pedagogy',
    question: 'A Grade 7 student submits a first draft of an essay on "Preserving the Forests of Sikkim". The essay has passionate arguments and rich local examples, but contains multiple run-on sentences and inconsistent tense usage. In the "Process Approach to Writing", what should the teacher\'s initial feedback prioritize?',
    options: [
      'Covering the page in red ink correcting every single punctuation and spelling error, assigning a failing grade immediately.',
      'Focusing first on ideas, logical organization, and content strength through constructive comments, before guiding the student through drafting and peer-editing for grammatical surface mechanics in subsequent revisions.',
      'Asking the student to copy a model essay from a commercial guide book twenty times.',
      'Ignoring the student\'s submission entirely because first drafts are unimportant.'
    ],
    correctIndex: 1,
    explanation: 'In the Process Approach to Writing (Planning -> Drafting -> Revising -> Editing -> Publishing), formative feedback distinguishes between "global/higher-order concerns" (ideas, organization, voice, arguments) and "local/lower-order concerns" (spelling, mechanics, punctuation). Early feedback should nurture expression and clarity of thought, addressing surface mechanics during the polishing/editing phase.',
    distractorRationales: [
      'Diagnostic Misconception (Pencil-Bleeding Correction): Over-correction of surface grammar crushes motivation and writing fluency.',
      'Correct Pedagogical Target: Accurately applies the developmental sequence of the Process Approach to Writing.',
      'Diagnostic Misconception (Mechanical Copying): Replaces original student voice with rote commercial plagiarism.',
      'Diagnostic Misconception (Neglect): Fails to provide any formative guidance whatsoever.'
    ],
    examPatternAnalysis: 'SCERT Sikkim & APU STET Item Bank standard. Evaluates teacher competence in writing pedagogy.',
    difficulty: 'Medium',
    tags: ['Writing Pedagogy', 'Process Writing', 'Formative Feedback', 'SCERT STET Item Bank'],
    logicMode: 'case-study',
    previousPaperSet: 'SCERT Sikkim & APU STET Item Bank'
  }
];

/**
 * Question Framing Assistant & Psychometric Audit Engine
 * Analyzes draft test questions against SCERT Sikkim & Azim Premji University guidelines
 */
export interface QuestionAuditResult {
  score: number; // 0 - 100
  rating: 'Exemplary' | 'Good' | 'Needs Revision' | 'Flawed';
  passedRules: string[];
  violations: string[];
  suggestions: string[];
  detectedCognitiveLevel: 'Recall' | 'Understanding' | 'Application' | 'Analysis';
  detectedMisconceptionsOrFlaws: string[];
}

export function auditQuestionAgainstGuidelines(
  questionStem: string,
  options: string[],
  explanation: string
): QuestionAuditResult {
  const violations: string[] = [];
  const suggestions: string[] = [];
  const passedRules: string[] = [];
  const flawsDetected: string[] = [];
  let score = 100;

  const stem = (questionStem || '').trim();
  const opts = (options || []).map(o => (o || '').trim()).filter(Boolean);
  const exp = (explanation || '').trim();

  // Rule 1: Stem length and clarity
  if (stem.length < 30) {
    violations.push('Stem is too brief or lacks problem context (Rule 1 & 2).');
    flawsDetected.push('Vague or context-less question stem');
    suggestions.push('Provide a realistic classroom scenario, student work sample, or clear pedagogical dilemma.');
    score -= 20;
  } else {
    passedRules.push('Question stem provides adequate descriptive context.');
  }

  // Check for scenario indicators
  const scenarioKeywords = ['teacher', 'student', 'class', 'grade', 'observes', 'solving', 'lesson', 'inquiry', 'misconception', 'sikkim', 'activity', 'dialogue'];
  const hasScenario = scenarioKeywords.some(k => stem.toLowerCase().includes(k));
  if (hasScenario) {
    passedRules.push('Stem incorporates an authentic pedagogical scenario or classroom context.');
  } else {
    suggestions.push('Anchor the question in an authentic school or classroom situation to test applied reasoning rather than pure factual recall.');
    score -= 10;
  }

  // Rule 5: Elimination of "All of the above" / "None of the above"
  const flawedPhrases = ['all of the above', 'none of the above', 'both a and b', 'both b and c', 'all the above', 'none of these', 'all of these'];
  const foundFlawedOptions = opts.filter(opt => flawedPhrases.some(p => opt.toLowerCase().includes(p)));
  if (foundFlawedOptions.length > 0) {
    violations.push(`Contains prohibited meta-options: "${foundFlawedOptions.join(', ')}" (Rule 5).`);
    flawsDetected.push('Uses "All of the above" or "None of the above" which distorts test discrimination.');
    suggestions.push('Replace meta-options with four distinct, mutually exclusive pedagogical distractors with diagnostic rationale.');
    score -= 25;
  } else {
    passedRules.push('Free of "All of the above" and "None of the above" flaws.');
  }

  // Rule 6: Option Count and Length Symmetry
  if (opts.length !== 4) {
    violations.push(`Item must have exactly 4 options (currently ${opts.length}).`);
    score -= 15;
  } else {
    passedRules.push('Standard 4-option multiple-choice architecture.');
    const lengths = opts.map(o => o.length);
    const minLen = Math.min(...lengths);
    const maxLen = Math.max(...lengths);
    if (minLen > 0 && maxLen / minLen > 3.5) {
      violations.push('Noticeable length disparity between options (Rule 6). One option is > 3.5x longer than another.');
      flawsDetected.push('Option length clue: correct answer may stand out due to verbosity.');
      suggestions.push('Balance option lengths so test-wise candidates cannot guess based on length.');
      score -= 15;
    } else {
      passedRules.push('Options demonstrate grammatical and length balance.');
    }
  }

  // Rule 7: Negative phrasing checks
  if (stem.toLowerCase().includes(' not ') || stem.toLowerCase().includes(' except ') || stem.toLowerCase().includes(' least ')) {
    if (!stem.includes('NOT') && !stem.includes('EXCEPT') && !stem.includes('LEAST')) {
      violations.push('Negative word in stem is lowercase. Rule 7 mandates capitalizing "NOT" or "EXCEPT" to prevent tricking candidates.');
      suggestions.push('Capitalize negative keywords (e.g. NOT, EXCEPT) or rephrase the question positively.');
      score -= 10;
    } else {
      passedRules.push('Negative phrasing is clearly emphasized (NOT / EXCEPT).');
    }
  }

  // Explanation and Distractor Rationale check
  if (exp.length < 40) {
    suggestions.push('Add an explicit pedagogical explanation and distractor rationales explaining why incorrect options were chosen.');
    score -= 10;
  } else {
    passedRules.push('Detailed pedagogical solution provided.');
  }

  // Cognitive Level Estimation
  let detectedCognitiveLevel: 'Recall' | 'Understanding' | 'Application' | 'Analysis' = 'Understanding';
  const lowerStem = stem.toLowerCase();
  if (lowerStem.includes('diagnose') || lowerStem.includes('analyze') || lowerStem.includes('misconception') || lowerStem.includes('differentiate') || lowerStem.includes('evaluate') || lowerStem.includes('invalid')) {
    detectedCognitiveLevel = 'Analysis';
  } else if (lowerStem.includes('how should the teacher') || lowerStem.includes('intervention') || lowerStem.includes('accommodation') || lowerStem.includes('best response') || lowerStem.includes('guiding question')) {
    detectedCognitiveLevel = 'Application';
  } else if (lowerStem.includes('what year') || lowerStem.includes('who proposed') || lowerStem.includes('define') || lowerStem.includes('is located in')) {
    detectedCognitiveLevel = 'Recall';
  }

  let rating: 'Exemplary' | 'Good' | 'Needs Revision' | 'Flawed' = 'Good';
  score = Math.max(0, Math.min(100, score));
  if (score >= 90) rating = 'Exemplary';
  else if (score >= 75) rating = 'Good';
  else if (score >= 50) rating = 'Needs Revision';
  else rating = 'Flawed';

  return {
    score,
    rating,
    passedRules,
    violations,
    suggestions,
    detectedCognitiveLevel,
    detectedMisconceptionsOrFlaws: flawsDetected
  };
}
