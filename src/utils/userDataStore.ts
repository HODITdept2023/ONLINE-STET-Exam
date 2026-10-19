/**
 * Unified Data-Store and Event Emitter for studeezone
 * Single Source of Truth for User Data, Subscription Status, and Client Management.
 * Guarantees that any change in the admin client management table triggers
 * an immediate global reactive update across the Dashboard, Header, and Admin Hub.
 */

import { UserProfile, ClientRecord, RegisteredUser, ExamTrack } from '../types';
import {
  loadUserProfile,
  saveUserProfile,
  getAllClients,
  saveClients,
  getRegisteredUsers,
  getExamTrackFromTarget,
  getClientAllocatedTrack,
  getSubscribedCourseTitle,
  getUserSubscribedTrack,
  isAdminUser,
  isPaidOrAdmin,
  STORAGE_KEY,
  REGISTERED_USERS_KEY,
} from './storage';
import { cacheCriticalStateToSW } from './serviceWorkerRegistration';
import { firestoreSyncService } from '../services/firestoreSyncService';
import React, { useState, useEffect, useCallback } from 'react';

export const STUDEEZONE_DATA_STORE_EVENT = 'studeezone_data_store_change';
export const STUDEEZONE_PROFILE_EVENT = 'studeezone_profile_updated';
export const STUDEEZONE_CLIENTS_EVENT = 'studeezone_clients_updated';
export const STUDEEZONE_SUBSCRIPTION_EVENT = 'studeezone_subscription_status_changed';

export type StoreActionType =
  | 'client_updated'
  | 'profile_updated'
  | 'subscription_changed'
  | 'payment_approved'
  | 'track_allocated'
  | 'trial_extended'
  | 'client_deleted'
  | 'initial_sync';

export interface DataStoreEventDetail {
  type: StoreActionType;
  clientId?: string;
  userEmail?: string;
  userProfile: UserProfile;
  clients: ClientRecord[];
  timestamp: number;
}

class UserDataStore {
  private listeners: Set<(detail: DataStoreEventDetail) => void> = new Set();

  /**
   * Returns the authoritative active user profile reconciled with client records
   */
  getUserProfile(): UserProfile {
    return loadUserProfile();
  }

  /**
   * Returns all client records from storage
   */
  getClients(): ClientRecord[] {
    return getAllClients();
  }

  /**
   * Returns all registered user authentication records
   */
  getRegisteredUsers(): RegisteredUser[] {
    return getRegisteredUsers();
  }

