import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import {
  doc,
  getDocFromServer,
  getFirestore,
  type Firestore,
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import firebaseConfigJson from '../../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

interface FirebaseAppletConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
}

const envConfig: Partial<FirebaseAppletConfig> = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || undefined,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || undefined,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
};

const rawConfig: FirebaseAppletConfig = {
  ...firebaseConfigJson,
  ...(envConfig.apiKey ? envConfig : {}),
};

export const isFirebaseConfigured = Boolean(
  rawConfig.projectId &&
    rawConfig.projectId !== 'remixed-project-id' &&
    rawConfig.apiKey &&
    rawConfig.appId,
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  app = getApps().length > 0 ? getApps()[0] : initializeApp(rawConfig);
  authInstance = getAuth(app);
  dbInstance = rawConfig.firestoreDatabaseId
    ? getFirestore(app, rawConfig.firestoreDatabaseId)
    : getFirestore(app);
  storageInstance = getStorage(app);

  // Validate Firestore connectivity once on application boot
  void (async () => {
    try {
      await getDocFromServer(doc(dbInstance!, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error('Please check your Firebase configuration: client is offline.');
      }
    }
  })();
}

export const firebaseApp = app;
export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const FIREBASE_RUNTIME_INFO = {
  projectId: rawConfig.projectId || '',
  firestoreDatabaseId: rawConfig.firestoreDatabaseId || '(default)',
  storageBucket: rawConfig.storageBucket || '',
};

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const currentUser = authInstance?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid ?? null,
      email: currentUser?.email ?? null,
      emailVerified: currentUser?.emailVerified ?? null,
      isAnonymous: currentUser?.isAnonymous ?? null,
      tenantId: currentUser?.tenantId ?? null,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function formatFriendlyFirebaseError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  let parsedMessage = raw;
  try {
    const parsed = JSON.parse(raw) as Partial<FirestoreErrorInfo>;
    if (parsed && typeof parsed.error === 'string') {
      parsedMessage = parsed.error;
    }
  } catch {
    // Plain error string
  }

  if (/Quota exceeded/i.test(parsedMessage)) {
    return 'Daily Firestore free-tier quota exceeded. Quota resets tomorrow, or upgrade the project plan in Firebase Console.';
  }
  if (/permission[- ]denied|insufficient permissions/i.test(parsedMessage)) {
    return 'Permission denied by Firestore security rules. Ensure you are signed in with an authorised club role.';
  }
  if (/storage\/unauthorized|storage\/bucket-not-found|403|404/i.test(parsedMessage)) {
    return 'Cloud Storage upload blocked or bucket not initialized. Ensure Firebase Blaze billing and Storage bucket setup are complete.';
  }
  return parsedMessage;
}

export function normalizeEmailToInviteId(email: string): string {
  return email
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
}
