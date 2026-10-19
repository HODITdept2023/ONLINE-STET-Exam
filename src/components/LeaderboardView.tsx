import React, { useState } from 'react';
import { 
  Users, 
  Award, 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  Medal, 
  Crown, 
  ChevronUp, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { UserProfile, LeaderboardUser } from '../types';
import { INITIAL_LEADERBOARD } from '../data/examQuestions';

interface LeaderboardViewProps {
  userProfile: UserProfile;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ userProfile }) => {
  const [filter, setFilter] = useState<'weekly' | 'allTime'>('weekly');

  // Compute live ranking for the current learner
  const learners: LeaderboardUser[] = INITIAL_LEADERBOARD.map((u) => {
    if (u.name.includes('You')) {
      return {
        ...u,
        name: `${userProfile.name} (You)`,
        score: userProfile.totalXp,
        streak: userProfile.streakDays,
        mockTestsCount: userProfile.mockTestResults.length,
        isCurrentUser: true,
      };
    }
    return u;
  }).sort((a, b) => b.score - a.score).map((item, index) => ({
    ...item,
    rank: index + 1,
  }));

  const currentUser = learners.find((l) => l.isCurrentUser) || learners[4];

  return (
    <div className="space-y-6 pb-12" id="leaderboard-view-container">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit'] flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Community Leaderboard &amp; Peer Benchmark</span>
            </h2>
            <p className="text-xs text-slate-500">
              Compare your mock test performance, study streak, and question accuracy against candidate cohorts.
            </p>
          </div>

          {/* Period Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setFilter('weekly')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filter === 'weekly' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Weekly Sprint
            </button>
            <button
              onClick={() => setFilter('allTime')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filter === 'allTime' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              All-Time Ranking
            </button>
          </div>
        </div>
      </div>

      {/* Cohort Comparison Benchmark Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-5 text-white shadow-xs">
          <div className="flex items-center justify-between text-indigo-100 text-xs font-medium">
            <span>Your Current Standing</span>
            <Crown className="w-4 h-4 text-amber-300" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-['Outfit']">Rank #{currentUser.rank}</span>
            <span className="text-xs text-indigo-200">Top 8% Cohort</span>
          </div>
          <p className="text-xs text-indigo-100/90 mt-1">
            {currentUser.score} Total Study XP • {currentUser.streak} Day Streak
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Peer Group Average Accuracy</span>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">81.4%</span>
            <span className="text-xs text-emerald-600 font-bold flex items-center">
              <ChevronUp className="w-3.5 h-3.5" /> +5.0% above cohort
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Your accuracy is {currentUser.accuracy}%</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Target Benchmark Percentile</span>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">92nd</span>
            <span className="text-xs text-indigo-600 font-bold">Percentile</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Passing cutoff for STET is 60% (~90 marks)</p>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 font-['Outfit']">
            Top STET Certification Candidates
          </h3>
          <span className="text-xs text-slate-400 font-mono">Live Updated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Study Score</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Mocks Completed</th>
                <th className="py-3 px-4">Streak</th>
                <th className="py-3 px-4">Title / Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {learners.map((learner) => {
                const isTop1 = learner.rank === 1;
                const isTop2 = learner.rank === 2;
                const isTop3 = learner.rank === 3;

                return (
                  <tr
                    key={learner.rank}
                    className={`transition-colors ${
                      learner.isCurrentUser
                        ? 'bg-indigo-50/70 font-semibold text-indigo-950'
                        : 'hover:bg-slate-50/80 text-slate-700'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold">
                      <div className="flex items-center space-x-1.5">
                        {isTop1 && <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />}
                        {isTop2 && <Medal className="w-4 h-4 text-slate-400 fill-slate-400" />}
                        {isTop3 && <Medal className="w-4 h-4 text-amber-700 fill-amber-700" />}
                        <span>#{learner.rank}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          learner.isCurrentUser
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {learner.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{learner.name}</span>
                          {learner.isCurrentUser && (
                            <span className="text-[10px] text-indigo-600 font-bold">Current Session</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-slate-900 font-mono">
                      {learner.score} XP
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-emerald-600">
                      {learner.accuracy}%
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {learner.mockTestsCount} tests
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-amber-600">
                      <span className="flex items-center">
                        <Flame className="w-3.5 h-3.5 text-amber-500 mr-1 fill-amber-500" />
                        {learner.streak}d
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        <ShieldCheck className="w-3 h-3 mr-1 text-indigo-500" />
                        {learner.badge}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
