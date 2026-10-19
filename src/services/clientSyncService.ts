import { ClientRecord, RegisteredUser, UserProfile, ExamTrack } from '../types';
import {
  CLIENTS_KEY,
  REGISTERED_USERS_KEY,
  STORAGE_KEY,
  isDummyAccount,
  isDeletedEmail,
  isAdminUser,
  isProtectedAdminEmail,
  getClientAllocatedTrack,
  getSubscribedCourseTitle,
  getExamTrackFromTarget,
  DEFAULT_USER_PROFILE,
  getAllClients,
  getRegisteredUsers
} from '../utils/storage';
import { collection, doc, setDoc, getDocs, query, limit } from 'firebase/firestore';
import { db } from './firebase';
import { firestoreSyncService } from './firestoreSyncService';

export interface SyncResult {
  success: boolean;
  clients: ClientRecord[];
  users: RegisteredUser[];
  count: number;
  message: string;
}

/**
 * Dedicated Modular Synchronization Service for studeezone
 * Authoritative cloud & local state sync across all browsers, PCs, and sessions.
 */
class ClientSyncService {
  private isSyncing = false;
  private lastSyncTimestamp = 0;

  /**
   * Fetches the authoritative client list directly from server without cache
   */
  async fetchServerClients(): Promise<ClientRecord[]> {
    // 1. Authoritative Cloud Firestore first
    try {
      const snap = await getDocs(query(collection(db, 'clients'), limit(500)));
      if (!snap.empty) {
        const cloudClients: ClientRecord[] = [];
        snap.forEach((d) => {
          const item = d.data() as ClientRecord;
          if (item && !isDummyAccount(item.name || item.email) && !isDeletedEmail(item.email)) {
            cloudClients.push(item);
          }
        });
        if (cloudClients.length > 0) {
          return cloudClients;
        }
      }
    } catch (e) {
      console.warn('[ClientSyncService] Cloud Firestore read warning, falling back to server API:', e);
    }

    // 2. Fallback to /api/clients
    try {
      const res = await fetch('/api/clients?t=' + Date.now(), {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.clients) ? data.clients : [];
    } catch (e) {
      console.warn('[ClientSyncService] fetchServerClients failed:', e);
      return [];
    }
  }

  /**
   * Fetches the authoritative user list directly from server without cache
   */
  async fetchServerUsers(): Promise<RegisteredUser[]> {
    try {
      const res = await fetch('/api/users?t=' + Date.now(), {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.users) ? data.users : [];
    } catch (e) {
      console.warn('[ClientSyncService] fetchServerUsers failed:', e);
      return [];
    }
  }

  /**
   * Reads clients currently stored in browser localStorage
   */
  getLocalClients(): ClientRecord[] {
    try {
      const raw = localStorage.getItem(CLIENTS_KEY);
      if (!raw) return getAllClients();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) return getAllClients();
      return parsed.filter(
        (c) =>
          !isDummyAccount(c.name || c.email) &&
          !isDeletedEmail(c.email) &&
          !isDeletedEmail(c.loginId) &&
          !isDeletedEmail(c.id) &&
          !isDeletedEmail(c.name)
      );
    } catch {
      return getAllClients();
    }
  }

  /**
   * Reads users currently stored in browser localStorage
   */
  getLocalUsers(): RegisteredUser[] {
    try {
      const raw = localStorage.getItem(REGISTERED_USERS_KEY);
      if (!raw) return getRegisteredUsers();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) return getRegisteredUsers();
      return parsed.filter(
        (u) =>
          !isDummyAccount(u.name || u.email) &&
          !isDeletedEmail(u.email) &&
          !isDeletedEmail(u.loginId) &&
          !isDeletedEmail(u.id) &&
          !isDeletedEmail(u.name)
      );
    } catch {
      return getRegisteredUsers();
    }
  }

