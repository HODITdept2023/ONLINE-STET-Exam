import { AdvisoryMember, ContributorCategory, SuggestedRoleTitle, CouncilSettings, FellowshipApplication, FellowshipStatus } from '../types';

export const ADVISORY_MEMBERS_STORAGE_KEY = 'studeezone_advisory_members_v2';
export const COUNCIL_SETTINGS_STORAGE_KEY = 'studeezone_council_settings_v2';
export const FELLOWSHIP_APPLICATIONS_STORAGE_KEY = 'studeezone_fellowship_applications_v2';

/**
 * High-Sounding Prestigious Role Titles & Archetypes
 * Curated for academic rigor, pedagogical authority, and distinguished council resonance.
 */
export const SUGGESTED_HIGH_SOUNDING_TITLES: SuggestedRoleTitle[] = [
  // 1. Executive & Academic Leadership
  {
    title: 'Honorary Academic Council Chairperson',
    category: 'academic-council',
    description: 'Denotes supreme intellectual stewardship and oversight over syllabus harmonization and exam integrity.',
    recommendedBadge: 'Council Chairperson',
    resonanceTier: 'Executive Leadership',
  },
  {
    title: 'Distinguished Advisory Board Member',
    category: 'advisory-board',
    description: 'An eminent educator or institutional authority providing profound pedagogical oversight, academic standards, and governance to the council.',
    recommendedBadge: 'Distinguished Board Member',
    resonanceTier: 'Executive Leadership',
  },
  {
    title: 'Senior Advisory Board Member',
    category: 'advisory-board',
    description: 'A distinguished institutional advisor offering strategic direction and pedagogical governance.',
    recommendedBadge: 'Board Member',
    resonanceTier: 'Executive Leadership',
  },
  {
    title: 'Distinguished Emeritus Advisor',
    category: 'advisory-board',
    description: 'A veteran educationist whose lifelong scholarship anchors the platform’s foundational standards.',
    recommendedBadge: 'Emeritus Advisor',
    resonanceTier: 'Executive Leadership',
  },
  {
    title: 'Chief Pedagogical Strategist',
    category: 'pedagogical-fellows',
    description: 'Leads cognitive learning theories, Bloom’s taxonomy mapping, and active retention methodologies.',
    recommendedBadge: 'Chief Strategist',
    resonanceTier: 'Executive Leadership',
  },

  // 2. Authorship & Curricular Architecture
  {
    title: 'Distinguished Contributing Author',
    category: 'contributing-authors',
    description: 'Authored high-yield question items, exam pattern blueprints, and chapter-wise conceptual masterworks.',
    recommendedBadge: 'Contributing Author',
    resonanceTier: 'Curricular Master',
  },
  {
    title: 'Principal Curriculum Architect',
    category: 'academic-council',
    description: 'Designs syllabus coverage across Primary (PRT) and Graduate Teacher (GT) subject domains.',
    recommendedBadge: 'Curriculum Architect',
    resonanceTier: 'Curricular Master',
  },
  {
    title: 'Lead Pedagogical Author & Scholar',
    category: 'contributing-authors',
    description: 'Author of definitive explanations, pedagogical case studies, and assertion-reason diagnostic suites.',
    recommendedBadge: 'Lead Scholar',
    resonanceTier: 'Distinguished Scholarly',
  },
  {
    title: 'Syllabus Harmonization Luminary',
    category: 'academic-council',
    description: 'Aligns regional Sikkim educational requisites with national NCTE & NEP 2020 pedagogical benchmarks.',
    recommendedBadge: 'Curriculum Luminary',
    resonanceTier: 'Curricular Master',
  },

  // 3. Assessment, Psychometrics & Item Vetting
  {
    title: 'Master Item Reviewer & Question Vetting Specialist',
    category: 'editorial-reviewers',
    description: 'Ensures zero ambiguity in question stems, verifies distractor plausibility, and validates official answer keys.',
    recommendedBadge: 'Lead Reviewer',
    resonanceTier: 'Psychometric Rigor',
  },
  {
    title: 'Psychometric Assessment Fellow',
    category: 'pedagogical-fellows',
    description: 'Applies Item Response Theory (IRT) and difficulty calibration to mock papers and diagnostic tests.',
    recommendedBadge: 'Assessment Fellow',
    resonanceTier: 'Psychometric Rigor',
  },
  {
    title: 'Empirical Item Difficulty Auditor',
    category: 'editorial-reviewers',
    description: 'Audits student discrimination indices and discriminatory coefficients on mock examination items.',
    recommendedBadge: 'Item Auditor',
    resonanceTier: 'Psychometric Rigor',
  },
  {
    title: 'Standard-Setting & Moderation Fellow',
    category: 'editorial-reviewers',
    description: 'Calibrates cut-off scores, Angoff threshold determinations, and candidate readiness percentiles.',
    recommendedBadge: 'Moderation Fellow',
    resonanceTier: 'Psychometric Rigor',
  },

  // 4. Regional Heritage & Specialized Domains
  {
    title: 'Sikkim Educational Heritage & Regional Pedagogy Chair',
    category: 'advisory-board',
    description: 'Preserves Eastern Himalayan pedagogical contexts, local ecology, flora, fauna, and state constitutional provisions.',
    recommendedBadge: 'Regional Chair',
    resonanceTier: 'Distinguished Scholarly',
  },
  {
    title: 'Child Development & Cognitive Science Fellow',
    category: 'pedagogical-fellows',
    description: 'Expert on Piaget, Vygotsky, Kohlberg stages, inclusive education, and neurodevelopmental pedagogy.',
    recommendedBadge: 'Cognitive Fellow',
    resonanceTier: 'Distinguished Scholarly',
  },
  {
    title: 'Foundational Literacy & Numeracy (FLN) Consultant',
    category: 'contributing-authors',
    description: 'Focuses on NIPUN Bharat goals, mathematical problem-solving heuristics, and early language acquisition.',
    recommendedBadge: 'FLN Specialist',
    resonanceTier: 'Curricular Master',
  },
  {
    title: 'Senior Editorial Board Advisor',
    category: 'editorial-reviewers',
    description: 'Senior peer-reviewer ensuring clarity, grammatical precision, and linguistic consistency across all mock papers.',
    recommendedBadge: 'Senior Editor',
    resonanceTier: 'Distinguished Scholarly',
  },
];

