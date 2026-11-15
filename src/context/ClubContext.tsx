import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_SITE_SETTINGS } from '../data/brand';
import {
  BACKEND_STATUS,
  fetchPublicClubData,
  type BackendStatus,
  type ClubPublicData,
} from '../services/repository';

interface ClubContextValue extends ClubPublicData {
  loading: boolean;
  error: string | null;
  backendStatus: BackendStatus;
  refresh: () => Promise<void>;
}

const ClubContext = createContext<ClubContextValue>({
  settings: DEFAULT_SITE_SETTINGS,
  projects: [],
  events: [],
  officers: [],
  galleries: [],
  publications: [],
  news: [],
  achievements: [],
  loading: true,
  error: null,
  backendStatus: BACKEND_STATUS,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchPublicClubData();
      setData(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load club records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <ClubContext.Provider
      value={{
        ...data,
        loading,
        error,
        backendStatus: BACKEND_STATUS,
        refresh: load,
      }}
    >
      {children}
    </ClubContext.Provider>
  );
}

export function useClubData() {
  return useContext(ClubContext);
}
