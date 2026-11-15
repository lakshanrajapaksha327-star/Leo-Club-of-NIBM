import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  DEFAULT_AWARD_CATEGORIES,
  DEFAULT_SITE_SETTINGS,
  SERVICE_CATEGORIES,
} from '../data/brand';
import {
  auth,
  formatFriendlyFirebaseError,
  isFirebaseConfigured,
} from '../lib/firebase';
import {
  resolveAdminUserProfile,
  signInAdminWithGoogle,
  signOutAdmin,
} from '../services/authService';
import { subscribePublicClubStreams } from '../services/contentService';
import { BACKEND_STATUS, type BackendStatus, type ClubPublicData } from '../services/repository';
import type { ClubYear, TaxonomyItem, UserProfile } from '../types/club';

interface ClubContextValue extends ClubPublicData {
  clubYears: ClubYear[];
  serviceCategories: TaxonomyItem[];
  awardCategories: TaxonomyItem[];
  loading: boolean;
  error: string | null;
  backendStatus: BackendStatus;
  authReady: boolean;
  authLoading: boolean;
  firebaseUser: User | null;
  userProfile: UserProfile | null;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  refresh: () => Promise<void>;
}

const DEFAULT_SERVICE_ITEMS: TaxonomyItem[] = SERVICE_CATEGORIES.map((name, idx) => ({
  id: `default-service-${idx + 1}`,
  name,
  order: idx + 1,
  active: true,
}));

const DEFAULT_AWARD_ITEMS: TaxonomyItem[] = DEFAULT_AWARD_CATEGORIES.map((name, idx) => ({
  id: `default-award-${idx + 1}`,
  name,
  order: idx + 1,
  active: true,
}));

const ClubContext = createContext<ClubContextValue>({
  settings: DEFAULT_SITE_SETTINGS,
  projects: [],
  events: [],
  officers: [],
  galleries: [],
  publications: [],
  news: [],
  achievements: [],
  clubYears: [],
  serviceCategories: DEFAULT_SERVICE_ITEMS,
  awardCategories: DEFAULT_AWARD_ITEMS,
  loading: true,
  error: null,
  backendStatus: BACKEND_STATUS,
  authReady: false,
  authLoading: false,
  firebaseUser: null,
  userProfile: null,
  authError: null,
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
  refresh: async () => {},
});

export function ClubProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ClubPublicData>({
    settings: DEFAULT_SITE_SETTINGS,
    projects: [],
    events: [],
    officers: [],
    galleries: [],
    publications: [],
    news: [],
    achievements: [],
  });
  const [clubYears, setClubYears] = useState<ClubYear[]>([]);
  const [serviceCategories, setServiceCategories] =
    useState<TaxonomyItem[]>(DEFAULT_SERVICE_ITEMS);
  const [awardCategories, setAwardCategories] =
    useState<TaxonomyItem[]>(DEFAULT_AWARD_ITEMS);

  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(null);
  const [streamVersion, setStreamVersion] = useState(0);

  const [authReady, setAuthReady] = useState(!isFirebaseConfigured);
  const [authLoading, setAuthLoading] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Live public Firestore subscriptions
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let initialResolved = false;
    const markReady = () => {
      if (!initialResolved) {
        initialResolved = true;
        setLoading(false);
      }
    };

    const unsubscribe = subscribePublicClubStreams({
      onSettings: (settings) => {
        setData((prev) => ({ ...prev, settings }));
        markReady();
      },
      onProjects: (projects) => {
        setData((prev) => ({ ...prev, projects }));
        markReady();
      },
      onEvents: (events) => {
        setData((prev) => ({ ...prev, events }));
        markReady();
      },
      onOfficers: (officers) => {
        setData((prev) => ({ ...prev, officers }));
        markReady();
      },
      onGalleries: (galleries) => {
        setData((prev) => ({ ...prev, galleries }));
        markReady();
      },
      onPublications: (publications) => {
        setData((prev) => ({ ...prev, publications }));
        markReady();
      },
      onNews: (news) => {
        setData((prev) => ({ ...prev, news }));
        markReady();
      },
      onAchievements: (achievements) => {
        setData((prev) => ({ ...prev, achievements }));
        markReady();
      },
      onClubYears: (years) => setClubYears(years),
      onServiceCategories: (items) => setServiceCategories(items),
      onAwardCategories: (items) => setAwardCategories(items),
      onError: (msg) => {
        setError(formatFriendlyFirebaseError(msg));
        markReady();
      },
    });

    const fallbackTimer = window.setTimeout(markReady, 4000);

    return () => {
      window.clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, [streamVersion]);

  // Firebase Auth listener + RBAC role resolution
  useEffect(() => {
    if (!auth) {
      setAuthReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setUserProfile(null);
        setAuthError(null);
        setAuthReady(true);
        return;
      }

      setAuthLoading(true);
      try {
        const res = await resolveAdminUserProfile(user);
        setUserProfile(res.profile);
        setAuthError(res.reason);
      } catch (err) {
        setUserProfile(null);
        setAuthError(formatFriendlyFirebaseError(err));
      } finally {
        setAuthLoading(false);
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInAdminWithGoogle();
    } catch (err) {
      setAuthError(formatFriendlyFirebaseError(err));
      setAuthLoading(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setAuthError(null);
    await signOutAdmin();
    setUserProfile(null);
  }, []);

  const refresh = useCallback(async () => {
    setStreamVersion((v) => v + 1);
  }, []);

  return (
    <ClubContext.Provider
      value={{
        ...data,
        clubYears,
        serviceCategories,
        awardCategories,
        loading,
        error,
        backendStatus: BACKEND_STATUS,
        authReady,
        authLoading,
        firebaseUser,
        userProfile,
        authError,
        signInWithGoogle,
        signOutUser,
        refresh,
      }}
    >
      {children}
    </ClubContext.Provider>
  );
}

export function useClubData() {
  return useContext(ClubContext);
}
