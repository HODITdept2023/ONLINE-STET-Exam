import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  Lightbulb, 
  Clock, 
  Flame, 
  TrendingUp,
  Award,
  Filter,
  Layers
} from 'lucide-react';
import { UserProfile, Question, ExamTrack } from '../types';
import { HISTORICAL_EXAM_QUESTIONS } from '../data/examQuestions';

interface AdaptivePathViewProps {
  userProfile: UserProfile;
  onNavigate: (tab: string, extraState?: any) => void;
  onOpenTutor: (contextPrompt?: string, questionRef?: Question) => void;
  onSelectExamTrack?: (track: ExamTrack) => void;
}

export const AdaptivePathView: React.FC<AdaptivePathViewProps> = ({
  userProfile,
  onNavigate,
  onOpenTutor,
  onSelectExamTrack,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<ExamTrack>(
    userProfile.selectedExamTrack || 'prt'
  );

  useEffect(() => {
    if (userProfile.selectedExamTrack) {
      setSelectedTrack(userProfile.selectedExamTrack);
    }
  }, [userProfile.selectedExamTrack]);

  const currentStream: ExamTrack = userProfile.selectedExamTrack || selectedTrack;

  // Built adaptive modules strictly mapped to historical syllabus concepts and exam tracks
  const adaptiveModules = [
    // --- PRT Track Modules ---
    {
      id: 'mod-prt-theories',
      category: 'Child Development & Pedagogy (PRT)',
      title: 'Cognitive & Moral Development Theorists (Piaget, Kohlberg, Bandura)',
      examTracks: ['prt' as ExamTrack],
      priority: 'High Priority Remediation',
      mastery: 'Needs Attention (45%)',
      timeEstimate: '18 mins',
      diagnosticInsight:
        'Frequent confusion observed between Piaget\'s Stage II (Pre-operational) vs Stage III (Concrete Operational), and Kohlberg\'s Stage IV (Maintaining Social Order).',
      questions: HISTORICAL_EXAM_QUESTIONS.filter((q) =>
        q.examTracks?.includes('prt') && ['Piaget', 'Kohlberg', 'Bandura'].some((k) => q.tags.includes(k) || q.topic.includes(k))
      ),
      highYieldMnemonic:
        'Piaget Order: "Some People Can Fly" (Sensorimotor, Pre-operational, Concrete, Formal). Kohlberg Stage 4: "Duty to Law and Social Order".',
    },
    {
      id: 'mod-prt-evs',
      category: 'Environmental Studies (PRT)',
      title: 'Sikkim Biodiversity, Monasteries & Himalayan Geography',
      examTracks: ['prt' as ExamTrack],
      priority: 'Official High-Yield Area',
      mastery: 'Developing (58%)',
      timeEstimate: '15 mins',
      diagnosticInsight:
        'Questions testing Khangchendzonga biosphere boundaries, Pangolakha Sanctuary red panda habitat, Dokpas pastoral nomads, and South Lhonak GLOF flash-floods.',
      questions: HISTORICAL_EXAM_QUESTIONS.filter((q) =>
        q.examTracks?.includes('prt') && (q.category === 'EVS' || q.tags.includes('Sikkim EVS') || q.tags.includes('Dokpas'))
      ),
      highYieldMnemonic:
        'GLOF = Glacial Lake Outburst Flood (moraine dam rupture). Dokpas = High-altitude pastoralists of North/East Sikkim.',
    },
    {
      id: 'mod-prt-maths',
      category: 'Primary Mathematics (PRT)',
      title: 'Euler\'s Polyhedron Formula, Decimals & Perimeter Invariance',
      examTracks: ['prt' as ExamTrack],
      priority: 'Concept Intensive',
      mastery: 'Developing (62%)',
      timeEstimate: '15 mins',
      diagnosticInsight:
        'Euler\'s Polyhedron relation F + V - E = 2, perimeter change when corners are cut from rectangular sheets, and decimal places arithmetic.',
      questions: HISTORICAL_EXAM_QUESTIONS.filter((q) =>
        q.examTracks?.includes('prt') && q.category === 'Maths'
      ),
      highYieldMnemonic:
        'Euler Formula: Faces + Vertices - Edges = 2 (F + V = E + 2). Cutting a corner from a rectangle preserves or increases its perimeter!',
    },
    {
      id: 'mod-prt-nep-fln',
      category: 'Policy & Pedagogy (PRT)',
      title: 'NEP 2020 Foundational Stage, NIPUN Bharat & BICS vs CALP',
      examTracks: ['prt' as ExamTrack],
      priority: 'Core Regulatory Focus',
      mastery: 'Proficient (78%)',
      timeEstimate: '12 mins',
      diagnosticInsight:
        'NEP 2020 5+3+3+4 foundational milestone (age 3-8), play-based pedagogy, mother tongue instruction, and Jim Cummins\' language interdependence (BICS vs CALP).',
      questions: HISTORICAL_EXAM_QUESTIONS.filter((q) =>
        q.examTracks?.includes('prt') && (q.tags.includes('NEP 2020') || q.tags.includes('Pedagogy') || q.tags.includes('BICS'))
      ),
      highYieldMnemonic:
        'BICS: Basic Interpersonal Communicative Skills (playground fluency, 2 years). CALP: Cognitive Academic Language Proficiency (academic fluency, 5-7 years).',
    },

    // --- GT Maths & Science Modules ---
    {
      id: 'mod-gtms-stem-pedagogy',
      category: 'Secondary STEM Pedagogy',
      title: 'Constructivist Inquiry, GeoGebra & 5E Learning Cycle',
      examTracks: ['gt-maths-science' as ExamTrack],
      priority: 'High Yield Remediation',
      mastery: 'Developing (55%)',
      timeEstimate: '16 mins',
      diagnosticInsight:
        'Application of Jerome Bruner\'s enactive-iconic-symbolic representations in coordinate geometry and Bybee\'s 5E instructional framework.',
      questions: HISTORICAL_EXAM_QUESTIONS.filter((q) =>
        q.examTracks?.includes('gt-maths-science') && (q.category === 'CDP' || q.tags.includes('Pedagogy'))
      ),
      highYieldMnemonic:
        '5E Model: Engage -> Explore -> Explain -> Elaborate -> Evaluate. Bruner EIS: Enactive (physical action), Iconic (visual diagram), Symbolic (abstract formula).',
    },
    {
      id: 'mod-gtms-physics-chem',
      category: 'Graduate Science (STEM)',
      title: '125 kJ Work-Energy Theorem, Thin Lens Ray Optics & Thermodynamics',
      examTracks: ['gt-maths-science' as ExamTrack],
      priority: 'Numerical Intensive',
      mastery: 'Needs Attention (48%)',
      timeEstimate: '20 mins',
      diagnosticInsight:
        'Kinetic energy calculations with speed doubling, real vs virtual images with thin convex lens formula 1/f = 1/v - 1/u, and exothermic bond energies.',
      questions: HISTORICAL_EXAM_QUESTIONS.filter((q) =>
        q.examTracks?.includes('gt-maths-science') && q.category === 'MathsScience' && (q.topic.includes('Science') || q.tags.includes('Physics') || q.tags.includes('Optics'))
      ),
      highYieldMnemonic:
        'Work done = Change in Kinetic Energy = 1/2 m (v_f² - v_i²). Convex lens forms inverted real images when object is outside focal point F.',
    },
    {
      id: 'mod-gtms-maths-analytical',
      category: 'Graduate Mathematics',
      title: 'Perpendicular Lines (m₁m₂ = -1), Arithmetic Progressions & Mensuration',
      examTracks: ['gt-maths-science' as ExamTrack],
      priority: 'Formula Intensive',
      mastery: 'Proficient (74%)',
      timeEstimate: '18 mins',
      diagnosticInsight:
        'Slope product of perpendicular Cartesian lines, AP common differences, cylinder curved surface area 2πrh, and quadratic roots discriminant b² - 4ac.',
      questions: HISTORICAL_EXAM_QUESTIONS.filter((q) =>
        q.examTracks?.includes('gt-maths-science') && q.category === 'MathsScience' && (q.topic.includes('Math') || q.tags.includes('Coordinate Geometry') || q.tags.includes('AP/GP'))
      ),
      highYieldMnemonic:
        'Two non-vertical lines are perpendicular iff product of slopes m₁ * m₂ = -1. Cylinder CSA = 2πrh; Total Surface Area = 2πr(h + r).',
    },

    // --- GT Humanities Modules ---
    {
      id: 'mod-gthum-theories',
      category: 'Adolescent Development (Humanities)',
      title: 'Adolescent Cognition & Constructivism (Vygotsky ZPD, Kohlberg, Bandura)',
      examTracks: ['gt-humanities' as ExamTrack],
      priority: 'High Priority Remediation',
      mastery: 'Needs Attention (45%)',
      timeEstimate: '18 mins',
      diagnosticInsight:
        'Adolescent formal operational abstract reasoning, Vygotsky Zone of Proximal Development scaffolding, and Kohlberg post-conventional principles.',
      questions: HISTORICAL_EXAM_QUESTIONS.filter((q) =>
        q.examTracks?.includes('gt-humanities') && (q.category === 'CDP' || q.tags.includes('Vygotsky') || q.tags.includes('Kohlberg'))
      ),
      highYieldMnemonic:
        'ZPD = Distance between what learner can do unaided vs with More Knowledgeable Other (MKO). Scaffolding is temporary supportive assistance.',
    },
    {
      id: 'mod-gthum-polity-writs',
      category: 'Social Science: Indian Constitution',
      title: 'Fundamental Rights, Article 32 & 226 Writs, Gram Sabha Structures',
      examTracks: ['gt-humanities' as ExamTrack],
      priority: 'Critical Exam Focus',
      mastery: 'Developing (64%)',
      timeEstimate: '18 mins',
      diagnosticInsight:
        'Constitutional remedy writs (Habeas Corpus, Mandamus, Certiorari, Prohibition, Quo Warranto) and 73rd/74th Constitutional Amendment devolution of powers.',
      questions: HISTORICAL_EXAM_QUESTIONS.filter((q) =>
        q.examTracks?.includes('gt-humanities') && (q.tags.includes('Polity') || q.tags.includes('Constitutional Writs') || q.tags.includes('Civics'))
      ),
      highYieldMnemonic:
        'Article 32 = Supreme Court ("Heart and Soul of Constitution"); Article 226 = High Court jurisdiction. Habeas Corpus = "Produce the body".',
    },
    {
      id: 'mod-gthum-geo-math',
      category: 'Social Science: Geography',
      title: 'Longitudes & Local Time Math (15° = 1 Hour), Landforms & Atmosphere',
      examTracks: ['gt-humanities' as ExamTrack],
      priority: 'Calculation Intensive',
      mastery: 'Developing (60%)',
      timeEstimate: '14 mins',
      diagnosticInsight:
        'Time calculations based on Earth\'s rotation (360° in 24 hours -> 15° per hour / 1° in 4 mins), and tropospheric normal lapse rate (6.5°C per 1000m).',
      questions: HISTORICAL_EXAM_QUESTIONS.filter((q) =>
        q.examTracks?.includes('gt-humanities') && ['Geography', 'Time Zones', 'Isthmus', 'Atmosphere'].some((k) => q.tags.includes(k))
      ),
      highYieldMnemonic:
        'East of Greenwich = Add time (EGA: East Gain Add). West of Greenwich = Subtract time (WLS: West Lose Subtract). 1° longitude = 4 minutes.',
    },
    {
      id: 'mod-gthum-sikkim-heritage',
      category: 'Sikkim History & Culture (Humanities)',
      title: '1642 Yuksom Consecration, Dubdi Monastery & Namgyal Dynastic Rule',
      examTracks: ['gt-humanities' as ExamTrack],
      priority: 'Official Sikkim Focus',
      mastery: 'Proficient (82%)',
      timeEstimate: '16 mins',
      diagnosticInsight:
        'Key historical milestones: 1642 Norbugang throne consecration of Phuntsog Namgyal by the three revered lamas, and the 1701 Dubdi Monastery heritage.',
      questions: HISTORICAL_EXAM_QUESTIONS.filter((q) =>
        q.examTracks?.includes('gt-humanities') && (q.tags.includes('Sikkim History') || q.tags.includes('Dubdi Monastery'))
      ),
      highYieldMnemonic:
        'Yuksom 1642 = Birthplace of the Namgyal Monarchy. Dubdi Monastery (1701) = Oldest standing Buddhist monastery in Sikkim.',
    },
  ];

  const filteredModules = adaptiveModules.filter(
    (mod) => mod.examTracks.includes(currentStream)
  );

  return (
    <div className="space-y-6 pb-12" id="adaptive-learning-path-container">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit']">
              Personalized Adaptive Learning Paths
            </h2>
            <p className="text-xs text-slate-500">
              Continuously calibrated modules targeting conceptual gaps and diagnostic test errors for your selected exam stream.
            </p>
          </div>
        </div>

        {/* Stream Selector Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Active Stream:
          </span>
          {[
            { id: 'prt', label: 'Primary Teacher (PRT - Paper I)' },
            { id: 'gt-maths-science', label: 'GT - Maths & Science (Paper II)' },
            { id: 'gt-humanities', label: 'GT - Humanities (Paper II)' },
          ].map((trk) => {
            const isSelected = currentStream === trk.id;
            return (
              <button
                key={trk.id}
                onClick={() => {
                  setSelectedTrack(trk.id as ExamTrack);
                  if (onSelectExamTrack) {
                    onSelectExamTrack(trk.id as ExamTrack);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{trk.label}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>}
              </button>
            );
          })}
        </div>

        {/* Active Stream Indicator */}
        <div className="flex items-center justify-between text-xs text-indigo-950 bg-indigo-50/70 border border-indigo-100 px-3 py-2 rounded-xl">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span>
              Modules filtered for: <strong className="font-bold">{
                currentStream === 'prt' ? 'Primary Teacher (PRT - Paper I)' :
                currentStream === 'gt-maths-science' ? 'Graduate Teacher Maths & Science (Paper II)' :
                'Graduate Teacher Humanities (Paper II)'
              }</strong>
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {filteredModules.length} Adaptive Modules
          </span>
        </div>
      </div>

      {/* Adaptive Modules Grid */}
      <div className="space-y-5">
        {filteredModules.map((mod, idx) => (
          <div
            key={mod.id}
            className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs p-6 space-y-4 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  #{idx + 1}
                </span>
                <div>
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide">
                    {mod.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-['Outfit']">
                    {mod.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {mod.priority}
                </span>
                <span className="text-xs text-slate-500 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" /> {mod.timeEstimate}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Diagnostic Misconception Insight</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {mod.diagnosticInsight}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100/70 space-y-1">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-900">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>High-Yield Exam Mnemonic &amp; Rule</span>
                </div>
                <p className="text-xs text-indigo-900 font-medium">
                  {mod.highYieldMnemonic}
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100">
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{mod.questions.length} Questions</span>
                <span>in practice pool for this topic</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenTutor(`Please explain the concepts, theoretical traps, and past exam questions for "${mod.title}" in STET.`)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Tutor Explanation</span>
                </button>
                <button
                  onClick={() => onNavigate('practice', { topicFilter: mod.title })}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <span>Practice Questions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