/**
 * Initial distinguished council seed data - Includes verified inducted scholars
 */
export const SEED_ADVISORY_MEMBERS: AdvisoryMember[] = [
  {
    id: 'adv-pemba-sharma',
    name: 'Pemba Tshering Sharma',
    honorific: 'Dr.',
    roleTitle: 'Distinguished Contributing Author',
    category: 'contributing-authors',
    affiliation: 'Government College Rhenock, Sikkim',
    credentials: 'Ph.D. in Himalayan History & Constitutional Law, 11+ years experience',
    bio: 'Specializes in authentic Sikkim state chronicles, Yuksom heritage, and Paper II Social Science curriculum. Inducted into Council.',
    contributions: [
      'Sikkim Curricular Localization & Vernacular Context',
      'High-Yield Revision Notes Formulation',
      'Constitutional Writs & State History Question Vetting'
    ],
    badge: 'Inducted Fellow',
    email: 'pemba.sharma.history@sikkim.ac.in',
    featured: true,
    active: true,
    order: 1,
    createdAt: Date.now() - 86400000 * 5,
  }
];

let isSyncingAdvisoryFromServer = false;

/**
 * Trigger asynchronous sync with backend /api/advisory-members
 */
export function syncAdvisoryWithServer(): void {
  if (typeof window === 'undefined' || isSyncingAdvisoryFromServer) return;
  isSyncingAdvisoryFromServer = true;

  fetch('/api/advisory-members')
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data && Array.isArray(data.members) && data.members.length > 0) {
        const local = getAdvisoryMembers();
        const mergedMap = new Map<string, AdvisoryMember>();

        // Place server members
        data.members.forEach((m: AdvisoryMember) => {
          if (m && m.id) mergedMap.set(m.id, m);
        });

        // Retain any locally created ones that might not be on server yet
        local.forEach((m) => {
          if (!mergedMap.has(m.id)) {
            mergedMap.set(m.id, m);
          }
        });

        const merged = Array.from(mergedMap.values()).sort((a, b) => a.order - b.order);
        try {
          localStorage.setItem(ADVISORY_MEMBERS_STORAGE_KEY, JSON.stringify(merged));
          window.dispatchEvent(new CustomEvent('studeezone_advisory_updated', { detail: merged }));
        } catch {
          // Ignore localStorage errors
        }
      }
    })
    .catch(() => {
      // Offline or network hiccup; local cache remains authoritative
    })
    .finally(() => {
      isSyncingAdvisoryFromServer = false;
    });
}

