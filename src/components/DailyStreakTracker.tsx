import React, { useState } from 'react';
import { 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Award, 
  Target, 
  BookOpen, 
  ArrowRight,
  TrendingUp,
  Info,
  Calendar
} from 'lucide-react';
import { UserProfile } from '../types';
import { 
  getWeeklyStreakDays, 
  getStreakMilestone, 
  getTodayDateString 
} from '../utils/streakTracker';

interface DailyStreakTrackerProps {
  userProfile: UserProfile;
  onNavigate: (tab: string, state?: any) => void;
  onOpenSubscription?: () => void;
}

export const DailyStreakTracker: React.FC<DailyStreakTrackerProps> = ({
  userProfile,
  onNavigate,
  onOpenSubscription,
}) => {
  const [selectedDayDetail, setSelectedDayDetail] = useState<string | null>(null);

  const streakDays = userProfile.streakDays || 0;
  const longestStreak = Math.max(userProfile.longestStreak || 0, streakDays);
  const todayStr = getTodayDateString();
  const isCompletedToday = userProfile.lastActiveDate === todayStr;
  const weeklyDays = getWeeklyStreakDays(userProfile.streakHistory, userProfile.activityLog);
  const milestone = getStreakMilestone(streakDays);

  const todayActivity = userProfile.activityLog?.[todayStr];
  const totalActiveDays = userProfile.streakHistory?.length || (streakDays > 0 ? streakDays : 0);

  return (
    <div 
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-amber-200 transition-all p-5 sm:p-6 space-y-5 relative overflow-hidden"
      id="daily-learning-streak-tracker"
    >
      {/* Subtle warm decorative glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-amber-400/10 via-orange-400/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Header Row: Title & Milestone Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-10">
        <div className="flex items-center space-x-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs transition-transform ${
            streakDays > 0 
              ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 text-white shadow-amber-500/25 animate-pulse' 
              : 'bg-slate-100 text-slate-400'
          }`}>
            <Flame className={`w-6 h-6 ${streakDays > 0 ? 'fill-white stroke-white' : ''}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 font-['Outfit'] flex items-center space-x-1.5">
                <span>Daily Learning Streak</span>
              </h2>
              {streakDays > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-amber-100 text-amber-800 border border-amber-300">
                  {streakDays} {streakDays === 1 ? 'Day' : 'Days'} In a Row
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete at least 1 mock test or practice drill daily to maintain momentum
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {isCompletedToday ? (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Goal Met Today!</span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold animate-pulse shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Active Today: Action Needed</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Metric Banner: Streak Count + 7-Day Rolling Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center pt-1 relative z-10">
        {/* Left: Prominent Streak Counter (4 columns on lg) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 border border-slate-700 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10 pointer-events-none">
            <Flame className="w-28 h-28 text-amber-400 fill-amber-400" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Consecutive Preparation</span>
            </span>
            <div className="flex items-baseline space-x-2.5">
              <span className="text-4xl sm:text-5xl font-black font-['Outfit'] text-white tracking-tight">
                {streakDays}
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-300">
                {streakDays === 1 ? 'Day' : 'Days'}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700/80 mt-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Personal Best</span>
              <span className="font-extrabold text-white text-sm">{longestStreak} {longestStreak === 1 ? 'Day' : 'Days'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Active Days</span>
              <span className="font-extrabold text-amber-300 text-sm">{totalActiveDays} Days</span>
            </div>
          </div>
        </div>

        {/* Right: 7-Day Weekly Streak Grid & Activity Overview (8 columns on lg) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          {/* Day-by-Day Visualizer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span className="flex items-center space-x-1 text-slate-700 font-bold">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Last 7 Days Rolling Activity</span>
              </span>
              <span className="text-[11px] text-slate-500">
                {isCompletedToday ? 'Streak locked in for today' : '1 session needed to keep streak'}
              </span>
            </div>

            {/* 7 Days Circles */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
              {weeklyDays.map((day) => {
                const isSelected = selectedDayDetail === day.date;
                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDayDetail(isSelected ? null : day.date)}
                    className={`flex flex-col items-center justify-between p-2 rounded-xl transition-all cursor-pointer border ${
                      day.isToday
                        ? day.isCompleted
                          ? 'bg-emerald-500/10 border-emerald-400 ring-2 ring-emerald-500/20'
                          : 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-500/30 animate-pulse'
                        : day.isCompleted
                        ? 'bg-slate-50 border-emerald-300/80 hover:bg-slate-100'
                        : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/60'
                    } ${isSelected ? 'ring-2 ring-indigo-500 border-indigo-500' : ''}`}
                    title={`${day.dayName}, ${day.date} - ${day.isCompleted ? 'Completed' : 'No Activity'}`}
                  >
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {day.dayLabel}
                    </span>

                    <div className="my-1.5 flex items-center justify-center">
                      {day.isCompleted ? (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-2xs">
                          <Flame className="w-4 h-4 fill-white" />
                        </div>
                      ) : day.isToday ? (
                        <div className="w-7 h-7 rounded-full border-2 border-dashed border-amber-500 text-amber-600 flex items-center justify-center font-bold text-xs bg-amber-50">
                          !
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center text-xs">
                          •
                        </div>
                      )}
                    </div>

                    <span className={`text-[11px] font-extrabold ${
                      day.isToday ? 'text-indigo-700' : 'text-slate-700'
                    }`}>
                      {day.dayNumber}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Day Detail or Motivational Alert */}
          {selectedDayDetail ? (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-700">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>{selectedDayDetail}:</strong>{' '}
                  {userProfile.activityLog?.[selectedDayDetail] ? (
                    <>
                      {userProfile.activityLog[selectedDayDetail].practiceCount} practice questions,{' '}
                      {userProfile.activityLog[selectedDayDetail].mockTestCount} mock tests completed (+
                      {userProfile.activityLog[selectedDayDetail].totalXpEarned} XP)
                    </>
                  ) : userProfile.streakHistory?.includes(selectedDayDetail) ? (
                    'Learning session completed on this day.'
                  ) : (
                    'No mock test or practice question completed on this date.'
                  )}
                </span>
              </div>
              <button 
                onClick={() => setSelectedDayDetail(null)}
                className="text-slate-400 hover:text-slate-600 font-bold px-1.5 py-0.5"
              >
                ✕
              </button>
            </div>
          ) : !isCompletedToday ? (
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2 text-xs text-amber-900">
                <Flame className="w-4 h-4 text-amber-600 fill-amber-600 shrink-0" />
                <span>
                  <strong>Keep your flame burning:</strong> Complete a practice drill or mock test today to advance your streak to <strong>{streakDays + 1} days</strong>!
                </span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => onNavigate('practice')}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs flex items-center space-x-1 cursor-pointer transition-colors"
                  id="streak-drill-now-btn"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Drill 1 Q</span>
                  <ArrowRight className="w-3 h-3 ml-0.5" />
                </button>
                <button
                  onClick={() => onNavigate('mock-tests')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs flex items-center space-x-1 cursor-pointer transition-colors"
                  id="streak-take-mock-btn"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Mock Test</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Streak Safe!</strong> You have satisfied your learning target for today ({todayActivity?.practiceCount || 0} practice questions, {todayActivity?.mockTestCount || 0} mock tests).
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md shrink-0">
                +{todayActivity?.totalXpEarned || 25} XP Today
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Motivational Milestone Strip */}
      <div className="border-t border-slate-100 pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-amber-500" />
          <span className="font-semibold text-slate-700">{milestone.title}:</span>
          <span className="text-slate-500 line-clamp-1">{milestone.description}</span>
        </div>
        <div className="flex items-center space-x-3 self-end sm:self-auto shrink-0">
          <button
            onClick={() => onNavigate('practice')}
            className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1 cursor-pointer"
          >
            <span>Practice Drills</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <span className="text-slate-300">•</span>
          <button
            onClick={() => onNavigate('mock-tests')}
            className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1 cursor-pointer"
          >
            <span>Interactive Tests</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
