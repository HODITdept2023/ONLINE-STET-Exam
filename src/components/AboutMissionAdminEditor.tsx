import React, { useState, useRef } from 'react';
import {
  Compass,
  Target,
  BookOpen,
  Users,
  Plus,
  Trash2,
  Edit3,
  Check,
  RotateCcw,
  Upload,
  Camera,
  ExternalLink,
  Sparkles,
  Save,
  CheckCircle2,
  Info,
  RefreshCw,
  Award
} from 'lucide-react';
import {
  AboutMissionContent,
  TeamMember,
  getAboutMissionContent,
  saveAboutMissionContent,
  resetAboutMissionContent
} from '../utils/aboutMissionStorage';
import { processPassportPhoto } from '../utils/imageUtils';

interface AboutMissionAdminEditorProps {
  onNavigateToPublicPage?: () => void;
  showToast?: (message: string) => void;
}

export const AboutMissionAdminEditor: React.FC<AboutMissionAdminEditorProps> = ({
  onNavigateToPublicPage,
  showToast,
}) => {
  const [content, setContent] = useState<AboutMissionContent>(() => getAboutMissionContent());
  const [activeTab, setActiveTab] = useState<'vision' | 'mission' | 'about' | 'team'>('vision');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Team editing modal state
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState<boolean>(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState<boolean>(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    saveAboutMissionContent(content, true);
    setIsSaved(true);
    if (showToast) {
      showToast('Vision, Mission & About page updated successfully!');
    }
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all Vision, Mission, About & Team content back to the default text?')) {
      const reset = resetAboutMissionContent();
      setContent(reset);
      if (showToast) {
        showToast('Page content reset to default settings.');
      }
    }
  };

  // Team member photo handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingMember) return;
    setIsProcessingPhoto(true);
    try {
      const processed = await processPassportPhoto(file);
      setEditingMember({
        ...editingMember,
        avatarUrl: processed,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to process photo');
    } finally {
      setIsProcessingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleOpenAddMember = () => {
    setEditingMember({
      id: `team-${Date.now()}`,
      honorific: 'Dr.',
      name: '',
      role: '',
      badge: 'Academic Mentor',
      bio: '',
      focusArea: '',
      email: '',
      order: content.teamMembers.length + 1,
    });
    setIsMemberModalOpen(true);
  };

  const handleOpenEditMember = (member: TeamMember) => {
    setEditingMember({ ...member });
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !editingMember.name.trim()) return;

    setContent((prev) => {
      const existingIdx = prev.teamMembers.findIndex((m) => m.id === editingMember.id);
      let updatedList = [...prev.teamMembers];
      if (existingIdx !== -1) {
        updatedList[existingIdx] = editingMember;
      } else {
        updatedList.push(editingMember);
      }
      return {
        ...prev,
        teamMembers: updatedList,
      };
    });

    setIsMemberModalOpen(false);
    setEditingMember(null);
  };

  const handleDeleteMember = (id: string) => {
    if (window.confirm('Remove this team member from the public team roster?')) {
      setContent((prev) => ({
        ...prev,
        teamMembers: prev.teamMembers.filter((m) => m.id !== id),
      }));
    }
  };

  const handleClearAllMembers = () => {
    if (window.confirm('Delete all entries from the "The Team with a Mission" section? This will clear all team members.')) {
      setContent((prev) => ({
        ...prev,
        teamMembers: [],
      }));
    }
  };

  return (
    <div className="space-y-6" id="about-mission-admin-editor">
      {/* Top Header & Action Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black">
              <Compass className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-xl font-black font-['Outfit'] text-slate-900">
              Vision, Mission, About &amp; Team Page Editor
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Edit content that appears on the public <strong className="text-slate-700">About &amp; Mission</strong> page visible to all students, candidates, and council members.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
            title="Reset to default text"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Default</span>
          </button>

          {onNavigateToPublicPage && (
            <button
              type="button"
              onClick={onNavigateToPublicPage}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public Page</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            className={`px-5 py-2 rounded-xl text-xs font-black shadow-md transition-all flex items-center space-x-1.5 cursor-pointer ${
              isSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:from-amber-400 hover:to-amber-500'
            }`}
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Changes Saved!' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      {/* Editor Sub-Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('vision')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'vision'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-amber-600" />
          <span>1. Vision &amp; Pillars</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mission')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'mission'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-indigo-600" />
          <span>2. Mission &amp; Objectives</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'about'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          <span>3. About This App &amp; Metrics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('team')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'team'
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>4. The Team with a Mission ({content.teamMembers.length})</span>
        </button>
      </div>

      {/* TAB 1: VISION */}
      {activeTab === 'vision' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-900 font-['Outfit'] flex items-center space-x-2">
              <Target className="w-4 h-4 text-amber-600" />
              <span>Vision Section Content</span>
            </h3>
            <p className="text-xs text-slate-500">
              Set the long-term vision, core inspiring quote, and 4 educational pillars.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Vision Section Heading
              </label>
              <input
                type="text"
                value={content.visionTitle}
                onChange={(e) => setContent({ ...content, visionTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Vision Subtitle / Tagline
              </label>
              <input
                type="text"
                value={content.visionSubtitle}
                onChange={(e) => setContent({ ...content, visionSubtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Comprehensive Vision Statement
              </label>
              <textarea
                rows={4}
                value={content.visionStatement}
                onChange={(e) => setContent({ ...content, visionStatement: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 leading-relaxed focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vision Quote / Motto
                </label>
                <input
                  type="text"
                  value={content.visionQuote}
                  onChange={(e) => setContent({ ...content, visionQuote: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs italic text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quote Attribution / Author
                </label>
                <input
                  type="text"
                  value={content.visionAuthor}
                  onChange={(e) => setContent({ ...content, visionAuthor: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Vision Pillars */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                The 4 Core Pillars of Vision
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {content.visionPillars.map((pillar, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                    <span className="text-[10px] font-black text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md">
                      Pillar 0{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={pillar.title}
                      onChange={(e) => {
                        const updated = [...content.visionPillars];
                        updated[idx].title = e.target.value;
                        setContent({ ...content, visionPillars: updated });
                      }}
                      placeholder="Pillar Title"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                    />
                    <textarea
                      rows={2}
                      value={pillar.description}
                      onChange={(e) => {
                        const updated = [...content.visionPillars];
                        updated[idx].description = e.target.value;
                        setContent({ ...content, visionPillars: updated });
                      }}
                      placeholder="Pillar Description"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 bg-white leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MISSION */}
      {activeTab === 'mission' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-900 font-['Outfit'] flex items-center space-x-2">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Mission Section Content</span>
            </h3>
            <p className="text-xs text-slate-500">
              State our day-to-day mission and strategic deliverables for Sikkim STET aspirants.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mission Heading
              </label>
              <input
                type="text"
                value={content.missionTitle}
                onChange={(e) => setContent({ ...content, missionTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mission Subtitle
              </label>
              <input
                type="text"
                value={content.missionSubtitle}
                onChange={(e) => setContent({ ...content, missionSubtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mission Statement
              </label>
              <textarea
                rows={4}
                value={content.missionStatement}
                onChange={(e) => setContent({ ...content, missionStatement: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 leading-relaxed focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Mission Objectives */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Key Strategic Mission Objectives
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {content.missionObjectives.map((obj, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-2">
                    <span className="text-[10px] font-black text-indigo-800 bg-indigo-200/60 px-2 py-0.5 rounded-md">
                      Objective 0{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={obj.title}
                      onChange={(e) => {
                        const updated = [...content.missionObjectives];
                        updated[idx].title = e.target.value;
                        setContent({ ...content, missionObjectives: updated });
                      }}
                      placeholder="Objective Title"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                    />
                    <textarea
                      rows={2}
                      value={obj.description}
                      onChange={(e) => {
                        const updated = [...content.missionObjectives];
                        updated[idx].description = e.target.value;
                        setContent({ ...content, missionObjectives: updated });
                      }}
                      placeholder="Objective Description"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 bg-white leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ABOUT THIS APP & METRICS */}
      {activeTab === 'about' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-900 font-['Outfit'] flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>About This App, Story &amp; Core Metrics</span>
            </h3>
            <p className="text-xs text-slate-500">
              Share the backstory of studeezone, key stats, platform highlights, and core values.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                About App Section Heading
              </label>
              <input
                type="text"
                value={content.aboutTitle}
                onChange={(e) => setContent({ ...content, aboutTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={content.aboutSubtitle}
                onChange={(e) => setContent({ ...content, aboutSubtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                The Backstory &amp; Educational Purpose
              </label>
              <textarea
                rows={5}
                value={content.aboutStory}
                onChange={(e) => setContent({ ...content, aboutStory: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 leading-relaxed focus:ring-2 focus:ring-emerald-500 font-sans"
              />
            </div>

            {/* Key Metrics Editor */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Key Metrics Bar (4 Highlights)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {content.keyMetrics.map((metric, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <input
                      type="text"
                      value={metric.value}
                      onChange={(e) => {
                        const updated = [...content.keyMetrics];
                        updated[idx].value = e.target.value;
                        setContent({ ...content, keyMetrics: updated });
                      }}
                      placeholder="e.g. 3,000+"
                      className="w-full px-2 py-1 rounded border border-slate-300 text-xs font-black text-slate-900 bg-white"
                    />
                    <input
                      type="text"
                      value={metric.sublabel}
                      onChange={(e) => {
                        const updated = [...content.keyMetrics];
                        updated[idx].sublabel = e.target.value;
                        setContent({ ...content, keyMetrics: updated });
                      }}
                      placeholder="Sublabel"
                      className="w-full px-2 py-1 rounded border border-slate-300 text-[10px] text-slate-600 bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Features Editor */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Key Pedagogical Features
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {content.aboutFeatures.map((feat, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-1.5">
                    <input
                      type="text"
                      value={feat.title}
                      onChange={(e) => {
                        const updated = [...content.aboutFeatures];
                        updated[idx].title = e.target.value;
                        setContent({ ...content, aboutFeatures: updated });
                      }}
                      className="w-full px-2 py-1 rounded border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                    />
                    <textarea
                      rows={2}
                      value={feat.description}
                      onChange={(e) => {
                        const updated = [...content.aboutFeatures];
                        updated[idx].description = e.target.value;
                        setContent({ ...content, aboutFeatures: updated });
                      }}
                      className="w-full px-2 py-1 rounded border border-slate-300 text-xs text-slate-700 bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: THE TEAM WITH A MISSION */}
      {activeTab === 'team' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 font-['Outfit'] flex items-center space-x-2">
                <Users className="w-4 h-4 text-amber-500" />
                <span>The Team With A Mission</span>
              </h3>
              <p className="text-xs text-slate-500">
                Manage the leadership, co-founders, pedagogical mentors, and contributors shown on the public page.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              {content.teamMembers.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllMembers}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shadow-2xs"
                  id="admin-clear-all-team-btn"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete All Entries</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleOpenAddMember}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs"
                id="admin-add-team-member-btn"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Team Member</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Team Section Heading
                </label>
                <input
                  type="text"
                  value={content.teamSectionTitle}
                  onChange={(e) => setContent({ ...content, teamSectionTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={content.teamSectionSubtitle}
                  onChange={(e) => setContent({ ...content, teamSectionSubtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Introductory Note
              </label>
              <textarea
                rows={2}
                value={content.teamSectionIntro}
                onChange={(e) => setContent({ ...content, teamSectionIntro: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Team Members List */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Team Roster ({content.teamMembers.length} Members)
              </label>

              {content.teamMembers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {content.teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all shadow-2xs"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start space-x-3">
                          <div className="relative shrink-0">
                            {member.avatarUrl ? (
                              <img
                                src={member.avatarUrl}
                                alt={member.name}
                                className="w-12 h-14 rounded-xl object-cover border border-slate-300 shadow-2xs"
                              />
                            ) : (
                              <div className="w-12 h-14 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
                                {member.name.charAt(0) || '?'}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            {member.badge && (
                              <span className="text-[9px] font-black uppercase text-amber-900 bg-amber-200/80 px-1.5 py-0.5 rounded block w-fit mb-0.5">
                                {member.badge}
                              </span>
                            )}
                            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                              {member.honorific ? `${member.honorific} ` : ''}{member.name}
                            </h4>
                            <p className="text-[11px] font-semibold text-indigo-700 truncate">
                              {member.role}
                            </p>
                          </div>
                        </div>

                        {member.focusArea && (
                          <p className="text-[10px] font-bold text-slate-600 truncate">
                            Focus: {member.focusArea}
                          </p>
                        )}

                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {member.bio}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => handleOpenEditMember(member)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center space-x-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3 text-slate-600" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteMember(member.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
                    <Users className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">
                    No entries in the team roster
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    All sample team entries have been cleared. You can click "Add Team Member" above whenever you wish to add a new member profile.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Team Member Modal */}
      {isMemberModalOpen && editingMember && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900 font-['Outfit']">
                {editingMember.id && content.teamMembers.some((m) => m.id === editingMember.id)
                  ? 'Edit Team Member'
                  : 'Add New Team Member'}
              </h3>
              <button
                type="button"
                onClick={() => setIsMemberModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4">
              {/* Photo Upload for Team Member */}
              <div className="flex items-center space-x-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div
                  onClick={() => photoInputRef.current?.click()}
                  className="w-16 h-20 rounded-xl bg-white border-2 border-slate-300 overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 relative shrink-0 shadow-2xs"
                  title="Click to upload portrait"
                >
                  {editingMember.avatarUrl ? (
                    <img
                      src={editingMember.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-1 text-slate-400">
                      <Camera className="w-5 h-5 mx-auto text-slate-300" />
                      <span className="text-[8px] font-bold uppercase block mt-0.5">Photo</span>
                    </div>
                  )}
                  {isProcessingPhoto && (
                    <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center text-white">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <span className="text-xs font-extrabold text-slate-900 block">
                    Passport / Portrait Photograph
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Upload portrait photo for the member’s profile card.
                  </p>
                  <input
                    type="file"
                    ref={photoInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 cursor-pointer"
                    >
                      {editingMember.avatarUrl ? 'Change' : 'Upload'}
                    </button>
                    {editingMember.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setEditingMember({ ...editingMember, avatarUrl: '' })}
                        className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Honorific</label>
                  <select
                    value={editingMember.honorific || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, honorific: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  >
                    <option value="Dr.">Dr.</option>
                    <option value="Prof. Dr.">Prof. Dr.</option>
                    <option value="Prof.">Prof.</option>
                    <option value="Shri">Shri</option>
                    <option value="Smt.">Smt.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Mr.">Mr.</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    placeholder="e.g. Karma Bhutia"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role / Designation *</label>
                  <input
                    type="text"
                    required
                    value={editingMember.role}
                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                    placeholder="e.g. Co-Founder & Head of Pedagogy"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={editingMember.badge || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, badge: e.target.value })}
                    placeholder="e.g. Academic Leadership"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Specialization / Focus Area</label>
                <input
                  type="text"
                  value={editingMember.focusArea || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, focusArea: e.target.value })}
                  placeholder="e.g. Child Development & Pedagogy (CDP)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bio / Profile Description</label>
                <textarea
                  rows={3}
                  value={editingMember.bio}
                  onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                  placeholder="Brief background on academic credentials, institutions served, and contribution..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email (Optional)</label>
                <input
                  type="email"
                  value={editingMember.email || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                  placeholder="name@studeezone.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-xs cursor-pointer"
                >
                  Save Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