/**
 * Retrieve all advisory board members from storage
 */
export function getAdvisoryMembers(): AdvisoryMember[] {
  try {
    const raw = localStorage.getItem(ADVISORY_MEMBERS_STORAGE_KEY);
    if (!raw) {
      // First check if any fellowship application has status 'inducted' or 'approved'
      const apps = getFellowshipApplications();
      const inductedApps = apps.filter((a) => a.status === 'inducted' || a.status === 'approved');
      
      let initialMembers = [...SEED_ADVISORY_MEMBERS];
      inductedApps.forEach((app) => {
        if (!initialMembers.some((m) => m.email === app.email || m.name === app.name)) {
          initialMembers.push({
            id: `adv-${app.id}`,
            name: app.name,
            honorific: app.honorific || undefined,
            roleTitle: app.adminAssignedRoleTitle || app.preferredPosition || 'Distinguished Contributing Author',
            category: app.adminAssignedCategory || app.preferredCategory || 'contributing-authors',
            affiliation: app.affiliation,
            credentials: `${app.highestQualification} in ${app.specializationDomain}, ${app.experienceYears}+ years experience`,
            bio: app.statementOfPedagogy || `${app.honorific || ''} ${app.name} specializes in ${app.specializationDomain} and contributes to Sikkim STET syllabus development.`,
            contributions: app.contributions && app.contributions.length > 0 ? app.contributions : ['Curriculum & Item Development'],
            badge: 'Inducted Fellow',
            email: app.email,
            featured: false,
            active: true,
            order: initialMembers.length + 1,
            createdAt: Date.now(),
          });
        }
      });

      saveAdvisoryMembers(initialMembers);
      syncAdvisoryWithServer();
      return initialMembers.sort((a, b) => a.order - b.order);
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveAdvisoryMembers(SEED_ADVISORY_MEMBERS);
      syncAdvisoryWithServer();
      return SEED_ADVISORY_MEMBERS;
    }

    // Trigger non-blocking server sync
    syncAdvisoryWithServer();
    return parsed.sort((a, b) => a.order - b.order);
  } catch (err) {
    console.error('Error loading advisory members from localStorage:', err);
    return SEED_ADVISORY_MEMBERS;
  }
}

/**
 * Save advisory board members to storage and sync with server
 */
export function saveAdvisoryMembers(members: AdvisoryMember[]): void {
  try {
    localStorage.setItem(ADVISORY_MEMBERS_STORAGE_KEY, JSON.stringify(members));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studeezone_advisory_updated', { detail: members }));
    }

    // Non-blocking sync to server
    fetch('/api/advisory-members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ members }),
    }).catch(() => {});
  } catch (err) {
    console.error('Error saving advisory members to localStorage:', err);
  }
}