  /**
   * Primary bidirectional sync method:
   * 1. Fetches cloud server state
   * 2. Takes union with local storage (ensuring no clients created on other PCs are lost)
   * 3. Reconciles course tracks & paid status
   * 4. Pushes union to server
   * 5. Saves to localStorage and dispatches events
   * 6. Automatically updates active logged-in candidate profile
   */
  async syncAll(): Promise<SyncResult> {
    if (this.isSyncing) {
      const current = this.getLocalClients();
      return {
        success: true,
        clients: current,
        users: this.getLocalUsers(),
        count: current.length,
        message: 'Sync already in progress',
      };
    }

    this.isSyncing = true;
    try {
      // 1. Fetch cloud records and tombstoned deleted emails
      const [serverClients, serverUsers] = await Promise.all([
        this.fetchServerClients(),
        this.fetchServerUsers(),
      ]);

      const localClients = this.getLocalClients();
      const localUsers = this.getLocalUsers();

      // 2. Build authoritative client map
      const clientMap = new Map<string, ClientRecord>();

      // Seed with server clients first
      serverClients.forEach((sc) => {
        if (
          !isDummyAccount(sc.name || sc.email) &&
          !isDeletedEmail(sc.email) &&
          !isDeletedEmail(sc.loginId) &&
          !isDeletedEmail(sc.id) &&
          !isDeletedEmail(sc.name)
        ) {
          const key = (sc.email || sc.id || '').toLowerCase().trim();
          if (key) {
            clientMap.set(key, { ...sc });
          }
        }
      });

      // Merge local clients
      localClients.forEach((lc) => {
        if (
          !isDummyAccount(lc.name || lc.email) &&
          !isDeletedEmail(lc.email) &&
          !isDeletedEmail(lc.loginId) &&
          !isDeletedEmail(lc.id) &&
          !isDeletedEmail(lc.name)
        ) {
          const key = (lc.email || lc.id || '').toLowerCase().trim();
          if (!key) return;

          const existing = clientMap.get(key);
          if (!existing) {
            clientMap.set(key, { ...lc });
          } else {
            // Authoritative server-first reconciliation with timestamp protection:
            const lcUpdated = Number(lc.updatedAt || 0);
            const serverUpdated = Number(existing.updatedAt || 0);
            const isLocalNewer = lcUpdated > serverUpdated && lcUpdated > 0;

            // Never downgrade isPaid or status on passive device sync
            const resolvedIsPaid = isLocalNewer ? Boolean(lc.isPaid) : Boolean(existing.isPaid || lc.isPaid);
            const resolvedStatus = resolvedIsPaid ? 'active' : ((isLocalNewer ? lc.status : existing.status) || 'trial');

            const resolvedTrack = (existing.paidStreams && existing.paidStreams.length > 0)
              ? existing.paidStreams
              : (lc.paidStreams && lc.paidStreams.length > 0)
              ? lc.paidStreams
              : [getClientAllocatedTrack(existing)];

            clientMap.set(key, {
              ...existing,
              ...(isLocalNewer ? lc : {}),
              isPaid: resolvedIsPaid,
              status: resolvedStatus,
              paidStreams: resolvedTrack,
              selectedExamTrack: existing.selectedExamTrack || lc.selectedExamTrack || resolvedTrack[0],
              targetExam: existing.targetExam || lc.targetExam || getSubscribedCourseTitle(resolvedTrack[0]),
              selectedStream: existing.selectedStream || lc.selectedStream,
              trialDaysRemaining: Math.max(existing.trialDaysRemaining ?? 0, lc.trialDaysRemaining ?? 0, 7),
              notes: existing.notes || lc.notes,
              updatedAt: Math.max(serverUpdated, lcUpdated),
            });
          }
        }
      });

      // Ensure Master Admins exist and have correct privileges
      const ensureAdmin = (email: string, phone: string, name: string) => {
        const key = email.toLowerCase().trim();
        const existing = clientMap.get(key);
        const adminTrack: ExamTrack[] = ['prt', 'gt-maths-science', 'gt-humanities'];
        if (existing) {
          clientMap.set(key, {
            ...existing,
            role: 'admin',
            isPaid: true,
            status: 'active',
            password: existing.password || phone,
            phone: existing.phone || phone,
            paidStreams: adminTrack,
            trialDaysRemaining: 365,
          });
        } else {
          clientMap.set(key, {
            id: `client-${key.split('@')[0]}`,
            name,
            email,
            loginId: email,
            phone,
            password: phone,
            role: 'admin',
            status: 'active',
            isPaid: true,
            paidStreams: adminTrack,
            targetExam: 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)',
            trialDaysRemaining: 365,
            registeredAt: Date.now() - 30 * 86400000,
            lastLoginAt: Date.now(),
            testsCompleted: 50,
            avgScore: 98,
            notes: 'Master Administrator Account',
          });
        }
      };

      ensureAdmin('vsfintech@gmail.com', '+91 98765 43210', 'studeezone Administrator');
      ensureAdmin('studeezoneapp@gmail.com', '9876543210', 'studeezone Administrator');

      const mergedClients = Array.from(clientMap.values());

      // 3. Build authoritative users map
      const userMap = new Map<string, RegisteredUser>();

      serverUsers.forEach((su) => {
        if (!isDummyAccount(su.name || su.email) && !isDeletedEmail(su.email) && !isDeletedEmail(su.loginId)) {
          const key = (su.email || su.id || '').toLowerCase().trim();
          if (key) userMap.set(key, { ...su });
        }
      });

      localUsers.forEach((lu) => {
        if (!isDummyAccount(lu.name || lu.email) && !isDeletedEmail(lu.email) && !isDeletedEmail(lu.loginId)) {
          const key = (lu.email || lu.id || '').toLowerCase().trim();
          if (!key) return;
          const existing = userMap.get(key);
          if (!existing) {
            userMap.set(key, { ...lu });
          } else {
            userMap.set(key, { ...existing, ...lu });
          }
        }
      });

      // Synchronize clients into users so every client can sign in
      mergedClients.forEach((c) => {
        const key = (c.email || '').toLowerCase().trim();
        if (!key) return;
        const existing = userMap.get(key);
        const userTrack: ExamTrack[] = (c.paidStreams && c.paidStreams.length > 0)
          ? c.paidStreams
          : [getClientAllocatedTrack(c)];

        if (!existing) {
          userMap.set(key, {
            id: `user-${c.id}`,
            name: c.name,
            email: c.email,
            loginId: c.loginId || c.email,
            phone: c.phone,
            password: c.password || c.phone || '9876543210',
            authProvider: 'password',
            role: c.role || 'candidate',
            targetExam: c.targetExam || getSubscribedCourseTitle(userTrack[0]),
            selectedExamTrack: userTrack[0],
            createdAt: c.registeredAt || Date.now(),
            status: c.status || 'trial',
            isPaid: Boolean(c.isPaid),
            paidStreams: userTrack,
            trialExpiresAt: Date.now() + (c.trialDaysRemaining || 7) * 86400000,
            lastLoginAt: c.lastLoginAt || Date.now(),
            testsCompleted: c.testsCompleted || 0,
            avgScore: c.avgScore || 0,
          });
        } else {
          userMap.set(key, {
            ...existing,
            name: c.name || existing.name,
            phone: c.phone || existing.phone,
            password: c.password || existing.password || c.phone,
            isPaid: c.isPaid !== undefined ? c.isPaid : existing.isPaid,
            status: c.status || existing.status,
            paidStreams: userTrack,
            selectedExamTrack: c.selectedExamTrack || existing.selectedExamTrack || userTrack[0],
            targetExam: c.targetExam || existing.targetExam || getSubscribedCourseTitle(userTrack[0]),
            role: c.role || existing.role,
          });
        }
      });

      const mergedUsers = Array.from(userMap.values());

      // 4. Save to localStorage immediately
      try {
        localStorage.setItem(CLIENTS_KEY, JSON.stringify(mergedClients));
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(mergedUsers));
      } catch (err) {
        console.warn('[ClientSyncService] localStorage save warning:', err);
      }

