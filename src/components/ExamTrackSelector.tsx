import React, { useState } from 'react';
import { CheckCircle2, Sparkles, GraduationCap, School, Layers, ArrowRight, Crown, CreditCard, Lock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ExamTrack, ExamTrackInfo, UserProfile } from '../types';
import { ALL_EXAM_TRACKS } from '../data/examTracks';
import { 
  isAdminUser, 
  isPaidOrAdmin, 
  canAccessExamTrack, 
  isCourseLockedForUser, 
  getSubscribedCourseTitle, 
  getUserSubscribedTrack 
} from '../utils/storage';

interface ExamTrackSelectorProps {
  currentTrackId: ExamTrack;
  onSelectTrack: (trackId: ExamTrack) => void;
  onNavigateToPractice?: () => void;
  userProfile?: UserProfile;
  onOpenSubscriptionForTrack?: (trackId: ExamTrack) => void;
}

export const ExamTrackSelector: React.FC<ExamTrackSelectorProps> = ({
  currentTrackId,
  onSelectTrack,
  onNavigateToPractice,
  userProfile,
  onOpenSubscriptionForTrack,
}) => {
  const userLower = `${userProfile?.name || ''} ${userProfile?.email || ''} ${userProfile?.loginId || ''}`.toLowerCase();
  const isSpecialCandidate = userLower.includes('asha') || userLower.includes('prasad') || userLower.includes('shanti') || userLower.includes('subba');
  const isAdmin = userProfile?.role === 'admin' || (userProfile?.email ? isAdminUser(userProfile.email) : false);
  const isLoggedIn = Boolean(userProfile && userProfile.isLoggedIn && (userProfile.email?.trim() || userProfile.loginId?.trim()) && userProfile.name !== 'Candidate Learner');
  const isPaid = isLoggedIn && (isPaidOrAdmin(userProfile) || isSpecialCandidate);
  const isPaidCandidate = isPaid && !isAdmin;
  const subscribedTrack = isSpecialCandidate ? 'gt-maths-science' : getUserSubscribedTrack(userProfile);
  const subscribedTitle = getSubscribedCourseTitle(subscribedTrack);
  const paidStreams = isSpecialCandidate ? ['gt-maths-science'] : (userProfile?.paidStreams || [subscribedTrack]);

  const [inaccessibleTrackNotice, setInaccessibleTrackNotice] = useState<string | null>(null);

  const handleTrackClick = (trackId: ExamTrack) => {
    // If user is a paid candidate and this track is not their subscribed track, it remains inaccessible
    if (isPaidCandidate && !canAccessExamTrack(userProfile, trackId)) {
      setInaccessibleTrackNotice(
        `Restricted Course Access: You are SUBSCRIBED TO- "${subscribedTitle}". You have full access to that specific course only. Rest of the courses remain inaccessible under your current plan.`
      );
      return;
    }
    setInaccessibleTrackNotice(null);
    onSelectTrack(trackId);
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4" id="exam-track-selector-box">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-['Outfit']">
                Choose Your STET Target Exam Stream
              </h2>
              {isPaidCandidate ? (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                  <Crown className="w-3 h-3 text-emerald-600" />
                  <span>Subscribed Stream Active</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  Primary Target
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {isPaidCandidate
                ? `You are SUBSCRIBED TO- "${subscribedTitle}". Full access is granted to this course only; rest of the courses remain inaccessible.`
                : 'Select your primary exam stream. Once paid, your target remains permanently selected. Changing streams allows seamless payment for your next stream.'}
            </p>
          </div>
        </div>

        {onNavigateToPractice && (
          <button
            onClick={onNavigateToPractice}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Browse Track Questions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Inaccessible Course Restriction Notice */}
      {inaccessibleTrackNotice && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-start justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{inaccessibleTrackNotice}</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                To access another stream, you may subscribe to that stream or contact the administrator to switch your registered course.
              </p>
            </div>
          </div>
          <button
            onClick={() => setInaccessibleTrackNotice(null)}
            className="text-amber-700 hover:text-amber-900 font-black p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3-Track Grid Option Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
        {ALL_EXAM_TRACKS.map((track) => {
          const isSelected = currentTrackId === track.id;
          const isAccessible = canAccessExamTrack(userProfile, track.id);
          const isTrackLocked = isCourseLockedForUser(userProfile, track.id);
          const isSubscribedCourse = isPaidCandidate && (track.id === subscribedTrack || paidStreams.includes(track.id));
          const isTrackPaid = Boolean(
            isAdmin ||
            paidStreams.includes(track.id) ||
            (userProfile?.isPaid && (!paidStreams.length && isSelected))
          );

          return (
            <div
              key={track.id}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTrackClick(track.id);
                }
              }}
              onClick={() => handleTrackClick(track.id)}
              className={`rounded-xl p-4.5 border transition-all cursor-pointer flex flex-col justify-between relative text-left select-none ${
                isTrackLocked
                  ? 'border-slate-200 bg-slate-50/70 opacity-80 hover:opacity-100 hover:border-amber-300'
                  : isSelected
                  ? 'border-indigo-600 bg-gradient-to-br from-indigo-50/70 via-white to-indigo-50/30 shadow-md ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80 bg-white shadow-2xs'
              }`}
              id={`track-card-${track.id}`}
            >
              {isSubscribedCourse ? (
                <div className="absolute top-3 right-3 flex items-center space-x-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100/95 px-2 py-0.5 rounded-full border border-emerald-300">
                  <Crown className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                  <span>Subscribed (Full Access)</span>
                </div>
              ) : isTrackLocked ? (
                <div className="absolute top-3 right-3 flex items-center space-x-1 text-[10.5px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full border border-slate-300">
                  <Lock className="w-3 h-3 text-slate-600" />
                  <span>Inaccessible</span>
                </div>
              ) : isSelected ? (
                <div className="absolute top-3 right-3 flex items-center space-x-1 text-[11px] font-bold text-indigo-700 bg-indigo-100/90 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isTrackPaid ? 'Active Target (Paid)' : 'Active Target'}</span>
                </div>
              ) : isTrackPaid ? (
                <div className="absolute top-3 right-3 flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <Crown className="w-3 h-3 text-emerald-600" />
                  <span>Paid Stream</span>
                </div>
              ) : (
                <div className="absolute top-3 right-3 flex items-center space-x-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  <span>₹499 / Stream</span>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    track.id === 'prt'
                      ? 'bg-amber-100 text-amber-800'
                      : track.id === 'gt-maths-science'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {track.badge}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                    {track.id === 'prt' ? '1,060+ Qs' : track.id === 'gt-maths-science' ? '1,150+ Qs' : '1,120+ Qs'}
                  </span>
                  {isSubscribedCourse && (
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-600 text-white shadow-2xs">
                      UNLOCKED
                    </span>
                  )}
                  {isTrackLocked && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                      LOCKED
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug">
                  {track.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {track.description}
                </p>

                {/* Subject List for this stream */}
                <div className="pt-2 border-t border-slate-100/80 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 flex items-center space-x-1">
                    <Layers className="w-3 h-3 text-slate-400" />
                    <span>Included Subjects ({track.subjects.length}):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {track.subjects.map((sub, sIdx) => (
                      <span
                        key={sIdx}
                        className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-md border ${
                          isSelected
                            ? 'bg-white border-indigo-200 text-indigo-900 shadow-2xs'
                            : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {sub.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Switch OR Locked Notice OR Pay */}
              <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
                {isTrackLocked ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTrackClick(track.id);
                    }}
                    className="w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-800 border border-slate-200"
                    id={`locked-track-btn-${track.id}`}
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Inaccessible (Rest of Courses)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTrackClick(track.id);
                    }}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 hover:border-indigo-300'
                    }`}
                    id={`switch-track-btn-${track.id}`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>{isSubscribedCourse ? 'Subscribed Target (Active)' : isTrackPaid ? 'Active Target (Paid)' : 'Active Target'}</span>
                      </>
                    ) : (
                      <>
                        <span>Select {track.shortTitle}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}

                {/* If stream is locked or not paid, show explicit option to make payment for this next stream */}
                {!isSubscribedCourse && !isAdmin && onOpenSubscriptionForTrack && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenSubscriptionForTrack(track.id);
                    }}
                    className="w-full py-1.5 px-3 rounded-lg text-[11px] font-extrabold bg-linear-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-500 text-slate-950 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs border border-amber-300"
                    id={`pay-next-stream-btn-${track.id}`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-slate-950" />
                    <span>Unlock this Stream (₹499)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