/**
 * Helper to determine if a user is an inducted Academic Council / Advisory Board member or admin
 */
export function isUserCouncilMember(userProfile?: { email?: string; role?: string; name?: string } | null): boolean {
  if (!userProfile) return false;
  // Admin is always council-authorized
  if (userProfile.role === 'admin') return true;
  if (
    userProfile.email &&
    (userProfile.email.toLowerCase().includes('admin') ||
      userProfile.email.toLowerCase() === 'studeezoneapp@gmail.com' ||
      userProfile.email.toLowerCase() === 'vsfintech@gmail.com')
  ) {
    return true;
  }
  
  if (!userProfile.email && !userProfile.name) return false;
  const userEmail = (userProfile.email || '').toLowerCase().trim();
  const userName = (userProfile.name || '').toLowerCase().trim();

  // 1. Check if present in Advisory Board members
  const members = getAdvisoryMembers();
  const matchedMember = members.find((m) => {
    const memberEmail = (m.email || '').toLowerCase().trim();
    const memberName = (m.name || '').toLowerCase().trim();
    return (userEmail && memberEmail === userEmail) || (userName && memberName === userName);
  });
  if (matchedMember) return true;

  // 2. Check if user has an approved or inducted Fellowship application
  const apps = getFellowshipApplications();
  const matchedApp = apps.find((a) => {
    const appEmail = (a.email || '').toLowerCase().trim();
    const appName = (a.name || '').toLowerCase().trim();
    const isInducted = a.status === 'inducted' || a.status === 'approved';
    return isInducted && ((userEmail && appEmail === userEmail) || (userName && appName === userName));
  });
  if (matchedApp) return true;

  return false;
}

/**
 * Add a new member to the advisory board
 */
