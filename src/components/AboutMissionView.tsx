import React, { useState, useEffect } from 'react';
import {
  Compass,
  Target,
  Sparkles,
  Award,
  Users,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Heart,
  ChevronRight,
  ExternalLink,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  FileCheck,
  Edit3,
  Layers,
  Zap,
  Globe
} from 'lucide-react';
import {
  AboutMissionContent,
  getAboutMissionContent,
  initAboutMissionSync
} from '../utils/aboutMissionStorage';

interface AboutMissionViewProps {
  onNavigate: (tab: string, extraState?: any) => void;
  isAdmin?: boolean;
}

export const AboutMissionView: React.FC<AboutMissionViewProps> = ({
  onNavigate,
  isAdmin = false,
}) => {
  const [content, setContent] = useState<AboutMissionContent>(() => getAboutMissionContent());

  useEffect(() => {
    initAboutMissionSync();

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setContent(e.detail);
      } else {
        setContent(getAboutMissionContent());
      }
    };

    window.addEventListener('studeezone_about_mission_updated', handleUpdate);
    return () => window.removeEventListener('studeezone_about_mission_updated', handleUpdate);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-2 sm:py-4 px-1" id="about-mission-page">
      {/* Top Breadcrumb & Admin Quick Edit Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold">
          <button
            onClick={() => onNavigate('dashboard')}
            className="hover:text-indigo-600 transition-colors cursor-pointer"
          >
            Dashboard
          </button>
          <span>/</span>
          <span className="text-slate-900 font-bold">Vision, Mission &amp; About Us</span>
        </div>

        {isAdmin && (
          <div className="flex items-center space-x-2 bg-amber-50 border border-amber-300 px-3.5 py-1.5 rounded-2xl shadow-2xs self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold text-amber-950">Administrator Mode</span>
            <button
              onClick={() => onNavigate('admin', { subTab: 'about-mission' })}
              className="ml-2 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
              id="admin-edit-about-page-btn"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Page in Admin Hub</span>
            </button>
          </div>
        )}
      </div>

      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-7 sm:p-12 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black border border-amber-400/30 uppercase tracking-wider">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Vision • Mission • About This App • The Team</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-['Outfit'] tracking-tight text-white leading-tight">
            Pioneering Pedagogical Excellence for Sikkim’s Educators
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
            Welcome to <strong className="text-white">studeezone</strong> — Sikkim’s premier psychometric assessment and teacher preparation ecosystem. Discover our core educational vision, our mission to empower every STET aspirant, the engineering behind the platform, and the passionate team leading this movement.
          </p>

          {/* Quick Jump Buttons */}
          <div className="pt-2 flex flex-wrap gap-2">
            <button
              onClick={() => scrollToSection('section-vision')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Our Vision</span>
            </button>
            <button
              onClick={() => scrollToSection('section-mission')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Our Mission</span>
            </button>
            <button
              onClick={() => scrollToSection('section-about')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>About This App</span>
            </button>
            <button
              onClick={() => scrollToSection('section-team')}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 shadow-md shadow-amber-500/20"
            >
              <Users className="w-3.5 h-3.5" />
              <span>The Team With A Mission</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: VISION */}
      <section id="section-vision" className="space-y-6 pt-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold shadow-xs">
            <Target className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-800">
              Future-Focused Aspiration
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
              {content.visionTitle}
            </h2>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          {content.visionSubtitle}
        </p>

        {/* Vision Statement Hero Card */}
        <div className="bg-gradient-to-br from-amber-50/80 via-white to-indigo-50/50 rounded-3xl p-6 sm:p-8 border-2 border-amber-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-900">
            Vision Statement
          </h3>
          <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
            {content.visionStatement}
          </p>

          {content.visionQuote && (
            <div className="pt-4 border-t border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm italic text-amber-950 font-serif">
                {content.visionQuote}
              </p>
              <span className="text-xs font-bold text-slate-500 shrink-0">
                — {content.visionAuthor}
              </span>
            </div>
          )}
        </div>

        {/* 4 Pillars of Vision */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {content.visionPillars.map((pillar, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs">
                  0{idx + 1}
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm font-['Outfit']">
                  {pillar.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[10px] font-bold text-amber-700 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Core Pillar</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: MISSION */}
      <section id="section-mission" className="space-y-6 pt-6 border-t border-slate-200/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-900 flex items-center justify-center font-bold shadow-xs">
            <Compass className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-800">
              Purpose &amp; Commitment
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
              {content.missionTitle}
            </h2>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          {content.missionSubtitle}
        </p>

        {/* Mission Statement Card */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-indigo-800 shadow-lg space-y-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
            Our Everyday Mission
          </span>
          <p className="text-base sm:text-xl font-medium text-slate-100 leading-relaxed relative z-10">
            {content.missionStatement}
          </p>
        </div>

        {/* 4 Mission Objectives */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {content.missionObjectives.map((obj, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex items-start space-x-3.5"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 text-sm font-['Outfit']">
                  {obj.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {obj.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: ABOUT THIS APP */}
      <section id="section-about" className="space-y-6 pt-6 border-t border-slate-200/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold shadow-xs">
            <BookOpen className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">
              The Platform Story
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
              {content.aboutTitle}
            </h2>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          {content.aboutSubtitle}
        </p>

        {/* Key Metrics / Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {content.keyMetrics.map((metric, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 text-center shadow-xs space-y-1"
            >
              <div className="text-xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
                {metric.value}
              </div>
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                {metric.label}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {metric.sublabel}
              </div>
            </div>
          ))}
        </div>

        {/* Founding Story Text */}
        <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4">
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 font-['Outfit'] flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <span>Why studeezone was Built</span>
          </h3>
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line">
            {content.aboutStory}
          </div>
        </div>

        {/* Core Features & Architectural Pillars */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
            Key Architectural &amp; Pedagogical Features
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {content.aboutFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-start space-x-3"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Core Values */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
            Our Guiding Values
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {content.coreValues.map((val, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xs">
                  0{idx + 1}
                </div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm font-['Outfit']">
                  {val.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                  {val.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: THE TEAM WITH A MISSION */}
      <section id="section-team" className="space-y-6 pt-6 border-t border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <Users className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-800">
                Founders, Educators &amp; Contributors
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
                {content.teamSectionTitle}
              </h2>
            </div>
          </div>

          <button
            onClick={() => onNavigate('fellowship-application')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 self-start sm:self-auto shadow-xs"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Apply to Join Council</span>
          </button>
        </div>

        <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          {content.teamSectionSubtitle}
        </p>

        {content.teamSectionIntro && (
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-3xl">
            {content.teamSectionIntro}
          </p>
        )}

        {/* Team Members Grid or Empty State */}
        {content.teamMembers && content.teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {content.teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group hover:border-indigo-300"
              >
                <div className="space-y-3">
                  {/* Photo & Role Header */}
                  <div className="flex items-center space-x-3.5">
                    <div className="relative shrink-0">
                      {member.avatarUrl ? (
                        <div className="w-14 h-18 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-xs bg-slate-50 ring-2 ring-indigo-50">
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      {member.badge && (
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200 mb-1">
                          {member.badge}
                        </span>
                      )}
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base font-['Outfit'] truncate">
                        {member.honorific ? `${member.honorific} ` : ''}{member.name}
                      </h4>
                      <p className="text-xs font-semibold text-indigo-700 leading-tight mt-0.5">
                        {member.role}
                      </p>
                    </div>
                  </div>

                  {/* Focus Area Pill */}
                  {member.focusArea && (
                    <div className="text-[11px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 flex items-center space-x-1.5">
                      <Target className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">{member.focusArea}</span>
                    </div>
                  )}

                  {/* Bio */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                    {member.bio}
                  </p>
                </div>

                {/* Contact / Links Footer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  {member.email ? (
                    <a
                      href={`mailto:${member.email}`}
                      className="hover:text-indigo-600 font-mono text-[11px] truncate flex items-center space-x-1"
                    >
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[170px]">{member.email}</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">Academic Team</span>
                  )}

                  <button
                    onClick={() => onNavigate('advisory')}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-0.5 cursor-pointer"
                  >
                    <span>Council</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50/80 rounded-3xl p-8 border border-dashed border-slate-300 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 mx-auto flex items-center justify-center font-bold">
              <Users className="w-6 h-6 text-amber-700" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-base font-['Outfit']">
              Academic Council &amp; Fellowship Network
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Our academic oversight and item vetting are governed collaboratively with inducted educators across Sikkim. You can inspect all verified council members or submit your credentials to join.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
              <button
                onClick={() => onNavigate('advisory')}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                View Academic Council
              </button>
              <button
                onClick={() => onNavigate('fellowship-application')}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
              >
                Apply for Council Fellowship
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Bottom Callout: Join the Movement */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 rounded-3xl p-6 sm:p-8 text-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-amber-300">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-black font-['Outfit']">
            Are You an Educator with a Passion for Sikkim’s Future?
          </h3>
          <p className="text-xs sm:text-sm font-medium text-slate-900 max-w-xl">
            Join our Academic Council as a Contributing Author, Item Vetting Specialist, or Pedagogy Fellow. Lend your voice and expertise to empower thousands of aspirants.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('fellowship-application')}
            className="px-5 py-3 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center space-x-2"
          >
            <span>Apply for Fellowship</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
          <button
            onClick={() => onNavigate('advisory')}
            className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
          >
            <span>View Council Roster</span>
          </button>
        </div>
      </div>
    </div>
  );
};
