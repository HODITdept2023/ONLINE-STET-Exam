import React, { useState, useMemo, useEffect } from 'react';
import {
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Search,
  Users,
  ExternalLink,
  Mail,
  ChevronRight,
  FileCheck,
  BookmarkCheck,
  Star,
  Layers,
  ArrowRight,
  Eye,
  EyeOff,
  Copy,
  Check,
  Share2
} from 'lucide-react';
import { AdvisoryMember, ContributorCategory, UserProfile } from '../types';
import {
  getAdvisoryMembers,
  getCategoryLabel,
  SUGGESTED_HIGH_SOUNDING_TITLES,
  getCouncilSettings,
  saveCouncilSettings,
  getFellowshipApplications
} from '../utils/advisoryStorage';
import { isAdminUser } from '../utils/storage';
import { CompactShareLink } from './CompactShareLink';

interface AdvisoryBoardViewProps {
  onNavigate: (tab: string, extraState?: any) => void;
  onOpenTutor?: (contextPrompt?: string) => void;
  userProfile?: UserProfile;
}

export const AdvisoryBoardView: React.FC<AdvisoryBoardViewProps> = ({
  onNavigate,
  onOpenTutor,
  userProfile,
}) => {
  const [members, setMembers] = useState<AdvisoryMember[]>(() => getAdvisoryMembers());
  const [showCouncilMembers, setShowCouncilMembers] = useState<boolean>(
    () => getCouncilSettings().showCouncilMembersSection
  );
  const [selectedCategory, setSelectedCategory] = useState<ContributorCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    const handleUpdate = () => {
      setMembers(getAdvisoryMembers());
      setShowCouncilMembers(getCouncilSettings().showCouncilMembersSection);
    };

    window.addEventListener('studeezone_advisory_updated', handleUpdate);
    window.addEventListener('studeezone_council_settings_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Initial server fetch to ensure public visitors see newest updates immediately
    fetch('/api/advisory-members')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.members) && data.members.length > 0) {
          setMembers(data.members);
          if (data.settings && typeof data.settings.showCouncilMembersSection === 'boolean') {
            setShowCouncilMembers(data.settings.showCouncilMembersSection);
          }
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('studeezone_advisory_updated', handleUpdate);
      window.removeEventListener('studeezone_council_settings_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleToggleCouncilMembers = () => {
    const nextVal = !showCouncilMembers;
    setShowCouncilMembers(nextVal);
    saveCouncilSettings({ showCouncilMembersSection: nextVal });
  };

  const categories: { id: ContributorCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Council & Authors' },
    { id: 'advisory-board', label: 'Advisory Board' },
    { id: 'contributing-authors', label: 'Contributing Authors' },
    { id: 'academic-council', label: 'Academic Council' },
    { id: 'pedagogical-fellows', label: 'Pedagogical Fellows' },
    { id: 'editorial-reviewers', label: 'Editorial & Vetting' },
  ];

  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => m.active !== false)
      .filter((m) => {
        if (selectedCategory === 'all') return true;
        return m.category === selectedCategory;
      })
      .filter((m) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        const normQ = q.replace(/distiguished/g, 'distinguished');
        return (
          m.name.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(normQ) ||
          m.roleTitle.toLowerCase().includes(q) ||
          m.roleTitle.toLowerCase().includes(normQ) ||
          m.affiliation.toLowerCase().includes(q) ||
          m.affiliation.toLowerCase().includes(normQ) ||
          m.credentials.toLowerCase().includes(q) ||
          m.credentials.toLowerCase().includes(normQ) ||
          m.contributions.some((c) => c.toLowerCase().includes(q) || c.toLowerCase().includes(normQ))
        );
      })
      .sort((a, b) => {
        // Featured first, then by order
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.order - b.order;
      });
  }, [members, selectedCategory, searchQuery]);

  const featuredChair = useMemo(() => {
    return members.find((m) => m.featured && m.category === 'academic-council') || members[0];
  }, [members]);

  const getAdvisoryShareUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${window.location.pathname}?tab=academic-council`;
    }
    return 'https://ais-pre-nkadck6bvxhmkguzeszded-249721791021.asia-southeast1.run.app/?tab=academic-council';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="advisory-board-view">
      {/* Scholarly Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold tracking-wide uppercase">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>Academic Council &amp; Contributing Scholars</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Outfit'] text-white">
            Advisory Board / Academic Council page
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Distinguished Advisory Board &amp; Contributing Authors — The intellectual backbone of <strong className="text-white">studeezone.com</strong>. Our council brings together 
            esteemed teacher-educators, former SCERT consultants, cognitive psychologists, and subject-matter authors 
            to uphold rigorous psychometric standards and syllabus fidelity for the Sikkim Teacher Eligibility Test (STET).
          </p>

          {/* Key Rigor Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
            <div className="bg-white/5 backdrop-blur-xs border border-white/10 p-3 rounded-xl">
              <div className="flex items-center space-x-1.5 text-amber-300 font-bold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>NCTE Compliant</span>
              </div>
              <p className="text-slate-400 text-[11px]">Strict syllabus harmonization with national guidelines</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xs border border-white/10 p-3 rounded-xl">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold mb-1">
                <FileCheck className="w-4 h-4" />
                <span>Peer-Vetted MCQs</span>
              </div>
              <p className="text-slate-400 text-[11px]">Zero ambiguity item stems with verified answer keys</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xs border border-white/10 p-3 rounded-xl">
              <div className="flex items-center space-x-1.5 text-sky-400 font-bold mb-1">
                <BookmarkCheck className="w-4 h-4" />
                <span>Cognitive Depth</span>
              </div>
              <p className="text-slate-400 text-[11px]">Bloom's Taxonomy calibrated conceptual frameworks</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xs border border-white/10 p-3 rounded-xl">
              <div className="flex items-center space-x-1.5 text-indigo-300 font-bold mb-1">
                <Award className="w-4 h-4" />
                <span>Regional Heritage</span>
              </div>
              <p className="text-slate-400 text-[11px]">Eastern Himalayan ecology &amp; state constitutional law</p>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Direct Shareable Link Widget */}
      <CompactShareLink
        headerTitle="Advisory Board / Academic Council page"
        shareUrl={getAdvisoryShareUrl()}
        badgeLabel="Direct Shareable Link"
        subtitle="Share this direct link with colleagues, educators, and scholars to view the Advisory Board and Academic Council directory."
        theme="indigo"
        secondaryAction={{
          label: 'Fellowship Application page',
          onClick: () => onNavigate('fellowship-application'),
        }}
        whatsappShareText={`Direct Link for Advisory Board / Academic Council page (studeezone.com Sikkim STET):\n${getAdvisoryShareUrl()}`}
        emailSubject="studeezone.com: Advisory Board / Academic Council page"
        emailBody={`Dear Colleague,\n\nPlease find the direct link to the Advisory Board / Academic Council page on studeezone.com:\n${getAdvisoryShareUrl()}\n\nWarm regards,\nstudeezone Academic Governance Council`}
      />

      {/* Council Members Section Controls (Hide / Show Option) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs" id="council-visibility-control-bar">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold text-slate-800 font-['Outfit']">
                Council Members &amp; Contributing Authors
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                showCouncilMembers 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {showCouncilMembers ? 'Section Visible' : 'Section Hidden'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {showCouncilMembers 
                ? (members.length > 0 ? `${members.length} verified academic member${members.length > 1 ? 's' : ''} enrolled` : 'Charter active (zero placeholder entries)')
                : 'Council members section is currently hidden from view'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <button
            onClick={handleToggleCouncilMembers}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer border ${
              showCouncilMembers
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-xs'
            }`}
            id="toggle-council-members-visibility-btn"
            title={showCouncilMembers ? 'Hide council members section' : 'Show council members section'}
          >
            {showCouncilMembers ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hide Council Members</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Show Council Members</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* If section is hidden, show discreet hidden state; otherwise show members or governance charter */}
      {!showCouncilMembers ? (
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto border border-slate-200">
            <EyeOff className="w-6 h-6 text-slate-500" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-extrabold text-base text-slate-900 font-['Outfit']">
              Council Members Section is Hidden
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The individual council member directory is currently hidden from display. You can toggle this section back on anytime using the control above.
            </p>
          </div>
          <button
            onClick={handleToggleCouncilMembers}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer inline-flex items-center space-x-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Show Council Members Section</span>
          </button>
        </div>
      ) : members.length > 0 ? (
        <>
          {/* Featured Council Chairperson Spotlight */}
          {featuredChair && (
            <div className="bg-gradient-to-r from-amber-500/10 via-indigo-50/50 to-amber-500/5 rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-xs relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-start space-x-4 sm:space-x-6">
                  <div className="relative shrink-0">
                    {featuredChair.avatarUrl ? (
                      <img
                        src={featuredChair.avatarUrl}
                        alt={featuredChair.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-indigo-900 border-2 border-amber-400 shadow-md flex items-center justify-center text-amber-300 font-extrabold text-2xl font-['Outfit']">
                        {featuredChair.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 p-1.5 rounded-lg shadow-xs" title="Council Leadership">
                      <Star className="w-3.5 h-3.5 fill-slate-950" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 border border-amber-300">
                        {featuredChair.badge || 'Council Leadership'}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {getCategoryLabel(featuredChair.category)}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
                      {featuredChair.honorific ? `${featuredChair.honorific} ` : ''}{featuredChair.name}
                    </h2>

                    <p className="text-xs sm:text-sm font-bold text-indigo-700">
                      {featuredChair.roleTitle}
                    </p>

                    <p className="text-xs text-slate-600 font-medium max-w-2xl">
                      {featuredChair.affiliation}
                    </p>

                    <p className="text-xs text-slate-500 italic max-w-2xl pt-1">
                      "{featuredChair.bio}"
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-auto">
                  <button
                    onClick={() => onNavigate('mock-tests')}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <span>Take Council Mock Test</span>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </button>
                  <button
                    onClick={() => onNavigate('practice')}
                    className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <span>Practice Vetted Questions</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filter and Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search scholar or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-indigo-300 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Member Card Top: Avatar, Badges & Category */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="relative">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-black text-lg font-['Outfit'] group-hover:bg-indigo-100 transition-colors">
                            {member.name.charAt(0)}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] border-2 border-white" title="Verified Academic Fellow">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      </div>

                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 font-['Outfit'] group-hover:text-indigo-600 transition-colors">
                          {member.honorific ? `${member.honorific} ` : ''}{member.name}
                        </h3>
                        <p className="text-[11px] font-semibold text-slate-500">
                          {member.credentials}
                        </p>
                      </div>
                    </div>

                    {member.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider shrink-0">
                        {member.badge}
                      </span>
                    )}
                  </div>

                  {/* Prestigious Role Title & Category */}
                  <div>
                    <div className="inline-block px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 font-extrabold text-xs">
                      {member.roleTitle}
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-1.5 line-clamp-2">
                      {member.affiliation}
                    </p>
                  </div>

                  {/* Scholarly Bio */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {member.bio}
                  </p>

                  {/* Areas of Contribution */}
                  {member.contributions && member.contributions.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Key Curricular Contributions
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {member.contributions.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200/60"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Bar: Action / Citation */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-[11px] text-indigo-600">
                    {getCategoryLabel(member.category)}
                  </span>

                  {onOpenTutor && (
                    <button
                      onClick={() => onOpenTutor(`Tell me about how ${member.name} (${member.roleTitle}) guides our STET prep curriculum.`)}
                      className="hover:text-indigo-600 font-bold inline-flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <span>Ask Lama</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">No members found matching your search</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search query or selecting "All Council &amp; Authors" to view all esteemed contributors.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </>
      ) : (
        /* Clean State: Zero fake entries, dignified institutional governance charter */
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 font-['Outfit']">
                  Academic Governance Charter &amp; Vetting Standards
                </h3>
                <p className="text-xs text-slate-500">
                  Strict zero-placeholder policy: Only officially verified council fellows and authors are listed
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              Directory Clean &amp; Uncompromised
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Psychometric Item Rigor</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                All mock examinations, Bloom's cognitive difficulty calibrations, and answer keys are subjected to strict zero-ambiguity stem verification before candidate deployment.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">NCTE Syllabus Harmonization</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full coverage alignment across Primary (Paper I) and Graduate Teacher (Paper II) curricula, strictly mapping to Sikkim state educational guidelines and NEP 2020 frameworks.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Verified Scholar Enrolment</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Council fellows and contributing authors are enrolled exclusively through verified academic credential audits. No placeholder entries or simulated bios are published.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Quick Review Shortcut (visible to administrators) */}
      {isAdminUser(userProfile?.email) && (() => {
        const pendingCount = getFellowshipApplications().filter((a) => a.status === 'submitted' || a.status === 'under_review').length;
        if (pendingCount === 0) return null;
        return (
          <div className="bg-gradient-to-r from-amber-500/15 via-indigo-50/60 to-amber-500/10 border-2 border-amber-400/80 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm" id="admin-council-fellowship-shortcut">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
                <Award className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-sm text-slate-900 font-['Outfit']">
                    Administrator Fellowship Applications Review
                  </span>
                  <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full animate-pulse">
                    {pendingCount} Pending Review
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {pendingCount} applicant{pendingCount > 1 ? 's have' : ' has'} submitted their fellowship credentials. Review applications, allocate designations, and induct to Council.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('admin', { subTab: 'fellowship-applications' })}
              className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs shadow-md transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer border border-amber-400/40"
              id="admin-jump-to-fellowship-btn"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Open Fellowship Approvals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })()}

      {/* Call for Contributing Authors & Academic Fellows */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold border border-amber-400/30 uppercase">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Academic Fellowship Invitation</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black font-['Outfit'] text-white">
            Are you a Teacher Educator, Ph.D. Scholar, or Subject Specialist?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Join the <strong className="text-white">studeezone Academic Council</strong> as a Contributing Author, Item Vetting Specialist, or Regional Pedagogy Fellow. Submit your details on our <strong className="text-amber-300">Fellowship Application page</strong>.
          </p>
        </div>

        <div className="shrink-0 w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const url = typeof window !== 'undefined'
                ? `${window.location.origin}${window.location.pathname}?tab=fellowship-application`
                : 'https://ais-pre-nkadck6bvxhmkguzeszded-249721791021.asia-southeast1.run.app/?tab=fellowship-application';
              navigator.clipboard.writeText(url);
              setCopiedLink(true);
              setTimeout(() => setCopiedLink(false), 2500);
            }}
            className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer border border-white/20"
            id="copy-academic-board-link-btn"
            title="Copy direct shareable application link"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Form Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-300" />
                <span>Copy Fellowship Form Link</span>
              </>
            )}
          </button>

          <button
            onClick={() => onNavigate('fellowship-application')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer border border-amber-300"
            id="express-interest-academic-board-btn"
          >
            <span>Fellowship Application page</span>
            <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