export function addAdvisoryMember(
  data: Omit<AdvisoryMember, 'id' | 'createdAt'>
): AdvisoryMember {
  const current = getAdvisoryMembers();
  const newMember: AdvisoryMember = {
    ...data,
    id: `adv-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: Date.now(),
    order: data.order ?? current.length + 1,
    active: data.active ?? true,
    featured: data.featured ?? false,
  };

  const updated = [...current, newMember];
  saveAdvisoryMembers(updated);
  return newMember;
}

/**
 * Update an existing advisory board member
 */
export function updateAdvisoryMember(
  id: string,
  updates: Partial<AdvisoryMember>
): AdvisoryMember | null {
  const current = getAdvisoryMembers();
  const index = current.findIndex((m) => m.id === id);
  if (index === -1) return null;

  const updatedMember: AdvisoryMember = {
    ...current[index],
    ...updates,
    updatedAt: Date.now(),
  };

  current[index] = updatedMember;
  saveAdvisoryMembers(current);
  return updatedMember;
}

/**
 * Delete an advisory member
 */
export function deleteAdvisoryMember(id: string): boolean {
  const current = getAdvisoryMembers();
  const filtered = current.filter((m) => m.id !== id);
  if (filtered.length === current.length) return false;
  saveAdvisoryMembers(filtered);
  return true;
}

/**
 * Reset advisory members back to initial seed data
 */
export function resetAdvisoryMembers(): AdvisoryMember[] {
  saveAdvisoryMembers(SEED_ADVISORY_MEMBERS);
  return SEED_ADVISORY_MEMBERS;
}

/**
 * Human-friendly category labels
 */
export function getCategoryLabel(category: ContributorCategory): string {
  switch (category) {
    case 'advisory-board':
      return 'Advisory Board';
    case 'contributing-authors':
      return 'Contributing Authors';
    case 'academic-council':
      return 'Academic Council';
    case 'pedagogical-fellows':
      return 'Pedagogical Fellows';
    case 'editorial-reviewers':
      return 'Editorial & Vetting Reviewers';
    default:
      return 'Academic Council';
  }
}

/**
 * Council Settings: Manage visibility of Council Members Section
 */
export const DEFAULT_COUNCIL_SETTINGS: CouncilSettings = {
  showCouncilMembersSection: true,
  allowPublicToggle: true,
};

export function getCouncilSettings(): CouncilSettings {
  try {
    const raw = localStorage.getItem(COUNCIL_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_COUNCIL_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return {
      showCouncilMembersSection: parsed.showCouncilMembersSection ?? true,
      allowPublicToggle: parsed.allowPublicToggle ?? true,
    };
  } catch (err) {
    console.error('Error reading council settings:', err);
    return DEFAULT_COUNCIL_SETTINGS;
  }
}

export function saveCouncilSettings(settings: Partial<CouncilSettings>): CouncilSettings {
  const current = getCouncilSettings();
  const updated: CouncilSettings = {
    ...current,
    ...settings,
  };
  try {
    localStorage.setItem(COUNCIL_SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studeezone_council_settings_updated', { detail: updated }));
    }

    fetch('/api/advisory/council-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: updated }),
    }).catch(() => {});
  } catch (err) {
    console.error('Error saving council settings:', err);
  }
  return updated;
}

export function toggleCouncilMembersSection(): boolean {
  const current = getCouncilSettings();
  const newVisibility = !current.showCouncilMembersSection;
  saveCouncilSettings({ showCouncilMembersSection: newVisibility });
  return newVisibility;
}

export const INITIAL_FELLOWSHIP_APPLICATIONS: FellowshipApplication[] = [];

/**
 * Check if an application is one of the old dummy/placeholder items
 */
export function isDummyFellowshipApp(app: any): boolean {
  if (!app) return true;
  if (app.id === 'app-seed-001' || app.id === 'app-seed-002' || app.id === 'app-seed-003') return true;
  if (typeof app.id === 'string' && app.id.startsWith('app-seed-')) return true;
  if (app.name === 'Tenzing Norbu Lepcha' || app.name === 'Karma Lhamo Bhutia') return true;
  return false;
}

let isSyncingFellowshipFromServer = false;

/**
 * Trigger bidirectional synchronization with /api/fellowship-applications
 */
export function syncFellowshipWithServer(): void {
  if (typeof window === 'undefined' || isSyncingFellowshipFromServer) return;
  isSyncingFellowshipFromServer = true;

  fetch('/api/fellowship-applications')
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data && Array.isArray(data.applications)) {
        const cleanServerApps = data.applications.filter((a: any) => !isDummyFellowshipApp(a));
        const rawLocal = localStorage.getItem(FELLOWSHIP_APPLICATIONS_STORAGE_KEY);
        let localApps: FellowshipApplication[] = [];
        if (rawLocal) {
          try {
            const parsed = JSON.parse(rawLocal);
            if (Array.isArray(parsed)) {
              localApps = parsed.filter((a) => !isDummyFellowshipApp(a));
            }
          } catch {}
        }

        const map = new Map<string, FellowshipApplication>();
        // Add server applications first
        cleanServerApps.forEach((a: FellowshipApplication) => {
          if (a && a.id) map.set(a.id, a);
        });
        // Add local applications that might not be on server yet
        localApps.forEach((a) => {
          if (a && a.id && !map.has(a.id)) {
            map.set(a.id, a);
          }
        });

        const merged = Array.from(map.values()).sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
        try {
          localStorage.setItem(FELLOWSHIP_APPLICATIONS_STORAGE_KEY, JSON.stringify(merged));
          window.dispatchEvent(new CustomEvent('studeezone_fellowship_applications_updated', { detail: merged }));
        } catch {}
      }
    })
    .catch(() => {})
    .finally(() => {
      isSyncingFellowshipFromServer = false;
    });
}

/**
 * Fellowship Applications: Manage Express Interest to Academic Board submissions
 */
export function getFellowshipApplications(): FellowshipApplication[] {
  try {
    const raw = localStorage.getItem(FELLOWSHIP_APPLICATIONS_STORAGE_KEY);
    let apps: FellowshipApplication[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          apps = parsed.filter((a) => !isDummyFellowshipApp(a));
        }
      } catch {}
    }
    // Also trigger server sync in background
    syncFellowshipWithServer();
    return apps.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
  } catch (err) {
    console.error('Error reading fellowship applications:', err);
    return [];
  }
}

export function saveFellowshipApplications(apps: FellowshipApplication[]): void {
  try {
    const cleanApps = apps.filter((a) => !isDummyFellowshipApp(a));
    localStorage.setItem(FELLOWSHIP_APPLICATIONS_STORAGE_KEY, JSON.stringify(cleanApps));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studeezone_fellowship_applications_updated', { detail: cleanApps }));
    }

    // Non-blocking sync to server
    fetch('/api/fellowship-applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applications: cleanApps }),
    }).catch(() => {});
  } catch (err) {
    console.error('Error saving fellowship applications:', err);
  }
}

export function submitFellowshipApplication(
  data: Omit<FellowshipApplication, 'id' | 'referenceNumber' | 'status' | 'submittedAt'>
): FellowshipApplication {
  const current = getFellowshipApplications();
  const now = Date.now();
  const refNum = `SZ-AC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const application: FellowshipApplication = {
    ...data,
    id: `app-${now}-${Math.random().toString(36).substring(2, 7)}`,
    referenceNumber: refNum,
    status: 'submitted',
    submittedAt: now,
  };

  const updated = [application, ...current.filter((a) => !isDummyFellowshipApp(a))];
  saveFellowshipApplications(updated);

  // Directly push to server endpoint
  fetch('/api/fellowship-applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ application, applications: updated }),
  }).catch(() => {});

  return application;
}

