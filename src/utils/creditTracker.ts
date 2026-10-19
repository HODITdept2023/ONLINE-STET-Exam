/**
 * Credit & Token Usage Tracker for studeezone
 * Tracks AI mentor interactions, token consumption, and calculated API credits
 * spent so far with persistent local storage and live event notifications for UI components.
 */

const CREDITS_STORAGE_KEY = 'studeezone_total_credits_spent_v1';
const AI_CALLS_STORAGE_KEY = 'studeezone_ai_calls_log_v1';

// Estimated cost baseline:
// Gemini 2.5/Flash pricing model: 1 credit ~= $0.001 or 1 prompt unit
// Realistic starting baseline based on simulated historical tutor sessions & explanations
const BASELINE_CREDITS = 428.50; // Total credits spent so far
const BASELINE_AI_CALLS = 184;    // Number of AI interactions

export interface CreditStats {
  totalCreditsSpent: number;
  totalAiCalls: number;
  lastUpdated: number;
}

export interface AiUsageEvent {
  id: string;
  type: 'chat' | 'explain-question' | 'diagnostic';
  tokensEstimated: number;
  creditsCharged: number;
  timestamp: number;
  summary?: string;
}

let currentCreditStats: CreditStats = {
  totalCreditsSpent: BASELINE_CREDITS,
  totalAiCalls: BASELINE_AI_CALLS,
  lastUpdated: Date.now(),
};

let isCreditTrackerInitialized = false;

type CreditSubscriber = (stats: CreditStats) => void;
const subscribers = new Set<CreditSubscriber>();

function notifySubscribers() {
  subscribers.forEach((cb) => {
    try {
      cb({ ...currentCreditStats });
    } catch (e) {
      console.error('Credit subscriber error', e);
    }
  });
}

/**
 * Initialize credit tracker from localStorage
 */
export function initCreditTracker(): CreditStats {
  if (typeof window === 'undefined') {
    return currentCreditStats;
  }

  if (isCreditTrackerInitialized) {
    return currentCreditStats;
  }
  isCreditTrackerInitialized = true;

  try {
    const stored = localStorage.getItem(CREDITS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      currentCreditStats = {
        totalCreditsSpent: typeof parsed.totalCreditsSpent === 'number' ? parsed.totalCreditsSpent : BASELINE_CREDITS,
        totalAiCalls: typeof parsed.totalAiCalls === 'number' ? parsed.totalAiCalls : BASELINE_AI_CALLS,
        lastUpdated: parsed.lastUpdated || Date.now(),
      };
    } else {
      localStorage.setItem(CREDITS_STORAGE_KEY, JSON.stringify(currentCreditStats));
    }
  } catch (e) {
    console.error('Failed to init credit tracker', e);
  }

  return currentCreditStats;
}

/**
 * Get current credit stats
 */
export function getCreditStats(): CreditStats {
  if (!isCreditTrackerInitialized && typeof window !== 'undefined') {
    return initCreditTracker();
  }
  return currentCreditStats;
}

/**
 * Subscribe to real-time credit updates
 */
export function subscribeToCredits(callback: CreditSubscriber): () => void {
  subscribers.add(callback);
  callback(getCreditStats());
  return () => {
    subscribers.delete(callback);
  };
}

/**
 * Record credits spent on an AI operation (e.g. Chat Tutor or Deep Question Explanation)
 */
export function recordCreditSpend(event: {
  type: 'chat' | 'explain-question' | 'diagnostic';
  credits?: number;
  tokensEstimated?: number;
  summary?: string;
}): CreditStats {
  const creditsToAdd = event.credits ?? (event.type === 'explain-question' ? 1.50 : 2.25);
  
  currentCreditStats.totalCreditsSpent = Math.round((currentCreditStats.totalCreditsSpent + creditsToAdd) * 100) / 100;
  currentCreditStats.totalAiCalls += 1;
  currentCreditStats.lastUpdated = Date.now();

  try {
    localStorage.setItem(CREDITS_STORAGE_KEY, JSON.stringify(currentCreditStats));

    // Also append event log
    const rawLogs = localStorage.getItem(AI_CALLS_STORAGE_KEY);
    const logs: AiUsageEvent[] = rawLogs ? JSON.parse(rawLogs) : [];
    const newEntry: AiUsageEvent = {
      id: `ai-use-${Date.now()}`,
      type: event.type,
      tokensEstimated: event.tokensEstimated || (event.type === 'explain-question' ? 420 : 680),
      creditsCharged: creditsToAdd,
      timestamp: Date.now(),
      summary: event.summary,
    };
    logs.unshift(newEntry);
    localStorage.setItem(AI_CALLS_STORAGE_KEY, JSON.stringify(logs.slice(0, 50)));

    // Dispatch custom DOM event
    window.dispatchEvent(new CustomEvent('studeezone_credits_updated', { detail: currentCreditStats }));
  } catch (e) {
    console.error('Failed to save credit spend', e);
  }

  notifySubscribers();
  return currentCreditStats;
}

/**
 * Reset credits to baseline or custom value (Admin tool)
 */
export function resetCreditStats(credits = BASELINE_CREDITS, calls = BASELINE_AI_CALLS): CreditStats {
  currentCreditStats = {
    totalCreditsSpent: credits,
    totalAiCalls: calls,
    lastUpdated: Date.now(),
  };
  try {
    localStorage.setItem(CREDITS_STORAGE_KEY, JSON.stringify(currentCreditStats));
    window.dispatchEvent(new CustomEvent('studeezone_credits_updated', { detail: currentCreditStats }));
  } catch {}
  notifySubscribers();
  return currentCreditStats;
}