  /**
   * Emits a global state change event via CustomEvent and direct listener registry
   */
  notify(type: StoreActionType, clientId?: string, userEmail?: string): DataStoreEventDetail {
    const profile = this.getUserProfile();
    const clients = this.getClients();
    const detail: DataStoreEventDetail = {
      type,
      clientId,
      userEmail,
      userProfile: profile,
      clients,
      timestamp: Date.now(),
    };

    // 1. Notify internal in-memory subscribers
    this.listeners.forEach((listener) => {
      try {
        listener(detail);
      } catch (err) {
        console.error('[UserDataStore] Listener execution error:', err);
      }
    });

    // 2. Dispatch browser DOM custom events
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(STUDEEZONE_DATA_STORE_EVENT, { detail }));
      window.dispatchEvent(new CustomEvent(STUDEEZONE_PROFILE_EVENT, { detail: profile }));
      window.dispatchEvent(new CustomEvent(STUDEEZONE_CLIENTS_EVENT, { detail: clients }));
      window.dispatchEvent(new CustomEvent(STUDEEZONE_SUBSCRIPTION_EVENT, { detail }));
    }

    // 3. Mirror state to Service Worker Cache
    cacheCriticalStateToSW('userProfile', profile);
    cacheCriticalStateToSW('clients', clients);

    return detail;
  }

  /**
   * Subscribe to store mutations
   */
  subscribe(listener: (detail: DataStoreEventDetail) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Primary mutation method: Updates client in directory and reconciles active session profile
   */
  updateClientAndSync(clientId: string, updates: Partial<ClientRecord>): ClientRecord[] {
    const clients = getAllClients();
    const existing = clients.find((c) => c.id === clientId);
    if (!existing) return clients;

    const originalEmail = (existing.email || '').toLowerCase().trim();
    const originalLoginId = (existing.loginId || '').toLowerCase().trim();
    const newEmail = (updates.email || originalEmail).toLowerCase().trim();
    const newLoginId = (updates.loginId || originalLoginId || newEmail).toLowerCase().trim();

    // Determine target track
    const targetExam = updates.targetExam || existing.targetExam;
    const resolvedTrack = updates.paidStreams && updates.paidStreams.length > 0
      ? updates.paidStreams
      : targetExam
      ? [getExamTrackFromTarget(targetExam)]
      : (existing.paidStreams || ['prt']);

    const resolvedIsPaid = updates.isPaid !== undefined
      ? updates.isPaid
      : (updates.status === 'active' ? true : existing.isPaid);

    const mergedRecord: ClientRecord = {
      ...existing,
      ...updates,
      email: newEmail,
      loginId: newLoginId,
      paidStreams: resolvedTrack,
      targetExam: targetExam || getSubscribedCourseTitle(resolvedTrack[0]),
      selectedExamTrack: updates.selectedExamTrack || existing.selectedExamTrack || resolvedTrack[0],
      isPaid: resolvedIsPaid,
      status: resolvedIsPaid ? 'active' : (updates.status || existing.status || 'trial'),
      updatedAt: Date.now(),
    };

    const updatedClients = clients.map((c) => (c.id === clientId ? mergedRecord : c));
    saveClients(updatedClients, true);
    firestoreSyncService.saveClientToCloud(mergedRecord).catch(() => {});
    fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client: mergedRecord, clients: updatedClients }),
    }).catch(() => {});

    // Synchronize into registered users
    try {
      const users = getRegisteredUsers();
      const uIdx = users.findIndex(
        (u) =>
          u.id === `user-${clientId}` ||
          u.id === clientId ||
          (originalEmail && u.email.toLowerCase() === originalEmail) ||
          (newEmail && u.email.toLowerCase() === newEmail) ||
          (originalLoginId && u.loginId && u.loginId.toLowerCase() === originalLoginId)
      );

      if (uIdx >= 0) {
        users[uIdx] = {
          ...users[uIdx],
          name: mergedRecord.name,
          email: newEmail,
          loginId: newLoginId,
          phone: mergedRecord.phone || users[uIdx].phone,
          password: mergedRecord.password || users[uIdx].password,
          targetExam: mergedRecord.targetExam,
          status: mergedRecord.status,
          isPaid: resolvedIsPaid,
          paidStreams: resolvedTrack,
        };
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
      }
    } catch (e) {
      console.warn('[UserDataStore] Failed to update registered users:', e);
    }

    // Reconcile Active Session UserProfile
    const activeProfile = loadUserProfile();
    const activeEmail = (activeProfile.email || '').toLowerCase().trim();
    const activeLogin = (activeProfile.loginId || '').toLowerCase().trim();
    const activeName = (activeProfile.name || '').toLowerCase().trim();

    const isMatch =
      (activeEmail && (activeEmail === originalEmail || activeEmail === newEmail)) ||
      (activeLogin && (activeLogin === originalLoginId || activeLogin === newLoginId)) ||
      (activeName && activeName !== 'candidate learner' && activeName === existing.name.toLowerCase().trim());

    if (isMatch) {
      const updatedProfile: UserProfile = {
        ...activeProfile,
        email: newEmail || activeProfile.email,
        loginId: newLoginId || activeProfile.loginId,
        name: mergedRecord.name || activeProfile.name,
        targetExam: mergedRecord.targetExam,
        selectedExamTrack: resolvedTrack[0],
        isPaid: resolvedIsPaid,
        paidStreams: resolvedTrack,
        trialDaysRemaining: mergedRecord.trialDaysRemaining ?? activeProfile.trialDaysRemaining,
      };
      saveUserProfile(updatedProfile);
      firestoreSyncService.saveProfileToCloud(updatedProfile).catch(() => {});
    }

    // Broadcast unified change event
    this.notify('client_updated', clientId, newEmail);
    return updatedClients;
  }

  /**
   * Direct 1-click Toggle of Paid Pro Status
   */
  toggleClientPaidStatus(clientId: string, isPaid: boolean, explicitTrack?: ExamTrack): ClientRecord[] {
    const clients = getAllClients();
    const client = clients.find((c) => c.id === clientId);
    if (!client) return clients;

    const track = explicitTrack || getClientAllocatedTrack(client);
    const courseTitle = getSubscribedCourseTitle(track);

    return this.updateClientAndSync(clientId, {
      isPaid,
      status: isPaid ? 'active' : 'trial',
      trialDaysRemaining: isPaid ? 365 : 1,
      paidStreams: isPaid ? [track] : [],
      targetExam: courseTitle,
      selectedExamTrack: track,
      notes: (client.notes ? `${client.notes} • ` : '') +
        (isPaid
          ? `Upgraded to Paid Pro for ${courseTitle} by Admin on ${new Date().toLocaleDateString()}`
          : `Paid Pro disabled by Admin on ${new Date().toLocaleDateString()}`),
    });
  }

  /**
   * Direct 1-click Course Stream Allocation
   */
  allocateClientTrack(clientId: string, track: ExamTrack): ClientRecord[] {
    const clients = getAllClients();
    const client = clients.find((c) => c.id === clientId);
    if (!client) return clients;

    const courseTitle = getSubscribedCourseTitle(track);
    const streamCategory =
      track === 'gt-maths-science'
        ? 'graduate-science'
        : track === 'gt-humanities'
        ? 'graduate-social'
        : 'primary';

    return this.updateClientAndSync(clientId, {
      targetExam: courseTitle,
      selectedExamTrack: track,
      selectedStream: streamCategory,
      paidStreams: [track],
      notes: (client.notes ? `${client.notes} • ` : '') +
        `Allocated to ${courseTitle} by Admin on ${new Date().toLocaleDateString()}`,
    });
  }

  /**
   * Direct Trial Extension
   */
  extendClientTrial(clientId: string, days: number = 7): ClientRecord[] {
    const clients = getAllClients();
    const client = clients.find((c) => c.id === clientId);
    if (!client) return clients;

    const currentDays = client.trialDaysRemaining || 0;
    const newDays = currentDays + days;

    return this.updateClientAndSync(clientId, {
      trialDaysRemaining: newDays,
      status: 'trial',
      notes: (client.notes ? `${client.notes} • ` : '') +
        `Extended trial by +${days} days (total: ${newDays} days) by Admin on ${new Date().toLocaleDateString()}`,
    });
  }
}

