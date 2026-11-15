import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { DEFAULT_SITE_SETTINGS } from '../data/brand';
import {
  db,
  FIREBASE_RUNTIME_INFO,
  formatFriendlyFirebaseError,
  handleFirestoreError,
  isFirebaseConfigured,
  OperationType,
} from '../lib/firebase';
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
  firestoreConnected: isFirebaseConfigured,
  authConnected: isFirebaseConfigured,
  storageConnected: isFirebaseConfigured && Boolean(FIREBASE_RUNTIME_INFO.storageBucket),
  regionHint: isFirebaseConfigured
    ? `Project ${FIREBASE_RUNTIME_INFO.projectId} · DB ${FIREBASE_RUNTIME_INFO.firestoreDatabaseId}`
    : 'Firebase not configured',
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
  enquiry: Omit<MembershipEnquiry, 'id' | 'status' | 'createdAt'>,
): Promise<{ accepted: boolean; message: string }> {
  if (!db) {
    return {
      accepted: false,
      message:
        'Firebase Firestore is not configured in this environment. Please contact the club administrators.',
    };
  }

  const path = 'membershipEnquiries';
  try {
    await addDoc(collection(db, path), {
      fullName: enquiry.fullName.trim().slice(0, 120),
      email: enquiry.email.trim().slice(0, 160),
      programme: enquiry.programme.trim().slice(0, 160),
      batch: enquiry.batch.trim().slice(0, 60),
      reason: enquiry.reason.trim().slice(0, 2000),
      consentAccepted: Boolean(enquiry.consentAccepted),
      status: 'new',
      createdAt: serverTimestamp(),
    });
    return {
      accepted: true,
      message:
        'Thank you! Your membership enquiry has been securely recorded for review by the Leo Club of NIBM Executive Committee.',
    };
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.CREATE, path);
    } catch (wrapped) {
      return {
        accepted: false,
        message: formatFriendlyFirebaseError(wrapped),
      };
    }
  }
}

export async function submitContactEnquiry(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
  consentAccepted: boolean;
}): Promise<{ accepted: boolean; message: string }> {
  if (!db) {
    return {
      accepted: false,
      message:
        'Firebase Firestore is not configured in this environment. Please contact the club administrators.',
    };
  }

  const path = 'contactMessages';
  try {
    await addDoc(collection(db, path), {
      name: payload.name.trim().slice(0, 120),
      email: payload.email.trim().slice(0, 160),
      subject: payload.subject.trim().slice(0, 180),
      message: payload.message.trim().slice(0, 3000),
      consentAccepted: Boolean(payload.consentAccepted),
      status: 'new',
      createdAt: serverTimestamp(),
    });
    return {
      accepted: true,
      message:
        'Thank you! Your message has been securely delivered to the Leo Club of NIBM Executive Committee.',
    };
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.CREATE, path);
    } catch (wrapped) {
      return {
        accepted: false,
        message: formatFriendlyFirebaseError(wrapped),
      };
    }
  }
}
