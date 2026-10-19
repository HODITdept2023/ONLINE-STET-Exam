/**
 * Cloud Firestore Real-Time Synchronization Engine for studeezone
 * Provides seamless cross-device, cross-browser, and multi-system synchronization.
 * Changes made on any device (admin or candidate) reflect across all systems instantly.
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { ClientRecord, UserProfile, MockTestResult, ExamTrack } from '../types';
import {
  getAllClients,
  saveClients,
  loadUserProfile,
  saveUserProfile,
  CLIENTS_KEY,
  STORAGE_KEY,
  getClientAllocatedTrack,
  getSubscribedCourseTitle,
  isDummyAccount,
  isDeletedEmail
} from '../utils/storage';
import { userDataStore } from '../utils/userDataStore';

class FirestoreSyncService {
  private isInitialized = false;
  private isWritingToCloud = false;
  private activeProfileListenerUnsubscribe: (() => void) | null = null;
  private clientsListenerUnsubscribe: (() => void) | null = null;

  /**
   * Initializes real-time bidirectional listeners across all devices
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    console.log('[FirestoreSync] Initializing real-time cross-device sync...');

    try {
      // 1. Initial Cloud Bootstrap: Fetch authoritative cloud state
      await this.bootstrapCloudState();

      // 2. Attach Real-Time Listener on /clients collection
      this.attachClientsRealtimeListener();

      // 3. Attach Real-Time Listener on active User Profile
      this.attachUserProfileRealtimeListener();

      // 4. Listen for local storage profile changes to push to cloud
      window.addEventListener('studeezone_profile_updated', (e: any) => {
        const profile = e.detail?.userProfile || e.detail;
        if (profile && profile.email && !this.isWritingToCloud) {
          this.saveProfileToCloud(profile);
        }
      });

      // 5. Listen for candidate logins to bind real-time listener to active account
      window.addEventListener('studeezone_user_logged_in', (e: any) => {
        this.attachUserProfileRealtimeListener();
        if (e.detail?.email) {
          this.pullProfileFromCloud(e.detail.email);
        }
      });
    } catch (err) {
      console.warn('[FirestoreSync] Cloud bootstrap encountered an issue, operating with local fallback:', err);
    }
  }

  /**
   * Initial bootstrap: Syncs Cloud Firestore with local storage
   */
  private async bootstrapCloudState(): Promise<void> {
    try {
      const clientsRef = collection(db, 'clients');
      const snapshot = await getDocs(query(clientsRef, limit(300)));

      if (!snapshot.empty) {
        console.log(`[FirestoreSync] Loaded ${snapshot.docs.length} client records from Cloud Firestore.`);
        const cloudClients: ClientRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as ClientRecord;
          if (data && !isDummyAccount(data.name || data.email) && !isDeletedEmail(data.email)) {
            cloudClients.push(data);
          }
        });

        if (cloudClients.length > 0) {
          // Merge with local clients
          const localClients = getAllClients();
          const mergedMap = new Map<string, ClientRecord>();

          // Cloud clients are authoritative
          cloudClients.forEach((c) => {
            const key = (c.email || c.id).toLowerCase().trim();
            mergedMap.set(key, c);
          });

          // Retain local client records not yet in cloud
          localClients.forEach((lc) => {
            const key = (lc.email || lc.id).toLowerCase().trim();
            if (!mergedMap.has(key) && !isDummyAccount(lc.name || lc.email) && !isDeletedEmail(lc.email)) {
              mergedMap.set(key, lc);
              // Push to cloud in background
              this.saveClientToCloud(lc);
            }
          });

          const finalClients = Array.from(mergedMap.values());
          saveClients(finalClients, false);
          userDataStore.notify('client_updated');
        }
      } else {
        // Cloud is empty (first deployment) - seed cloud with local baseline
        console.log('[FirestoreSync] Seeding Cloud Firestore with initial candidates...');
        const initialClients = getAllClients();
        for (const client of initialClients) {
          if (!isDummyAccount(client.name || client.email) && !isDeletedEmail(client.email)) {
            await this.saveClientToCloud(client);
          }
        }
      }

      // Check active user profile
      const activeProfile = loadUserProfile();
      if (activeProfile.isLoggedIn && activeProfile.email) {
        await this.pullProfileFromCloud(activeProfile.email);
      }
    } catch (e) {
      console.warn('[FirestoreSync] Bootstrap warning:', e);
    }
  }

  /**
   * Real-time listener for the /clients collection
   * Any change made on any device triggers immediate updates across all active sessions
   */
  private attachClientsRealtimeListener(): void {
    if (this.clientsListenerUnsubscribe) {
      this.clientsListenerUnsubscribe();
    }

    try {
      const clientsRef = collection(db, 'clients');
      this.clientsListenerUnsubscribe = onSnapshot(
        clientsRef,
        (snapshot) => {
          if (snapshot.empty) return;

          const updatedClients: ClientRecord[] = [];
          snapshot.forEach((docSnap) => {
            const c = docSnap.data() as ClientRecord;
            if (c && !isDummyAccount(c.name || c.email) && !isDeletedEmail(c.email)) {
              updatedClients.push(c);
            }
          });

          if (updatedClients.length > 0) {
            // Check if active session user was updated by admin
            const currentProfile = loadUserProfile();
            const myEmail = (currentProfile.email || '').toLowerCase().trim();
            const matchedClient = updatedClients.find(
              (c) => (c.email && c.email.toLowerCase().trim() === myEmail) || (c.loginId && c.loginId.toLowerCase().trim() === myEmail)
            );

            if (matchedClient && (matchedClient.isPaid !== currentProfile.isPaid || matchedClient.targetExam !== currentProfile.targetExam)) {
              const allocatedTrack = getClientAllocatedTrack(matchedClient);
              const refreshedProfile: UserProfile = {
                ...currentProfile,
                isPaid: matchedClient.isPaid ?? currentProfile.isPaid,
                targetExam: matchedClient.targetExam || currentProfile.targetExam,
                selectedExamTrack: allocatedTrack,
                paidStreams: matchedClient.paidStreams || [allocatedTrack],
                trialDaysRemaining: matchedClient.trialDaysRemaining ?? currentProfile.trialDaysRemaining,
              };
              saveUserProfile(refreshedProfile);
            }

            saveClients(updatedClients, false);
            userDataStore.notify('client_updated');
          }
        },
        (error) => {
          console.warn('[FirestoreSync] Realtime clients listener error:', error);
        }
      );
    } catch (err) {
      console.warn('[FirestoreSync] Could not attach clients listener:', err);
    }
  }

  /**
   * Real-time listener for the logged-in candidate profile
   */
  attachUserProfileRealtimeListener(): void {
    if (this.activeProfileListenerUnsubscribe) {
      this.activeProfileListenerUnsubscribe();
      this.activeProfileListenerUnsubscribe = null;
    }

    const profile = loadUserProfile();
    if (!profile.isLoggedIn || !profile.email) return;

    const docId = profile.email.toLowerCase().trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const profileDocRef = doc(db, 'profiles', docId);

    try {
      this.activeProfileListenerUnsubscribe = onSnapshot(
        profileDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const cloudData = docSnap.data() as UserProfile;
            const current = loadUserProfile();

            // Only update if cloud has newer XP or different subscription
            if (
              cloudData.isPaid !== current.isPaid ||
              cloudData.selectedExamTrack !== current.selectedExamTrack ||
              (cloudData.totalXp || 0) > (current.totalXp || 0)
            ) {
              const merged: UserProfile = {
                ...current,
                ...cloudData,
                totalXp: Math.max(cloudData.totalXp || 0, current.totalXp || 0),
                streakDays: Math.max(cloudData.streakDays || 0, current.streakDays || 0),
              };
              saveUserProfile(merged);
              userDataStore.notify('profile_updated');
            }
          }
        },
        (err) => {
          console.warn('[FirestoreSync] Profile listener error:', err);
        }
      );
    } catch (e) {
      console.warn('[FirestoreSync] Failed to attach profile listener:', e);
    }
  }

  /**
   * Saves or updates a client record in Cloud Firestore
   */
  async saveClientToCloud(client: ClientRecord): Promise<void> {
    if (!client || !client.id) return;
    try {
      const docId = client.id.trim();
      const clientDocRef = doc(db, 'clients', docId);
      await setDoc(clientDocRef, {
        ...client,
        updatedAt: Date.now(),
      }, { merge: true });
    } catch (e) {
      console.warn('[FirestoreSync] Failed to save client to Firestore:', e);
    }
  }

  /**
   * Saves the candidate profile to Cloud Firestore
   */
  async saveProfileToCloud(profile: UserProfile): Promise<void> {
    if (!profile || !profile.email) return;
    try {
      this.isWritingToCloud = true;
      const docId = profile.email.toLowerCase().trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      const profileDocRef = doc(db, 'profiles', docId);

      await setDoc(profileDocRef, {
        ...profile,
        updatedAt: Date.now(),
      }, { merge: true });
    } catch (e) {
      console.warn('[FirestoreSync] Failed to save profile to Firestore:', e);
    } finally {
      this.isWritingToCloud = false;
    }
  }

  /**
   * Pulls the latest profile from Cloud Firestore for a given email
   */
  async pullProfileFromCloud(email: string): Promise<UserProfile | null> {
    if (!email) return null;
    try {
      const docId = email.toLowerCase().trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      const profileDocRef = doc(db, 'profiles', docId);
      const docSnap = await getDoc(profileDocRef);

      if (docSnap.exists()) {
        const cloudProfile = docSnap.data() as UserProfile;
        const current = loadUserProfile();
        const merged: UserProfile = {
          ...current,
          ...cloudProfile,
          isLoggedIn: true,
          email: cloudProfile.email || email,
        };
        saveUserProfile(merged);
        userDataStore.notify('profile_updated');
        return merged;
      }
      return null;
    } catch (e) {
      console.warn('[FirestoreSync] Failed to pull profile:', e);
      return null;
    }
  }

  /**
   * Records a completed mock test attempt to Cloud Firestore
   */
  async recordTestAttemptToCloud(result: MockTestResult, userEmail: string): Promise<void> {
    if (!result || !userEmail) return;
    try {
      const attemptId = `attempt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const attemptDocRef = doc(db, 'attempts', attemptId);
      await setDoc(attemptDocRef, {
        id: attemptId,
        userEmail: userEmail.toLowerCase().trim(),
        testId: result.mockTestId || result.id || 'stet-mock-test',
        title: result.title || 'STET Mock Test',
        score: result.score || 0,
        totalQuestions: result.totalQuestions || 150,
        accuracy: result.accuracy || 0,
        passed: (result.accuracy || 0) >= 60,
        timeTakenSeconds: result.timeTakenSeconds || 0,
        timestamp: Date.now(),
      });
      console.log('[FirestoreSync] Mock test attempt recorded to Cloud Firestore.');
    } catch (e) {
      console.warn('[FirestoreSync] Failed to record test attempt to Firestore:', e);
    }
  }

  /**
   * Force Global Sync:
   * 1. Clears local cache for questions and user profile data.
   * 2. Clears browser CacheStorage (Workbox caches).
   * 3. Triggers a fresh, authoritative deep-fetch from Cloud Firestore for:
   *    - /clients collection (all candidate accounts and allocations)
   *    - /profiles/{id} document (authoritative user profile and subscription status)
   *    - /questions collection (custom and cloud-synced question bank)
   * 4. Synchronizes and updates local storage and notifies all subscribers.
   */
  async forceGlobalSync(): Promise<{
    success: boolean;
    message: string;
    clientsCount: number;
    profileSynced: boolean;
    questionsCount: number;
    timestamp: string;
  }> {
    console.log('[FirestoreSync] Starting Force Global Sync: clearing caches and deep-fetching from Firestore...');

    // 1. Clear local cache for questions
    const questionCacheKeys = [
      'studeezone_custom_question_bank',
      'studeezone_questions_cache',
      'studeezone_filtered_questions',
      'studeezone_questions_meta',
      'studeezone_practice_cache',
      'studeezone_cached_paper_prt',
      'studeezone_cached_paper_gt_stem',
      'studeezone_cached_paper_gt_hum',
    ];

    try {
      questionCacheKeys.forEach((k) => localStorage.removeItem(k));
      console.log('[FirestoreSync] Cleared question cache keys from localStorage.');
    } catch (e) {
      console.warn('[FirestoreSync] Failed removing question cache keys:', e);
    }

    // 2. Clear browser CacheStorage (Workbox & Service Worker cached API responses)
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cacheKeys = await window.caches.keys();
        await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
        console.log(`[FirestoreSync] Wiped ${cacheKeys.length} browser CacheStorage partitions.`);
      } catch (cacheErr) {
        console.warn('[FirestoreSync] Browser cache wipe warning:', cacheErr);
      }
    }

    // 3. Clear temporary profile counters and sync timestamps
    const currentProfile = loadUserProfile();
    try {
      localStorage.removeItem('studeezone_sync_timestamp');
      localStorage.removeItem('studeezone_temp_session');
    } catch {}

    let clientsCount = 0;
    let profileSynced = false;
    let cloudQuestionsCount = 0;

    // 4. Fresh Deep-Fetch from Cloud Firestore
    try {
      // 4a. Deep-fetch /clients collection
      const clientsRef = collection(db, 'clients');
      const clientsSnapshot = await getDocs(query(clientsRef, limit(500)));

      const freshClients: ClientRecord[] = [];
      if (!clientsSnapshot.empty) {
        clientsSnapshot.forEach((docSnap) => {
          const c = docSnap.data() as ClientRecord;
          if (c && !isDummyAccount(c.name || c.email) && !isDeletedEmail(c.email)) {
            freshClients.push(c);
          }
        });
      }

      // Reconcile with server /api/clients to ensure 100% parity
      try {
        const res = await fetch(`/api/clients?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        });
        if (res.ok) {
          const apiData = await res.json();
          if (Array.isArray(apiData.clients)) {
            const clientMap = new Map<string, ClientRecord>();
            freshClients.forEach((fc) => clientMap.set((fc.email || fc.id).toLowerCase().trim(), fc));
            apiData.clients.forEach((ac: ClientRecord) => {
              if (ac && !isDummyAccount(ac.name || ac.email) && !isDeletedEmail(ac.email)) {
                const key = (ac.email || ac.id).toLowerCase().trim();
                if (!clientMap.has(key)) {
                  clientMap.set(key, ac);
                }
              }
            });
            freshClients.splice(0, freshClients.length, ...Array.from(clientMap.values()));
          }
        }
      } catch (apiErr) {
        console.warn('[FirestoreSync] Parity fetch from /api/clients failed:', apiErr);
      }

      if (freshClients.length > 0) {
        saveClients(freshClients, false);
        clientsCount = freshClients.length;
        userDataStore.notify('client_updated');
      }

      // 4b. Deep-fetch user profile from Firestore /profiles/{id}
      if (currentProfile.isLoggedIn && currentProfile.email) {
        const docId = currentProfile.email.toLowerCase().trim().replace(/[^a-zA-Z0-9_-]/g, '_');
        const profileDocRef = doc(db, 'profiles', docId);
        const profileSnap = await getDoc(profileDocRef);

        if (profileSnap.exists()) {
          const cloudProfile = profileSnap.data() as UserProfile;
          const matchedClient = freshClients.find(
            (c) =>
              (c.email && c.email.toLowerCase().trim() === currentProfile.email!.toLowerCase().trim()) ||
              (c.loginId && c.loginId.toLowerCase().trim() === currentProfile.email!.toLowerCase().trim())
          );

          const allocatedTrack = matchedClient
            ? getClientAllocatedTrack(matchedClient)
            : cloudProfile.selectedExamTrack || currentProfile.selectedExamTrack;

          const mergedProfile: UserProfile = {
            ...currentProfile,
            ...cloudProfile,
            isPaid: matchedClient?.isPaid ?? cloudProfile.isPaid ?? currentProfile.isPaid,
            targetExam: matchedClient?.targetExam || cloudProfile.targetExam || currentProfile.targetExam,
            selectedExamTrack: allocatedTrack,
            paidStreams: matchedClient?.paidStreams || cloudProfile.paidStreams || currentProfile.paidStreams || [allocatedTrack],
            trialDaysRemaining: matchedClient?.trialDaysRemaining ?? cloudProfile.trialDaysRemaining ?? currentProfile.trialDaysRemaining,
            totalXp: Math.max(cloudProfile.totalXp || 0, currentProfile.totalXp || 0),
            streakDays: Math.max(cloudProfile.streakDays || 0, currentProfile.streakDays || 0),
          };

          saveUserProfile(mergedProfile);
          profileSynced = true;
          userDataStore.notify('profile_updated');
        } else {
          // If no profile document in Firestore yet, seed it from authoritative client record
          const matchedClient = freshClients.find(
            (c) =>
              (c.email && c.email.toLowerCase().trim() === currentProfile.email!.toLowerCase().trim()) ||
              (c.loginId && c.loginId.toLowerCase().trim() === currentProfile.email!.toLowerCase().trim())
          );
          if (matchedClient) {
            const allocatedTrack = getClientAllocatedTrack(matchedClient);
            const refreshed: UserProfile = {
              ...currentProfile,
              isPaid: matchedClient.isPaid ?? currentProfile.isPaid,
              targetExam: matchedClient.targetExam || currentProfile.targetExam,
              selectedExamTrack: allocatedTrack,
              paidStreams: matchedClient.paidStreams || [allocatedTrack],
              trialDaysRemaining: matchedClient.trialDaysRemaining ?? currentProfile.trialDaysRemaining,
            };
            saveUserProfile(refreshed);
            await this.saveProfileToCloud(refreshed);
            profileSynced = true;
            userDataStore.notify('profile_updated');
          }
        }
      }

      // 4c. Deep-fetch /questions collection from Cloud Firestore
      try {
        const questionsRef = collection(db, 'questions');
        const questionsSnap = await getDocs(query(questionsRef, limit(500)));
        if (!questionsSnap.empty) {
          const cloudQuestions: any[] = [];
          questionsSnap.forEach((qd) => {
            const q = qd.data();
            if (q && q.id && q.question) {
              cloudQuestions.push(q);
            }
          });
          if (cloudQuestions.length > 0) {
            cloudQuestionsCount = cloudQuestions.length;
            localStorage.setItem('studeezone_custom_question_bank', JSON.stringify(cloudQuestions));
            window.dispatchEvent(new CustomEvent('studeezone_questions_restored', { detail: cloudQuestions }));
          }
        }
      } catch (qErr) {
        console.warn('[FirestoreSync] Cloud questions collection read:', qErr);
      }

      // Re-fetch questions from server restore file if available
      try {
        const qRes = await fetch(`/api/questions?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        });
        if (qRes.ok) {
          const qData = await qRes.json();
          if (Array.isArray(qData.questions) && qData.questions.length > 0) {
            cloudQuestionsCount = Math.max(cloudQuestionsCount, qData.questions.length);
            localStorage.setItem('studeezone_custom_question_bank', JSON.stringify(qData.questions));
            window.dispatchEvent(new CustomEvent('studeezone_questions_restored', { detail: qData.questions }));
          }
        }
      } catch {}

      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      localStorage.setItem('studeezone_sync_timestamp', new Date().toISOString());

      // Broadcast global sync completed event
      const syncDetail = {
        success: true,
        clientsCount,
        profileSynced,
        questionsCount: cloudQuestionsCount,
        timestamp,
        message: `Global Sync Succeeded: Cleared local question & profile caches, deep-fetched ${clientsCount} candidate accounts, and unified profile state across all systems.`,
      };

      window.dispatchEvent(new CustomEvent('studeezone_global_synced', { detail: syncDetail }));
      window.dispatchEvent(new CustomEvent('studeezone_force_sync_completed', { detail: syncDetail }));

      return {
        success: true,
        message: syncDetail.message,
        clientsCount,
        profileSynced,
        questionsCount: cloudQuestionsCount,
        timestamp,
      };
    } catch (err: any) {
      console.error('[FirestoreSync] Force Global Sync error:', err);
      const fallbackTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        success: false,
        message: err?.message || 'Global Sync encountered a network interruption.',
        clientsCount,
        profileSynced,
        questionsCount: cloudQuestionsCount,
        timestamp: fallbackTime,
      };
    }
  }
}

export const firestoreSyncService = new FirestoreSyncService();
