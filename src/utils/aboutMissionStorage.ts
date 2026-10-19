/**
 * Storage and synchronization utilities for Vision, Mission, About App & Team With A Mission
 */

export interface TeamMember {
  id: string;
  name: string;
  honorific?: string;
  role: string;
  badge?: string;
  bio: string;
  avatarUrl?: string;
  focusArea?: string;
  email?: string;
  linkedInUrl?: string;
  order: number;
}

export interface AboutMissionContent {
  // Vision Section
  visionTitle: string;
  visionSubtitle: string;
  visionStatement: string;
  visionPillars: {
    title: string;
    description: string;
  }[];
  visionQuote: string;
  visionAuthor: string;

  // Mission Section
  missionTitle: string;
  missionSubtitle: string;
  missionStatement: string;
  missionObjectives: {
    title: string;
    description: string;
  }[];

  // About This App Section
  aboutTitle: string;
  aboutSubtitle: string;
  aboutStory: string;
  aboutFeatures: {
    title: string;
    description: string;
  }[];
  keyMetrics: {
    label: string;
    value: string;
    sublabel: string;
  }[];
  coreValues: {
    title: string;
    description: string;
  }[];

  // The Team With A Mission
  teamSectionTitle: string;
  teamSectionSubtitle: string;
  teamSectionIntro: string;
  teamMembers: TeamMember[];

  lastUpdated: number;
  updatedBy?: string;
}

export const DEFAULT_ABOUT_MISSION_CONTENT: AboutMissionContent = {
  visionTitle: 'Our Vision: Transforming Himalayan Teacher Preparation',
  visionSubtitle: 'Equitable, Psychometrically Rigorous & Inspiring Teacher Education for Sikkim',
  visionStatement:
    'To build the premier pedagogical assessment and learning ecosystem for Sikkim and Eastern Himalayan educators. We envision a future where every aspiring teacher—regardless of remote altitude, district, or background—possesses world-class pedagogical confidence, NEP 2020 constructivist mastery, and the highest standard of academic excellence.',
  visionPillars: [
    {
      title: 'Pedagogical Rigor & NEP 2020',
      description: 'Moving beyond rote memorization into competency-based learning, Bloom’s higher cognitive levels, and child-centric pedagogical intuition.',
    },
    {
      title: 'Himalayan Regional Context',
      description: 'Honoring and embedding indigenous flora, regional ecological heritage, and localized classroom scenarios unique to Sikkim and the Eastern Himalayas.',
    },
    {
      title: 'Universal Access & Equity',
      description: 'Providing democratized, affordable, mobile-first preparation that works seamlessly even in intermittent connectivity across all districts.',
    },
    {
      title: 'Continuous Teacher Empowerment',
      description: 'Supporting educators not merely to clear an exam, but to flourish as transformative leaders, ethical mentors, and nation builders in our schools.',
    },
  ],
  visionQuote:
    '“A teacher who ignites curiosity, nurtures emotional resilience, and understands child development can illuminate an entire valley for generations.”',
  visionAuthor: 'studeezone Academic Governance Council',

  missionTitle: 'Our Mission: Empowering Every Aspiring STET Educator',
  missionSubtitle: 'Purpose-Driven Curriculum Mapping, Accurate Assessment & Personalized Mentorship',
  missionStatement:
    'Our mission is to equip every Sikkim Teacher Eligibility Test (STET) candidate with syllabus-calibrated item banks, authentic timed mock simulations, and real-time cognitive analytics that pinpoint growth opportunities and ensure confident first-attempt qualifying performance.',
  missionObjectives: [
    {
      title: '1,000+ Calibrated Questions Per Stream',
      description: 'Every question is peer-vetted by qualified doctoral scholars, DIET teacher educators, and subject specialists with comprehensive step-by-step explanations.',
    },
    {
      title: 'Mirroring the Real Examination Environment',
      description: 'Offering exact timed full-length simulations with NCTE & SCERT Sikkim blueprint fidelity to eradicate exam-day anxiety.',
    },
    {
      title: 'Adaptive Diagnostic Feedback',
      description: 'Providing candidates with granular topic-level accuracy metrics, time-spent telemetry, and personalized recommendations to overcome conceptual gaps.',
    },
    {
      title: 'Democratizing Academic Mentorship',
      description: 'Combining human council oversight with round-the-clock interactive pedagogical mentoring (Ask Lama) for immediate doubt resolution.',
    },
  ],

  aboutTitle: 'About studeezone: The Sikkim STET Preparation Platform',
  aboutSubtitle: 'Built by Educators, Driven by Psychometrics, Dedicated to Sikkim’s Future Teachers',
  aboutStory:
    'studeezone was founded with a singular conviction: teachers are the bedrock of society, and the evaluation methods used to certify them should be clear, scientific, and accessible. In Sikkim, teacher candidates across Soreng, Gyalshing, Mangan, Pakyong, Gangtok, and Namchi previously faced a scarcity of regionalized study materials and accurate test series.\n\nstudeezone bridges this gap by marrying modern cognitive psychometrics with deep curricular localization. From Sikkim’s unique EVS biodiversity and Yuksom heritage to Child Development and modern pedagogical grammar, our platform provides candidates with an authentic, empowering testing ground.',
  aboutFeatures: [
    {
      title: 'Psychometrically Calibrated Distractors',
      description: 'Every MCQ option is engineered to test conceptual depth rather than superficial trivia, eliminating guesswork.',
    },
    {
      title: 'Cross-Device & Offline-Resilient',
      description: 'Fully responsive on mobile phones, tablets, and desktops with minimal data overhead for seamless study anywhere.',
    },
    {
      title: 'State & National Syllabus Harmonization',
      description: 'Built strictly according to NCTE guidelines, NEP 2020 frameworks, and the Sikkim SCERT curriculum standards.',
    },
    {
      title: 'Transparent & Accessible Pricing',
      description: 'Committed to affordable, student-friendly stream access (₹499/stream pass) with transparent free tiers for every aspirant.',
    },
  ],
  keyMetrics: [
    {
      label: '3,000+',
      value: '3,000+',
      sublabel: 'Vetted Question Items',
    },
    {
      label: '6 Districts',
      value: 'All 6 Districts',
      sublabel: 'Covered Across Sikkim',
    },
    {
      label: '88%+',
      value: '88%+',
      sublabel: 'Target Qualification Rate',
    },
    {
      label: '24/7',
      value: '24/7',
      sublabel: 'Pedagogical Mentorship',
    },
  ],
  coreValues: [
    {
      title: 'Academic Integrity',
      description: 'Zero tolerance for ambiguous keys or unverified facts. Every explanation is grounded in recognized pedagogical research.',
    },
    {
      title: 'Candidate Empathy',
      description: 'We treat every aspirant’s time, aspirations, and financial constraints with deep respect and care.',
    },
    {
      title: 'Cultural Respect',
      description: 'Deep pride in the Eastern Himalayan heritage, linguistic pluralism, and environmental ethos of Sikkim.',
    },
    {
      title: 'Continuous Innovation',
      description: 'Constantly upgrading our assessment telemetry, user experience, and interactive tools based on direct candidate feedback.',
    },
  ],

  teamSectionTitle: 'The Team with a Mission',
  teamSectionSubtitle: 'Meet the Founders, Educators & Academic Stewards behind studeezone',
  teamSectionIntro:
    'Our interdisciplinary team brings together senior teacher educators, doctoral researchers in educational psychology, psychometricians, and software engineers unified by a shared pledge: uplifting Sikkim’s teaching fraternity.',
  teamMembers: [],

  lastUpdated: Date.now(),
  updatedBy: 'studeezone Editorial Board',
};

