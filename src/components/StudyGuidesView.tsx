import React, { useState, useEffect } from 'react';
import { 
  FileDown, 
  FileText, 
  Clock, 
  Check, 
  Search, 
  DownloadCloud, 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  Eye, 
  X,
  Filter
} from 'lucide-react';
import { StudyGuideItem, UserProfile, ExamTrack } from '../types';
import { STUDY_GUIDES } from '../data/examQuestions';
import { downloadStudyGuidePDF } from '../utils/pdfGenerator';

interface StudyGuidesViewProps {
  userProfile?: UserProfile;
  onOpenTutor: (contextMsg?: string) => void;
  onSelectExamTrack?: (track: ExamTrack) => void;
}

export const StudyGuidesView: React.FC<StudyGuidesViewProps> = ({ 
  userProfile, 
  onOpenTutor,
  onSelectExamTrack 
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [previewGuide, setPreviewGuide] = useState<StudyGuideItem | null>(null);

  const [selectedTrack, setSelectedTrack] = useState<ExamTrack>(
    userProfile?.selectedExamTrack || 'prt'
  );

  useEffect(() => {
    if (userProfile?.selectedExamTrack) {
      setSelectedTrack(userProfile.selectedExamTrack);
    }
  }, [userProfile?.selectedExamTrack]);

  const currentStream: ExamTrack = userProfile?.selectedExamTrack || selectedTrack;

  const filteredGuides = STUDY_GUIDES.filter((g) => {
    if (g.examTracks && !g.examTracks.includes(currentStream)) return false;
    const matchesSearch =
      g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleDownload = (guide: StudyGuideItem) => {
    setDownloadingId(guide.id);
    try {
      downloadStudyGuidePDF(guide);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setDownloadingId(null), 800);
    }
  };

  return (
    <div className="space-y-6 pb-12" id="study-guides-container">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit'] flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Study Guides &amp; Core Revision Sheets</span>
            </h2>
            <p className="text-xs text-slate-500">
              Exam-ready online revision sheets containing theorist summaries, formulas, and historical pattern mnemonics tailored to your exam stream.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search concepts, topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
              Showing revision sheets for: <strong className="font-bold">{
                currentStream === 'prt' ? 'Primary Teacher (PRT - Paper I)' :
                currentStream === 'gt-maths-science' ? 'Graduate Teacher Maths & Science (Paper II)' :
                'Graduate Teacher Humanities (Paper II)'
              }</strong>
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {filteredGuides.length} Guides Available
          </span>
        </div>
      </div>

      {/* Grid of Study Guides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredGuides.map((guide) => {
          const isDownloading = downloadingId === guide.id;

          return (
            <div
              key={guide.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs p-6 flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {guide.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" /> {guide.readMinutes} min read
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base leading-snug font-['Outfit']">
                  {guide.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {guide.summary}
                </p>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Core Inclusions
                  </span>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {guide.keyFormulasAndRules.slice(0, 2).map((item, i) => (
                      <li key={i} className="flex items-start space-x-1.5 line-clamp-1">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="truncate">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setPreviewGuide(guide)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center space-x-2 transition-colors shadow-xs cursor-pointer"
                  id={`read-online-card-btn-${guide.id}`}
                >
                  <Eye className="w-4 h-4 text-indigo-200" />
                  <span>Read Full Guide Online</span>
                </button>

                <button
                  disabled
                  className="w-full py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-medium flex items-center justify-center space-x-1.5 cursor-not-allowed opacity-75"
                  title="PDF download option is disabled"
                >
                  <DownloadCloud className="w-3.5 h-3.5 text-slate-400" />
                  <span>PDF Download Disabled</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guide Full Preview Modal */}
      {previewGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-indigo-600">{previewGuide.category}</span>
                <h3 className="text-xl font-extrabold text-slate-900 font-['Outfit']">
                  {previewGuide.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewGuide(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 italic">
              {previewGuide.summary}
            </p>

            {/* Formulas & Rules */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                1. Key Formulas &amp; Exam Rules
              </h4>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs text-slate-800">
                {previewGuide.keyFormulasAndRules.map((rule, idx) => (
                  <div key={idx} className="flex items-start space-x-2 py-0.5">
                    <span className="font-bold text-indigo-600">•</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* High Yield Points */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                2. High-Yield Historical Exam Points
              </h4>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-800">
                {previewGuide.highYieldPoints.map((pt, idx) => (
                  <div key={idx} className="flex items-start space-x-2 py-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mnemonics */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                3. Mnemonics &amp; Rapid Recall Hacks
              </h4>
              <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100 space-y-1.5 text-xs text-indigo-950 font-mono">
                {previewGuide.sampleMnemonics.map((m, idx) => (
                  <div key={idx} className="py-0.5">
                    ★ {m}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setPreviewGuide(null);
                  onOpenTutor(`I want to master the topics covered in "${previewGuide.title}".`);
                }}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI Tutor Questions on this guide</span>
              </button>

              <button
                disabled
                className="px-5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-medium flex items-center space-x-2 cursor-not-allowed opacity-75"
                title="PDF download option is disabled"
              >
                <DownloadCloud className="w-4 h-4 text-slate-400" />
                <span>PDF Download Disabled</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
