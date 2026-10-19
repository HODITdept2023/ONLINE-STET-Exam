import React, { useState, useRef } from 'react';
import {
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  FileCheck,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Check,
  Info,
  Copy,
  ExternalLink,
  Share2,
  Camera,
  Upload,
  Trash2,
  RefreshCw,
  UserCheck,
  Image as ImageIcon
} from 'lucide-react';
import { FellowshipApplication, ContributorCategory } from '../types';
import {
  submitFellowshipApplication
} from '../utils/advisoryStorage';
import { processPassportPhoto } from '../utils/imageUtils';
import { CompactShareLink } from './CompactShareLink';

interface FellowshipApplicationViewProps {
  onNavigate: (tab: string, extraState?: any) => void;
  onOpenTutor?: (prompt?: string) => void;
}

export const FellowshipApplicationView: React.FC<FellowshipApplicationViewProps> = ({
  onNavigate,
  onOpenTutor,
}) => {
  // Step 1: Credentials & Details Form, Step 3: Success Confirmation (Page 2 removed for applicant; only for admin)
  const [step, setStep] = useState<1 | 3>(1);

  // Form state
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isProcessingPhoto, setIsProcessingPhoto] = useState<boolean>(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [honorific, setHonorific] = useState<string>('Dr.');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [location, setLocation] = useState<string>('Gangtok, Sikkim');
  const [affiliation, setAffiliation] = useState<string>('');
  const [highestQualification, setHighestQualification] = useState<string>('Ph.D. in Education / Teacher Pedagogy');
  const [customCredentials, setCustomCredentials] = useState<string>('');
  const [specializationDomain, setSpecializationDomain] = useState<string>('Child Development & Pedagogy (CDP)');
  const [experienceYears, setExperienceYears] = useState<string>('8');
  const [profileLink, setProfileLink] = useState<string>('');
  
  // Contributions
  const [selectedContributions, setSelectedContributions] = useState<string[]>([
    'Question Item Drafting & Detailed Explanations',
    'Psychometric Item Vetting & Distractor Plausibility',
  ]);

  // Brief about experience, yourself, and how you fit into the role
  const [briefExperienceAndBio, setBriefExperienceAndBio] = useState<string>('');

  // Brief Statement of Pedagogy / Contribution Note (now in Step 1!)
  const [statementOfPedagogy, setStatementOfPedagogy] = useState<string>('');

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingPhoto(true);
    setErrorMsg(null);
    try {
      const processed = await processPassportPhoto(file);
      setPhotoUrl(processed);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process passport photo');
    } finally {
      setIsProcessingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  // Council Membership Track / Role Desired Option
  const [preferredCategory, setPreferredCategory] = useState<ContributorCategory>('advisory-board');
  const [preferredPosition, setPreferredPosition] = useState<string>('Distinguished Advisory Board Member');

  // Submission result
  const [submittedApp, setSubmittedApp] = useState<FellowshipApplication | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  const roleOptions: { category: ContributorCategory; title: string; label: string; desc: string; badge: string }[] = [
    {
      category: 'advisory-board',
      title: 'Distinguished Advisory Board Member',
      label: 'Member (Advisory Board)',
      desc: 'Offer institutional governance, syllabus vetting, academic oversight, and strategic guidance to the council.',
      badge: 'Advisory Board Member',
    },
    {
      category: 'contributing-authors',
      title: 'Distinguished Contributing Author',
      label: 'Contributing Author & Scholar',
      desc: 'Author high-yield question items, mock papers, pedagogical blueprints, and chapter-wise study notes.',
      badge: 'Contributing Author',
    },
    {
      category: 'academic-council',
      title: 'Academic Council Fellow',
      label: 'Academic Council Member',
      desc: 'Curricular architecture, Eastern Himalayan context alignment, and Sikkim state syllabus harmonization.',
      badge: 'Academic Council',
    },
    {
      category: 'pedagogical-fellows',
      title: 'Lead Pedagogical Fellow',
      label: 'Pedagogical Fellow',
      desc: 'Focus on Child Development & Pedagogy (CDP), Vygotskian constructivism, and Bloom’s cognitive levels.',
      badge: 'Pedagogy Fellow',
    },
    {
      category: 'editorial-reviewers',
      title: 'Master Question Vetting Specialist',
      label: 'Editorial & Item Reviewer',
      desc: 'Audit distractor plausibility, eliminate ambiguity, calibrate discrimination index, and verify answer keys.',
      badge: 'Item Reviewer',
    },
  ];

  const contributionOptions = [
    'Question Item Drafting & Detailed Explanations',
    'Psychometric Item Vetting & Distractor Plausibility',
    'Bloom’s Cognitive Level Calibration & Ambiguity Audit',
    'Regional EVS & Sikkim Himalayan Curricular Mapping',
    'High-Yield Mnemonic & Rapid Revision Note Creation',
    'Syllabus Harmonization (NCTE & NEP 2020 Standards)',
    'Pedagogical Case Study & Classroom Scenario Development',
    'Academic Governance & Quality Assurance Moderation',
  ];

  const specializationOptions = [
    'Child Development & Pedagogy (CDP)',
    'Environmental Studies (EVS) & Himalayan Ecology',
    'Mathematics Pedagogy & Problem-Solving',
    'Science Pedagogy & Inquiry-Based Methods',
    'Social Sciences & Regional Heritage',
    'English Language & Pedagogical Grammar',
    'Nepali Language & Literature Pedagogy',
    'Educational Psychometrics & Standard-Setting',
    'Inclusive Education & Multi-Grade Teaching',
  ];

  const qualificationOptions = [
    'Ph.D. in Education / Teacher Pedagogy',
    'Ph.D. in Subject Domain / Psychology',
    'M.Ed (Gold Medalist / Distinction)',
    'M.Ed / M.Phil with UGC-NET in Education',
    'M.Sc. / M.A. in Core Subject + B.Ed / NET',
    'Senior Teacher Educator / Master Trainer',
    'Former SCERT / DIET Faculty',
    'Other Specialized Academic Credential',
  ];

  const handleToggleContribution = (item: string) => {
    setSelectedContributions((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const validateStep1 = () => {
    setErrorMsg(null);
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid academic/personal email address.');
      return false;
    }
    if (!phone.trim()) {
      setErrorMsg('Please provide a contact / WhatsApp phone number.');
      return false;
    }
    if (!affiliation.trim()) {
      setErrorMsg('Please state your current institution or organization affiliation.');
      return false;
    }
    return true;
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!validateStep1()) {
      return;
    }

    try {
      const app = submitFellowshipApplication({
        name: name.trim(),
        honorific: honorific.trim(),
        email: email.trim(),
        phone: phone.trim(),
        location: location.trim(),
        affiliation: affiliation.trim(),
        highestQualification: highestQualification.trim(),
        customCredentials: customCredentials.trim() || undefined,
        specializationDomain: specializationDomain.trim(),
        experienceYears: experienceYears.trim(),
        briefExperienceAndBio: briefExperienceAndBio.trim() || undefined,
        photoUrl: photoUrl || undefined,
        preferredPosition: preferredPosition.trim() || 'Distinguished Advisory Board Member',
        preferredCategory: preferredCategory || 'advisory-board',
        contributions: selectedContributions,
        profileLink: profileLink.trim() || undefined,
        statementOfPedagogy: statementOfPedagogy.trim(),
      });

      setSubmittedApp(app);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error submitting fellowship application:', err);
      setErrorMsg('An unexpected error occurred while saving your application. Please try again.');
    }
  };

  const handleCopyRef = () => {
    if (!submittedApp) return;
    navigator.clipboard.writeText(submittedApp.referenceNumber);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const getDirectShareUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${window.location.pathname}?tab=fellowship-application`;
    }
    return 'https://ais-pre-nkadck6bvxhmkguzeszded-249721791021.asia-southeast1.run.app/?tab=fellowship-application';
  };

  const [copiedShareUrl, setCopiedShareUrl] = useState(false);

  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(getDirectShareUrl());
    setCopiedShareUrl(true);
    setTimeout(() => setCopiedShareUrl(false), 2500);
  };

  const handleNativeShare = async () => {
    const url = getDirectShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join the studeezone Academic Board / Council',
          text: 'Apply to join the studeezone Academic Board as a Contributing Author, Item Vetting Specialist, or Pedagogy Fellow (Sikkim STET):',
          url,
        });
        return;
      } catch (e) {
        // User cancelled or fallback
      }
    }
    handleCopyShareUrl();
  };

  const renderShareWidget = (
    title = 'Fellowship Application page',
    subtitle?: string
  ) => {
    return (
      <CompactShareLink
        headerTitle={title}
        shareUrl={getDirectShareUrl()}
        badgeLabel="Direct Shareable Link"
        subtitle={subtitle}
        theme="amber"
        secondaryAction={{
          label: 'Advisory Board / Academic Council page',
          onClick: () => onNavigate('advisory'),
        }}
        whatsappShareText={`Direct Link for Fellowship Application page (studeezone Academic Council):\n${getDirectShareUrl()}`}
        emailSubject="Invitation to Apply: Fellowship Application page (studeezone.com)"
        emailBody={`Dear Colleague,\n\nYou are cordially invited to submit your profile on the Fellowship Application page for the studeezone Academic Council (Sikkim STET):\n${getDirectShareUrl()}\n\nWarm regards,\nstudeezone Academic Governance Council`}
      />
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="fellowship-application-page">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('advisory')}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
          id="back-to-advisory-btn"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Advisory Board / Academic Council page</span>
        </button>

        <div className="text-xs text-slate-600 font-semibold hidden sm:block">
          Fellowship Application page
        </div>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-2.5">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold border border-amber-400/30 uppercase tracking-wide">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Academic Fellowship Invitation &amp; Enrolment</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-white tracking-tight">
            Fellowship Application page
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Are you a Teacher Educator, Ph.D. Scholar, or Subject Specialist? Join the <strong className="text-white">studeezone Academic Council</strong> as a Contributing Author, Item Vetting Specialist, or Regional Pedagogy Fellow. Help shape the future of teacher preparation across Sikkim and the Himalayan belt.
          </p>

          {/* Scholar Fellowship Application Form Header Banner Pill */}
          {step < 3 && (
            <div className="pt-2 flex items-center space-x-2 text-xs">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 font-medium border border-white/15">
                <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Fellowship Enrolment Form &bull; Role Designation Allocated by Admin</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Compact Direct Shareable Link Widget */}
      {renderShareWidget()}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <Info className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: Personal, Institutional & Academic Credentials + Brief Statement of Pedagogy */}
      {step === 1 && (
        <form onSubmit={handleSubmitApplication} className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 font-['Outfit']">
                Academic &amp; Professional Credentials Form
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Provide your verified scholarly credentials and pedagogical note. The Academic Governance Council Admin reviews and allocates your official council position track.
              </p>
            </div>

            {/* Passport Photo Upload & Profile Pic */}
            <div className="bg-gradient-to-r from-amber-500/10 via-slate-50 to-indigo-500/10 rounded-2xl p-4 sm:p-5 border border-amber-300/80">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                {/* Passport Frame (Aspect Ratio 3.5 : 4.5 standard portrait passport photo) */}
                <div className="relative group shrink-0">
                  <div
                    onClick={() => photoInputRef.current?.click()}
                    className="w-28 h-36 sm:w-32 sm:h-40 rounded-2xl bg-white border-2 border-slate-300 shadow-sm overflow-hidden flex flex-col items-center justify-center relative ring-4 ring-amber-100/70 cursor-pointer hover:border-indigo-400 transition-colors"
                    title="Click to select passport photo"
                  >
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt="Passport size profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-3 text-center text-slate-400">
                        <Camera className="w-8 h-8 mb-1.5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          Passport Photo
                        </span>
                        <span className="text-[9px] text-slate-400 leading-tight mt-0.5 font-medium">
                          3.5 × 4.5 cm
                        </span>
                      </div>
                    )}
                    {isProcessingPhoto && (
                      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      </div>
                    )}
                  </div>
                  <span className="block text-center text-[10px] font-bold text-slate-500 mt-1">
                    Profile Picture
                  </span>
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950">
                      Passport Size Photo
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      For Council Roster &amp; Contributing Author Profile
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 font-['Outfit']">
                    Upload Your Official Profile Picture
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Please upload a passport-sized portrait photograph (clear front-facing view, light background). This photograph will be published on your official Council Member card and public author profile upon induction.
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <input
                      type="file"
                      ref={photoInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/*"
                      className="hidden"
                      id="passport-photo-file-input"
                    />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer inline-flex items-center space-x-1.5"
                      id="upload-passport-photo-btn"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{photoUrl ? 'Change Photograph' : 'Upload Passport Photo'}</span>
                    </button>
                    {photoUrl && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-3 py-2 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer inline-flex items-center space-x-1"
                        id="remove-passport-photo-btn"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Name & Honorific */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Honorific Title
                </label>
                <select
                  value={honorific}
                  onChange={(e) => setHonorific(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Prof. Dr.">Prof. Dr.</option>
                  <option value="Prof.">Prof.</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Shri">Shri</option>
                  <option value="Smt.">Smt.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mr.">Mr.</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tenzing Norbu Bhutia"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Academic / Personal Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. t.bhutia@university.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Contact / WhatsApp Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98320 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Institutional Affiliation & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Current Affiliation &amp; Designation <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Assistant Professor, SCERT Sikkim / Sikkim University"
                    value={affiliation}
                    onChange={(e) => setAffiliation(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Location / State
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. Gangtok, Sikkim / Darjeeling"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Qualifications & Specialization */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Highest Qualification
                </label>
                <select
                  value={highestQualification}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHighestQualification(val);
                    if (val.includes('Other')) {
                      setTimeout(() => {
                        const el = document.getElementById('fellowship-custom-credentials-input');
                        el?.focus();
                      }, 50);
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {qualificationOptions.map((q, idx) => (
                    <option key={idx} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Specialization Domain
                </label>
                <select
                  value={specializationDomain}
                  onChange={(e) => setSpecializationDomain(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {specializationOptions.map((s, idx) => (
                    <option key={idx} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Teaching / Research Exp. (Years)
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* USER REQUESTED: Option to fill credentials other than the given options */}
            <div className="bg-amber-50/70 rounded-2xl p-4 sm:p-5 border border-amber-300/80 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="block text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <Award className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Other Credentials, Additional Degrees &amp; Distinctions</span>
                </label>
                <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full inline-block w-fit">
                  Credentials Other Than Given Options
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                If you have academic degrees, specialized teacher educator credentials, UGC-NET/SET, M.Phil, post-doctoral research, state honors, or diplomas other than the dropdown options, fill them below:
              </p>
              <input
                type="text"
                value={customCredentials}
                onChange={(e) => setCustomCredentials(e.target.value)}
                placeholder="e.g. Post-Doctoral Fellow, State Best Teacher Awardee 2024, B.El.Ed, Cambridge Diploma, CTET/STET 1st Rank, M.Sc. Physics + B.Ed Gold Medalist..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300/80 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-amber-500 bg-white placeholder:text-slate-400"
                id="fellowship-custom-credentials-input"
              />
            </div>

            {/* Profile or Research Link */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Academic Profile / ResearchGate / LinkedIn URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={profileLink}
                onChange={(e) => setProfileLink(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white placeholder:text-slate-400"
              />
            </div>

            {/* Desired Council Membership Track / Option */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  Desired Council Membership Track / Option <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Selected: {roleOptions.find(r => r.category === preferredCategory)?.label}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                {roleOptions.map((opt, idx) => {
                  const isSelected = preferredCategory === opt.category;
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        setPreferredCategory(opt.category);
                        setPreferredPosition(opt.title);
                      }}
                      className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/50 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-black ${isSelected ? 'text-amber-950' : 'text-slate-800'}`}>
                            {opt.label}
                          </span>
                          <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-md ${
                            isSelected ? 'bg-amber-200 text-amber-950 font-black' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 leading-snug">
                          {opt.desc}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-slate-600 pt-1 border-t border-slate-100">
                        <Award className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate">{opt.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Areas of Interest / Curricular Contributions */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800">
                Proposed Areas of Curricular Contribution (Select all that apply)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {contributionOptions.map((item, idx) => {
                  const isChecked = selectedContributions.includes(item);
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handleToggleContribution(item)}
                      className={`text-left p-2.5 rounded-xl text-xs font-medium border flex items-center space-x-2.5 transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                        isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="line-clamp-1">{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* USER REQUESTED: Section to write in brief about experience, yourself, and how you fit into the role */}
            <div className="bg-gradient-to-br from-indigo-50/80 via-white to-amber-50/50 p-5 rounded-2xl border-2 border-indigo-200/90 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-indigo-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 font-['Outfit']">
                      About Yourself, Experience &amp; Role Fit Statement
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Write in brief about your professional experience, yourself, and how you fit into the role
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 w-fit">
                  Core Evaluation Section
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Write in brief about your experience, yourself &amp; why you fit into this role:
                </label>
                <textarea
                  rows={5}
                  value={briefExperienceAndBio}
                  onChange={(e) => setBriefExperienceAndBio(e.target.value)}
                  placeholder="Introduce yourself, your academic qualifications and teaching journey (institutions served, core subjects taught), key achievements, and explain why your perspective makes you an ideal fit for your chosen Council / Contributing Author role for Sikkim STET aspirants..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white placeholder:text-slate-400 leading-relaxed"
                  id="fellowship-experience-role-fit-textarea"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Summarize your pedagogic background and suitability for the council.</span>
                  <span className="font-mono">{briefExperienceAndBio.length} characters</span>
                </div>
              </div>
            </div>

            {/* Brief Statement of Pedagogy / Contribution Note (Added to Step 1 as requested) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Brief Statement of Pedagogy / Contribution Note</span>
                <span className="text-[10px] text-slate-400 font-normal">Pedagogical Vision &amp; Curriculum Focus</span>
              </label>
              <textarea
                rows={4}
                value={statementOfPedagogy}
                onChange={(e) => setStatementOfPedagogy(e.target.value)}
                placeholder="Share a short note on your pedagogical experience, why you wish to contribute to Sikkim STET teacher aspirants, or specific syllabus areas you want to guide..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Form Direct Submit Action */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer border border-amber-300 transform hover:scale-[1.01] active:scale-95"
              id="submit-fellowship-application-btn"
            >
              <span>Submit Fellowship Application to Academic Board</span>
              <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: Submission Confirmation */}
      {step === 3 && submittedApp && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
              Expression of Interest Recorded
            </span>
            <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">
              Thank You, {submittedApp.honorific} {submittedApp.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Your scholarly credentials and pedagogical statement have been submitted directly to the <strong className="text-slate-900">studeezone Academic Governance Council</strong> for admin review and role allocation.
            </p>
          </div>

          {/* Reference Slip Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 max-w-md mx-auto text-left space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Application Reference ID
              </span>
              <button
                onClick={handleCopyRef}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
              >
                {copiedRef ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>

            {/* Passport Photo and Ref ID */}
            <div className="flex items-center space-x-4">
              {submittedApp.photoUrl && (
                <div className="w-16 h-20 rounded-xl bg-white border-2 border-slate-300 overflow-hidden shrink-0 shadow-xs">
                  <img
                    src={submittedApp.photoUrl}
                    alt={submittedApp.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <div className="text-base font-black text-slate-900 font-mono tracking-wider">
                  {submittedApp.referenceNumber}
                </div>
                <div className="text-xs font-bold text-slate-700">
                  {submittedApp.honorific} {submittedApp.name}
                </div>
                <div className="text-[11px] text-slate-500">
                  {submittedApp.affiliation}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs pt-2 border-t border-slate-200/60">
              <div className="flex justify-between text-slate-600">
                <span>Council Track / Desired Role:</span>
                <span className="font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded text-[11px]">{submittedApp.preferredPosition || 'Member (Advisory Board)'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Academic Qualification:</span>
                <span className="font-bold text-slate-900">{submittedApp.highestQualification}</span>
              </div>
              {submittedApp.customCredentials && (
                <div className="flex justify-between text-slate-600">
                  <span>Additional Credentials:</span>
                  <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded text-[11px]">{submittedApp.customCredentials}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Specialization:</span>
                <span className="font-bold text-slate-900">{submittedApp.specializationDomain}</span>
              </div>
              {submittedApp.briefExperienceAndBio && (
                <div className="pt-1.5 text-[11px] text-slate-600 border-t border-slate-100">
                  <strong className="text-slate-800 block mb-0.5">Experience &amp; Role Fit Summary:</strong>
                  <p className="italic line-clamp-3 bg-white p-2 rounded-lg border border-slate-200/80">
                    "{submittedApp.briefExperienceAndBio}"
                  </p>
                </div>
              )}
              {submittedApp.statementOfPedagogy && (
                <div className="pt-1 text-[11px] text-slate-500 italic line-clamp-2 border-t border-slate-100">
                  "{submittedApp.statementOfPedagogy}"
                </div>
              )}
              <div className="flex justify-between text-slate-600 pt-1">
                <span>Status:</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                  Under Board Credential Review
                </span>
              </div>
            </div>
          </div>

          {/* Review Protocol Info */}
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 max-w-md mx-auto text-xs text-indigo-950 text-left space-y-1.5">
            <div className="flex items-center space-x-1.5 font-bold text-indigo-900">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Academic Council Review Timeline:</span>
            </div>
            <p className="text-[11px] text-indigo-900/80 leading-relaxed">
              Our Academic Council reviews submissions weekly. Once ratified by the Chairperson and Editorial Board, you will receive confirmation via email ({submittedApp.email}) with curriculum guidelines and onboarding details.
            </p>
          </div>

          {/* Share with Colleagues Widget */}
          <div className="pt-2 text-left">
            {renderShareWidget(
              'Fellowship Application page',
              'Know a fellow educator, DIET faculty member, or Ph.D. scholar? Share this direct link so they can fill in their details.'
            )}
          </div>

          {/* Action Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('advisory')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Return to Advisory Board / Academic Council page
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Go to Candidate Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