export const ABOUT_MISSION_STORAGE_KEY = 'studeezone_about_mission_content_v2';

/**
 * Fetch about & mission content from local storage with fallback to default
 */
export function getAboutMissionContent(): AboutMissionContent {
  if (typeof window === 'undefined') return DEFAULT_ABOUT_MISSION_CONTENT;

  try {
    const raw = localStorage.getItem(ABOUT_MISSION_STORAGE_KEY) || localStorage.getItem('studeezone_about_mission_content_v1');
    if (!raw) {
      saveAboutMissionContent(DEFAULT_ABOUT_MISSION_CONTENT, false);
      return DEFAULT_ABOUT_MISSION_CONTENT;
    }
    const parsed = JSON.parse(raw);
    // Ensure all default/dummy sample team entries are removed
    const cleanedTeamMembers = Array.isArray(parsed.teamMembers)
      ? parsed.teamMembers.filter((m: any) => m && m.id && !m.id.startsWith('team-'))
      : [];

    return {
      ...DEFAULT_ABOUT_MISSION_CONTENT,
      ...parsed,
      visionPillars: parsed.visionPillars || DEFAULT_ABOUT_MISSION_CONTENT.visionPillars,
      missionObjectives: parsed.missionObjectives || DEFAULT_ABOUT_MISSION_CONTENT.missionObjectives,
      aboutFeatures: parsed.aboutFeatures || DEFAULT_ABOUT_MISSION_CONTENT.aboutFeatures,
      keyMetrics: parsed.keyMetrics || DEFAULT_ABOUT_MISSION_CONTENT.keyMetrics,
      coreValues: parsed.coreValues || DEFAULT_ABOUT_MISSION_CONTENT.coreValues,
      teamMembers: cleanedTeamMembers,
    };
  } catch (err) {
    console.error('Error loading about & mission content:', err);
    return DEFAULT_ABOUT_MISSION_CONTENT;
  }
}

/**
 * Save about & mission content to localStorage, broadcast event, and sync to server
 */
export function saveAboutMissionContent(content: AboutMissionContent, syncWithServer = true): void {
  if (typeof window === 'undefined') return;

  const contentToSave: AboutMissionContent = {
    ...content,
    lastUpdated: Date.now(),
  };

  try {
    localStorage.setItem(ABOUT_MISSION_STORAGE_KEY, JSON.stringify(contentToSave));
    window.dispatchEvent(
      new CustomEvent('studeezone_about_mission_updated', { detail: contentToSave })
    );

    if (syncWithServer) {
      fetch('/api/about-mission', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentToSave),
      }).catch((e) => console.warn('Background sync failed for about-mission:', e));
    }
  } catch (err) {
    console.error('Error saving about & mission content:', err);
  }
}

/**
 * Reset content back to system default
 */
export function resetAboutMissionContent(): AboutMissionContent {
  saveAboutMissionContent(DEFAULT_ABOUT_MISSION_CONTENT, true);
  return DEFAULT_ABOUT_MISSION_CONTENT;
}

/**
 * Trigger bidirectional sync with /api/about-mission on load
 */
export function initAboutMissionSync(): void {
  if (typeof window === 'undefined') return;

  fetch('/api/about-mission')
    .then((res) => {
      if (!res.ok) throw new Error('Network response not ok');
      return res.json();
    })
    .then((data) => {
      if (data && data.content && data.content.lastUpdated) {
        const local = getAboutMissionContent();
        if (data.content.lastUpdated > (local.lastUpdated || 0)) {
          saveAboutMissionContent(data.content, false);
        }
      }
    })
    .catch(() => {
      // Offline or network error - use local cache
    });
}
