import { UserProfile, DailyStreakActivity } from '../types';

/**
 * Returns date formatted as YYYY-MM-DD in local time
 */
export function formatDateToISO(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's YYYY-MM-DD
 */
export function getTodayDateString(): string {
  return formatDateToISO(new Date());
}

/**
 * Returns yesterday's YYYY-MM-DD
 */
export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDateToISO(d);
}

/**
 * Calculate difference in calendar days between two YYYY-MM-DD strings
 */
export function getDaysDifference(dateStrA: string, dateStrB: string): number {
  const [y1, m1, d1] = dateStrA.split('-').map(Number);
  const [y2, m2, d2] = dateStrB.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

/**
 * Calculates current consecutive streak days from a sorted history of active dates
 */
export function computeConsecutiveStreak(history: string[] = []): number {
  if (!history || history.length === 0) return 0;
  
  const uniqueDates = Array.from(new Set(history)).sort();
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  
  const lastActive = uniqueDates[uniqueDates.length - 1];
  
  // If the last active day was neither today nor yesterday, streak has broken
  if (lastActive !== today && lastActive !== yesterday) {
    return 0;
  }
  
  let streak = 0;
  let expectedDate = new Date();
  
  // If user hasn't studied today yet, streak was active through yesterday
  if (lastActive === yesterday) {
    expectedDate.setDate(expectedDate.getDate() - 1);
  }
  
  for (let i = uniqueDates.length - 1; i >= 0; i--) {
    const checkDateStr = formatDateToISO(expectedDate);
    if (uniqueDates.includes(checkDateStr)) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Records a learning activity (Mock Test or Practice Question session)
 * and updates the UserProfile streak state accordingly.
 */
export function recordLearningActivity(
  prev: UserProfile,
  type: 'mock_test' | 'practice_session',
  count: number = 1,
  xpGain: number = 0
): UserProfile {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  
  const prevHistory = prev.streakHistory ? [...prev.streakHistory] : [];
  const prevActivityLog = prev.activityLog ? { ...prev.activityLog } : {};
  
  const wasAlreadyActiveToday = prev.lastActiveDate === today;
  let newStreak = prev.streakDays || 0;

  if (!wasAlreadyActiveToday) {
    if (prev.lastActiveDate === yesterday) {
      // Consecutive streak continued!
      newStreak = (prev.streakDays || 0) + 1;
    } else {
      // First day or streak restarted
      newStreak = 1;
    }
    prevHistory.push(today);
  }

  // Ensure unique sorted history
  const uniqueHistory = Array.from(new Set(prevHistory)).sort();
  const longestStreak = Math.max(prev.longestStreak || 0, newStreak);

  // Update today's detailed activity log
  const existingTodayLog: DailyStreakActivity = prevActivityLog[today] || {
    date: today,
    practiceCount: 0,
    mockTestCount: 0,
    totalXpEarned: 0,
    lastCompletedAt: Date.now(),
  };

  const updatedTodayLog: DailyStreakActivity = {
    ...existingTodayLog,
    practiceCount: existingTodayLog.practiceCount + (type === 'practice_session' ? count : 0),
    mockTestCount: existingTodayLog.mockTestCount + (type === 'mock_test' ? count : 0),
    totalXpEarned: existingTodayLog.totalXpEarned + xpGain,
    lastCompletedAt: Date.now(),
  };

  prevActivityLog[today] = updatedTodayLog;

  return {
    ...prev,
    streakDays: newStreak,
    longestStreak,
    lastActiveDate: today,
    lastActivityType: type,
    streakHistory: uniqueHistory,
    activityLog: prevActivityLog,
  };
}

/**
 * Validates and synchronizes the streak state when the app is initialized or profile is loaded.
 * Ensures the streak counter reflects whether the user studied today or yesterday.
 */
export function syncProfileStreakOnLoad(profile: UserProfile): UserProfile {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  if (!profile.lastActiveDate) {
    // If no last active date, but streakDays was set (e.g. initial demo), seed with today or 0
    if (profile.streakDays > 0) {
      return {
        ...profile,
        lastActiveDate: today,
        streakHistory: [today],
        longestStreak: Math.max(profile.longestStreak || 0, profile.streakDays),
      };
    }
    return profile;
  }

  // If lastActiveDate is before yesterday, streak is broken
  const diffDays = getDaysDifference(profile.lastActiveDate, today);
  if (diffDays > 1) {
    return {
      ...profile,
      streakDays: 0,
    };
  }

  return profile;
}

export interface DayStreakStatus {
  date: string; // YYYY-MM-DD
  dayLabel: string; // "M", "T", "W"
  dayName: string; // "Mon", "Tue"
  dayNumber: number; // 15
  isToday: boolean;
  isCompleted: boolean;
  practiceCount: number;
  mockTestCount: number;
  status: 'completed' | 'today-completed' | 'today-pending' | 'missed' | 'future';
}

/**
 * Returns the rolling last 7 days window for the dashboard streak visualizer
 */
export function getWeeklyStreakDays(
  streakHistory: string[] = [],
  activityLog: Record<string, DailyStreakActivity> = {}
): DayStreakStatus[] {
  const result: DayStreakStatus[] = [];
  const todayStr = getTodayDateString();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = formatDateToISO(d);
    const dayOfWeek = d.getDay();
    const isToday = dateStr === todayStr;
    const isCompleted = streakHistory.includes(dateStr);
    const activity = activityLog[dateStr];

    let status: DayStreakStatus['status'] = 'missed';
    if (isToday) {
      status = isCompleted ? 'today-completed' : 'today-pending';
    } else if (isCompleted) {
      status = 'completed';
    } else {
      status = 'missed';
    }

    result.push({
      date: dateStr,
      dayLabel: dayLetters[dayOfWeek],
      dayName: daysOfWeek[dayOfWeek],
      dayNumber: d.getDate(),
      isToday,
      isCompleted,
      practiceCount: activity?.practiceCount || 0,
      mockTestCount: activity?.mockTestCount || 0,
      status,
    });
  }

  return result;
}

/**
 * Returns streak milestone rewards and motivational messaging
 */
export function getStreakMilestone(streakDays: number) {
  if (streakDays >= 30) {
    return {
      title: 'STET Champion',
      badgeColor: 'from-amber-500 to-rose-500',
      description: '30+ Days of consistent daily preparation. Exam readiness is at peak!',
      nextMilestone: 50,
      icon: 'trophy',
    };
  }
  if (streakDays >= 14) {
    return {
      title: 'Fortnight Master',
      badgeColor: 'from-indigo-600 to-purple-600',
      description: '14+ Days uninterrupted. Deep neural retention & exam stamina established.',
      nextMilestone: 30,
      icon: 'medal',
    };
  }
  if (streakDays >= 7) {
    return {
      title: 'Weekly Warrior',
      badgeColor: 'from-emerald-500 to-teal-600',
      description: '7 Days strong! A full week of consecutive teacher eligibility prep completed.',
      nextMilestone: 14,
      icon: 'sparkles',
    };
  }
  if (streakDays >= 3) {
    return {
      title: 'Consistent Aspirant',
      badgeColor: 'from-amber-500 to-orange-500',
      description: '3 Days in a row! Momentum is building across pedagogical subjects.',
      nextMilestone: 7,
      icon: 'flame',
    };
  }
  if (streakDays === 2) {
    return {
      title: 'Momentum Builder',
      badgeColor: 'from-blue-500 to-indigo-500',
      description: 'Day 2 complete! Great job maintaining your daily practice habit.',
      nextMilestone: 3,
      icon: 'flame',
    };
  }
  if (streakDays === 1) {
    return {
      title: 'Ignition Day',
      badgeColor: 'from-slate-600 to-slate-800',
      description: 'Day 1 started! Complete a mock test or practice question tomorrow to keep the flame burning.',
      nextMilestone: 3,
      icon: 'flame',
    };
  }
  return {
    title: 'Ready to Ignite',
    badgeColor: 'from-slate-500 to-slate-700',
    description: 'Solve 1 practice question or complete a mock test today to start your consecutive streak!',
    nextMilestone: 1,
    icon: 'flame',
  };
}