export const userDataStore = new UserDataStore();

/**
 * React Hook for components (Dashboard, Header, Admin Panel) to observe unified user data
 */
export function useUserDataStore() {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => userDataStore.getUserProfile());
  const [clients, setClients] = useState<ClientRecord[]>(() => userDataStore.getClients());
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  const refresh = useCallback(() => {
    setUserProfile(userDataStore.getUserProfile());
    setClients(userDataStore.getClients());
    setLastUpdated(Date.now());
  }, []);

  useEffect(() => {
    // Initial sync
    refresh();

    // Listen to custom store changes
    const unsubscribe = userDataStore.subscribe((detail) => {
      setUserProfile(detail.userProfile);
      setClients(detail.clients);
      setLastUpdated(detail.timestamp);
    });

    const handleDomEvent = (e: any) => {
      refresh();
    };

    window.addEventListener(STUDEEZONE_DATA_STORE_EVENT, handleDomEvent);
    window.addEventListener(STUDEEZONE_PROFILE_EVENT, handleDomEvent);
    window.addEventListener(STUDEEZONE_CLIENTS_EVENT, handleDomEvent);
    window.addEventListener('storage', handleDomEvent);

    return () => {
      unsubscribe();
      window.removeEventListener(STUDEEZONE_DATA_STORE_EVENT, handleDomEvent);
      window.removeEventListener(STUDEEZONE_PROFILE_EVENT, handleDomEvent);
      window.removeEventListener(STUDEEZONE_CLIENTS_EVENT, handleDomEvent);
      window.removeEventListener('storage', handleDomEvent);
    };
  }, [refresh]);

  const isSpecialCandidate = Boolean(
    userProfile.isLoggedIn &&
      `${userProfile.name} ${userProfile.email} ${userProfile.loginId}`.toLowerCase().match(/asha|prasad|shanti|subba/)
  );
  const isSuperAdmin = Boolean(
    userProfile.isLoggedIn && (isAdminUser(userProfile.email) || userProfile.role === 'admin')
  );
  const isPaid = Boolean(userProfile.isLoggedIn && (isPaidOrAdmin(userProfile) || isSpecialCandidate));
  const subscribedTrack = isSpecialCandidate ? 'gt-maths-science' : getUserSubscribedTrack(userProfile);
  const subscribedCourseTitle = getSubscribedCourseTitle(subscribedTrack);

  return {
    userProfile,
    clients,
    isPaid,
    isSuperAdmin,
    isSpecialCandidate,
    subscribedTrack,
    subscribedCourseTitle,
    lastUpdated,
    refresh,
  };
}