export function updateFellowshipApplicationStatus(
  id: string,
  status: FellowshipStatus,
  adminNotes?: string,
  adminAssignedRoleTitle?: string,
  adminAssignedCategory?: ContributorCategory
): FellowshipApplication | null {
  const current = getFellowshipApplications();
  const index = current.findIndex((a) => a.id === id);
  if (index === -1) return null;

  const app = current[index];
  const decidedRole = adminAssignedRoleTitle || app.adminAssignedRoleTitle || app.preferredPosition || 'Distinguished Contributing Author';
  const decidedCat = adminAssignedCategory || app.adminAssignedCategory || app.preferredCategory || 'contributing-authors';

  // If approved or inducted, automatically create/activate the AdvisoryMember so they are immediately displayed
  if (status === 'approved' || status === 'inducted') {
    const result = inductFellowshipApplicant(id, decidedRole, decidedCat, 'Inducted Fellow', adminNotes || 'Approved by Academic Council');
    return result ? result.application : null;
  }

  const updated: FellowshipApplication = {
    ...app,
    status,
    adminNotes: adminNotes !== undefined ? adminNotes : app.adminNotes,
    adminAssignedRoleTitle: adminAssignedRoleTitle || app.adminAssignedRoleTitle,
    adminAssignedCategory: adminAssignedCategory || app.adminAssignedCategory,
    reviewedAt: Date.now(),
  };

  current[index] = updated;
  saveFellowshipApplications(current);

  fetch(`/api/fellowship-applications/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  }).catch(() => {});

  return updated;
}

/**
 * Induct an applicant directly into the active Academic Advisory Board
 */
export function inductFellowshipApplicant(
  applicationId: string,
  roleTitle: string,
  category: ContributorCategory,
  badge?: string,
  adminNotes?: string
): { application: FellowshipApplication; member: AdvisoryMember } | null {
  const currentApps = getFellowshipApplications();
  const appIndex = currentApps.findIndex((a) => a.id === applicationId);
  if (appIndex === -1) return null;

  const app = currentApps[appIndex];
  const decidedRole = roleTitle || app.preferredPosition || 'Distinguished Contributing Author';
  const decidedCategory = category || app.preferredCategory || 'contributing-authors';
  const currentMembers = getAdvisoryMembers();
  
  // Format credentials including any custom qualifications specified
  const credsParts = [
    app.highestQualification,
    app.customCredentials ? `(${app.customCredentials})` : null,
    app.specializationDomain ? `in ${app.specializationDomain}` : null,
    app.experienceYears ? `${app.experienceYears}+ years experience` : null
  ].filter(Boolean);
  const formattedCredentials = credsParts.join(' ');

  const formattedBio = app.briefExperienceAndBio || app.statementOfPedagogy || `${app.honorific || ''} ${app.name} specializes in ${app.specializationDomain} and contributes to Sikkim STET syllabus development.`;

  // Check if member already exists in council
  const existingMember = currentMembers.find(
    (m) => (app.email && m.email && m.email.toLowerCase() === app.email.toLowerCase()) || 
           m.name.toLowerCase() === app.name.toLowerCase()
  );

  let newOrUpdatedMember: AdvisoryMember;

  if (existingMember) {
    const updated = updateAdvisoryMember(existingMember.id, {
      roleTitle: decidedRole,
      category: decidedCategory,
      active: true,
      badge: badge || existingMember.badge || 'Inducted Fellow',
      credentials: formattedCredentials,
      affiliation: app.affiliation,
      bio: formattedBio,
      avatarUrl: app.photoUrl || existingMember.avatarUrl,
      contributions: app.contributions && app.contributions.length > 0 ? app.contributions : existingMember.contributions,
    });
    newOrUpdatedMember = updated || existingMember;
  } else {
    newOrUpdatedMember = addAdvisoryMember({
      name: app.name,
      honorific: app.honorific || undefined,
      roleTitle: decidedRole,
      category: decidedCategory,
      affiliation: app.affiliation,
      credentials: formattedCredentials,
      bio: formattedBio,
      avatarUrl: app.photoUrl || undefined,
      contributions: app.contributions && app.contributions.length > 0 ? app.contributions : ['Curriculum & Item Development'],
      badge: badge || 'Inducted Fellow',
      email: app.email,
      featured: false,
      active: true,
      order: currentMembers.length + 1,
    });
  }

  // Update application status
  const updatedApp: FellowshipApplication = {
    ...app,
    status: 'inducted',
    adminAssignedRoleTitle: decidedRole,
    adminAssignedCategory: decidedCategory,
    adminNotes: adminNotes || 'Approved and inducted into Council.',
    reviewedAt: Date.now(),
  };

  currentApps[appIndex] = updatedApp;
  saveFellowshipApplications(currentApps);

  // Sync to server
  fetch(`/api/fellowship-applications/${applicationId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedApp),
  }).catch(() => {});

  return { application: updatedApp, member: newOrUpdatedMember };
}

/**
 * Update any fields on a fellowship application (for admin editing)
 */
export function updateFellowshipApplication(
  id: string,
  updates: Partial<FellowshipApplication>
): FellowshipApplication | null {
  const current = getFellowshipApplications();
  const index = current.findIndex((a) => a.id === id);
  if (index === -1) return null;

  const updated: FellowshipApplication = {
    ...current[index],
    ...updates,
    reviewedAt: Date.now(),
  };

  current[index] = updated;
  saveFellowshipApplications(current);

  fetch(`/api/fellowship-applications/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  }).catch(() => {});

  return updated;
}

export function deleteFellowshipApplication(id: string): boolean {
  const current = getFellowshipApplications();
  const filtered = current.filter((a) => a.id !== id);
  if (filtered.length === current.length) return false;
  saveFellowshipApplications(filtered);

  fetch(`/api/fellowship-applications/${id}`, {
    method: 'DELETE',
  }).catch(() => {});

  return true;
}
