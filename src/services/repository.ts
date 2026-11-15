import { DEFAULT_SITE_SETTINGS } from '../data/brand';
import type {
  Achievement,
  ClubEvent,
  GalleryAlbum,
  MembershipEnquiry,
  NewsArticle,
  Officer,
  Project,
  Publication,
  SiteSettings,
} from '../types/club';

export interface BackendStatus {
  firestoreConnected: boolean;
  authConnected: boolean;
  storageConnected: boolean;
  regionHint: string;
}

export const BACKEND_STATUS: BackendStatus = {
  firestoreConnected: false,
  authConnected: false,
  storageConnected: false,
  regionHint: 'Pending Firebase setup (Step 2)',
};

export interface ClubPublicData {
  settings: SiteSettings;
  projects: Project[];
  events: ClubEvent[];
  officers: Officer[];
  galleries: GalleryAlbum[];
  publications: Publication[];
  news: NewsArticle[];
  achievements: Achievement[];
}

export async function fetchPublicClubData(): Promise<ClubPublicData> {
  // Honest empty state before Firebase Firestore is provisioned and club records are published.
  return {
    settings: DEFAULT_SITE_SETTINGS,
    projects: [],
    events: [],
    officers: [],
    galleries: [],
    publications: [],
    news: [],
    achievements: [],
  };
}

export async function submitMembershipEnquiry(
  _enquiry: Omit<MembershipEnquiry, 'id' | 'status' | 'createdAt'>,
): Promise<{ accepted: boolean; message: string }> {
  if (!BACKEND_STATUS.firestoreConnected) {
    return {
      accepted: false,
      message:
        'Firebase Firestore is not connected yet. Complete Step 2 (Enable Firebase) to store membership enquiries securely.',
    };
  }
  return { accepted: true, message: 'Membership enquiry recorded.' };
}

export async function submitContactEnquiry(_payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ accepted: boolean; message: string }> {
  if (!BACKEND_STATUS.firestoreConnected) {
    return {
      accepted: false,
      message:
        'Firebase Firestore is not connected yet. Complete Step 2 (Enable Firebase) before submitting live contact enquiries.',
    };
  }
  return { accepted: true, message: 'Contact message recorded.' };
}