      // 5. Push the union to Cloud Firestore and server API
      try {
        mergedClients.forEach((c) => {
          firestoreSyncService.saveClientToCloud(c).catch(() => {});
        });
        await Promise.all([
          fetch('/api/clients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clients: mergedClients }),
          }),
          fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ users: mergedUsers }),
          }),
        ]);
      } catch (pushErr) {
        console.warn('[ClientSyncService] Cloud push warning:', pushErr);
      }

      // 6. Synchronize active logged-in candidate profile if applicable
      this.reconcileActiveProfile(mergedClients, mergedUsers);

      // 7. Dispatch global events
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('studeezone_clients_updated', { detail: mergedClients }));
        window.dispatchEvent(new CustomEvent('studeezone_users_updated', { detail: mergedUsers }));
      }

      this.lastSyncTimestamp = Date.now();

      return {
        success: true,
        clients: mergedClients,
        users: mergedUsers,
        count: mergedClients.length,
        message: `Successfully synchronized ${mergedClients.length} clients across cloud and local storage.`,
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Reconciles the active user profile stored in localStorage with updated client data
   */
  reconcileActiveProfile(clients: ClientRecord[], users: RegisteredUser[]): UserProfile | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const profile: UserProfile = JSON.parse(raw);
      if (!profile || !profile.isLoggedIn) return null;

      const normEmail = (profile.email || '').toLowerCase().trim();
      const normLogin = (profile.loginId || '').toLowerCase().trim();
      const normName = (profile.name || '').toLowerCase().trim();

      const matchedClient = clients.find(
        (c) =>
          (normEmail && c.email.toLowerCase().trim() === normEmail) ||
          (normLogin && c.loginId && c.loginId.toLowerCase().trim() === normLogin) ||
          (normName && normName !== 'candidate learner' && c.name.toLowerCase().trim() === normName)
      );

      const isSuperAdmin = isAdminUser(profile.email) || profile.role === 'admin';

      if (matchedClient) {
        const clientTrack = getClientAllocatedTrack(matchedClient);
        const resolvedTrack = isSuperAdmin
          ? (profile.selectedExamTrack || 'gt-maths-science')
          : clientTrack;

        const updatedProfile: UserProfile = {
          ...profile,
          name: matchedClient.name || profile.name,
          email: matchedClient.email || profile.email,
          loginId: matchedClient.loginId || profile.loginId,
          role: isSuperAdmin ? 'admin' : (matchedClient.role || 'candidate'),
          isPaid: isSuperAdmin ? true : Boolean(matchedClient.isPaid || matchedClient.status === 'active'),
          trialDaysRemaining: isSuperAdmin ? 365 : (matchedClient.trialDaysRemaining ?? profile.trialDaysRemaining ?? 7),
          selectedExamTrack: resolvedTrack,
          targetExam: matchedClient.targetExam || getSubscribedCourseTitle(resolvedTrack),
          paidStreams: isSuperAdmin
            ? ['prt', 'gt-maths-science', 'gt-humanities']
            : (matchedClient.paidStreams && matchedClient.paidStreams.length > 0)
            ? matchedClient.paidStreams
            : [clientTrack],
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('studeezone_profile_updated', { detail: updatedProfile }));
        }
        return updatedProfile;
      }
      return profile;
    } catch {
      return null;
    }
  }

  /**
   * Allocates a specific course track to a candidate and syncs immediately to server & profile
   */
  async allocateCourse(clientId: string, track: ExamTrack): Promise<{ success: boolean; client?: ClientRecord }> {
    const clients = this.getLocalClients();
    const cleanId = clientId.replace(/^(client-|user-)+/, '');
    const idx = clients.findIndex((c) => c.id === clientId || c.id === cleanId || c.id === `client-${cleanId}`);

    if (idx === -1) {
      return { success: false };
    }

    const client = clients[idx];
    const targetExam = getSubscribedCourseTitle(track);
    const paidStreams = [track];
    const selectedStream = track === 'gt-maths-science' ? 'graduate-science' : track === 'gt-humanities' ? 'graduate-social' : 'primary';

    const updatedClient: ClientRecord = {
      ...client,
      targetExam,
      selectedExamTrack: track,
      paidStreams,
      selectedStream,
      isPaid: true,
      status: 'active',
      trialDaysRemaining: Math.max(client.trialDaysRemaining || 0, 365),
      notes: `${client.notes || ''} • Allocated to ${targetExam} on ${new Date().toLocaleDateString()}`,
    };

    clients[idx] = updatedClient;

    // Save locally
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    firestoreSyncService.saveClientToCloud(updatedClient).catch(() => {});
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studeezone_clients_updated', { detail: clients }));
    }

    // Push to server endpoints with await
    try {
      await Promise.all([
        fetch(`/api/clients/${encodeURIComponent(client.id)}/allocate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            track,
            email: client.email,
            loginId: client.loginId,
            targetExam,
            paidStreams,
            selectedStream,
          }),
        }),
        fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ client: updatedClient }),
        }),
      ]);
    } catch (err) {
      console.warn('[ClientSyncService] allocateCourse network warning:', err);
    }

    // Reconcile user profile if this client is currently logged in
    this.reconcileActiveProfile(clients, this.getLocalUsers());

    return { success: true, client: updatedClient };
  }

  /**
   * Updates candidate status (e.g. Grant Paid / Extend Trial) and syncs immediately
   */
  async updateClient(clientId: string, updates: Partial<ClientRecord>): Promise<ClientRecord[]> {
    const clients = this.getLocalClients();
    const idx = clients.findIndex((c) => c.id === clientId);
    if (idx === -1) return clients;

    const updatedClient: ClientRecord = {
      ...clients[idx],
      ...updates,
    };
    clients[idx] = updatedClient;

    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studeezone_clients_updated', { detail: clients }));
    }

    try {
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client: updatedClient }),
      });
    } catch {}

    this.reconcileActiveProfile(clients, this.getLocalUsers());
    return clients;
  }

  /**
   * Triggers a comprehensive Force Global Sync:
   * Clears question and profile caches, and deep-fetches from Cloud Firestore.
   */
  async forceGlobalSync() {
    return firestoreSyncService.forceGlobalSync();
  }
}

export const clientSyncService = new ClientSyncService();
export default clientSyncService;
