import {
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  normalizeEmailToInviteId,
  OperationType,
} from '../lib/firebase';
import { BOOTSTRAPPED_SUPER_ADMIN_EMAIL } from '../data/brand';
import type { AdminInvite, UserProfile, UserRole } from '../types/club';
import { recordAuditLog } from './auditService';

function toMillis(val: unknown): number | undefined {
  if (val instanceof Timestamp) return val.toMillis();
  if (typeof val === 'number') return val;
  return undefined;
}

export async function signInAdminWithGoogle(): Promise<User> {
  if (!auth) {
    throw new Error('Firebase Authentication is not configured.');
  }
  const result = await signInWithPopup(auth, googleProvider);
  if (!result.user.email || !result.user.emailVerified) {
    await signOut(auth);
    throw new Error('A verified Google email address is required for admin access.');
  }
  return result.user;
}

export async function signOutAdmin(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

export interface AuthResolutionResult {
  profile: UserProfile | null;
  reason: string | null;
}

export async function resolveAdminUserProfile(user: User): Promise<AuthResolutionResult> {
  if (!db) {
    return { profile: null, reason: 'Firestore is not configured.' };
  }
  if (!user.email || !user.emailVerified) {
    return { profile: null, reason: 'Your Google account email is not verified.' };
  }

  const userPath = `users/${user.uid}`;
  let existingSnap;
  try {
    existingSnap = await getDoc(doc(db, 'users', user.uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  if (existingSnap.exists()) {
    const raw = existingSnap.data();
    const profile: UserProfile = {
      uid: String(raw.uid || user.uid),
      email: String(raw.email || user.email),
      displayName: raw.displayName ? String(raw.displayName) : user.displayName || undefined,
      photoURL: raw.photoURL ? String(raw.photoURL) : user.photoURL || undefined,
      role: raw.role as UserRole,
      active: Boolean(raw.active),
      createdAt: toMillis(raw.createdAt),
      updatedAt: toMillis(raw.updatedAt),
    };

    if (!profile.active) {
      return {
        profile: null,
        reason: 'Your administrator account is currently deactivated. Contact the club Super Admin.',
      };
    }

    // Keep display name / avatar fresh without touching role or active
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: (user.displayName || profile.displayName || user.email).slice(0, 120),
        photoURL: (user.photoURL || '').slice(0, 1000),
        updatedAt: serverTimestamp(),
      });
    } catch {
      // Non-fatal metadata refresh
    }

    return { profile, reason: null };
  }

  // First login: check bootstrapped owner email OR pre-authorized invite allowlist
  const normalizedEmail = user.email.trim().toLowerCase();
  const isBootstrappedOwner = normalizedEmail === BOOTSTRAPPED_SUPER_ADMIN_EMAIL.toLowerCase();

  let grantedRole: UserRole | null = isBootstrappedOwner ? 'superAdmin' : null;

  if (!grantedRole) {
    const inviteId = normalizeEmailToInviteId(normalizedEmail);
    const invitePath = `adminInvites/${inviteId}`;
    try {
      const inviteSnap = await getDoc(doc(db, 'adminInvites', inviteId));
      if (inviteSnap.exists()) {
        const inviteData = inviteSnap.data();
        if (
          inviteData.active === true &&
          String(inviteData.email || '').trim().toLowerCase() === normalizedEmail
        ) {
          grantedRole = inviteData.role as UserRole;
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, invitePath);
    }
  }

  if (!grantedRole) {
    return {
      profile: null,
      reason: `Access pending: ${user.email} is not on the invited officer allowlist yet. Ask the club Super Admin to add your email in Admin → Users & Roles.`,
    };
  }

  const newProfilePayload = {
    uid: user.uid,
    email: user.email.slice(0, 160),
    displayName: (user.displayName || user.email.split('@')[0]).slice(0, 120),
    photoURL: (user.photoURL || '').slice(0, 1000),
    role: grantedRole,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'users', user.uid), newProfilePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, userPath);
  }

  return {
    profile: {
      uid: user.uid,
      email: newProfilePayload.email,
      displayName: newProfilePayload.displayName,
      photoURL: newProfilePayload.photoURL || undefined,
      role: grantedRole,
      active: true,
    },
    reason: null,
  };
}

export function subscribeAdminUsers(
  onData: (users: UserProfile[]) => void,
  onError: (message: string) => void,
): Unsubscribe {
  if (!db) return () => {};
  const path = 'users';
  const q = query(collection(db, path), orderBy('email', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const rows: UserProfile[] = snapshot.docs.map((d) => {
        const raw = d.data();
        return {
          uid: d.id,
          email: String(raw.email || ''),
          displayName: raw.displayName ? String(raw.displayName) : undefined,
          photoURL: raw.photoURL ? String(raw.photoURL) : undefined,
          role: raw.role as UserRole,
          active: Boolean(raw.active),
          createdAt: toMillis(raw.createdAt),
          updatedAt: toMillis(raw.updatedAt),
        };
      });
      onData(rows);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Unable to load admin users.');
      }
    },
  );
}

export function subscribeAdminInvites(
  onData: (invites: AdminInvite[]) => void,
  onError: (message: string) => void,
): Unsubscribe {
  if (!db) return () => {};
  const path = 'adminInvites';
  const q = query(collection(db, path), orderBy('email', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const rows: AdminInvite[] = snapshot.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          email: String(raw.email || ''),
          role: raw.role as UserRole,
          active: Boolean(raw.active),
          invitedBy: String(raw.invitedBy || ''),
          createdAt: toMillis(raw.createdAt),
          updatedAt: toMillis(raw.updatedAt),
        };
      });
      onData(rows);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Unable to load admin invites.');
      }
    },
  );
}

export async function createOrUpdateAdminInvite(
  actor: UserProfile,
  email: string,
  role: UserRole,
  active = true,
): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  const cleanEmail = email.trim().toLowerCase().slice(0, 160);
  if (!cleanEmail.includes('@')) {
    throw new Error('Enter a valid Google email address to invite.');
  }
  const inviteId = normalizeEmailToInviteId(cleanEmail);
  const path = `adminInvites/${inviteId}`;
  const ref = doc(db, 'adminInvites', inviteId);
  try {
    const existing = await getDoc(ref);
    if (existing.exists()) {
      await updateDoc(ref, {
        role,
        active,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(ref, {
        email: cleanEmail,
        role,
        active,
        invitedBy: actor.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    await recordAuditLog({
      actor,
      action: existing.exists() ? 'invite.update' : 'invite.create',
      entityType: 'adminInvites',
      entityId: inviteId,
      summary: `${existing.exists() ? 'Updated' : 'Invited'} ${cleanEmail} with role ${role}`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteAdminInvite(actor: UserProfile, inviteId: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  const path = `adminInvites/${inviteId}`;
  try {
    await deleteDoc(doc(db, 'adminInvites', inviteId));
    await recordAuditLog({
      actor,
      action: 'invite.delete',
      entityType: 'adminInvites',
      entityId: inviteId,
      summary: `Removed admin invite ${inviteId}`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function updateUserRoleOrStatus(
  actor: UserProfile,
  targetUid: string,
  updates: { role: UserRole; active: boolean },
): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  const path = `users/${targetUid}`;
  try {
    await updateDoc(doc(db, 'users', targetUid), {
      role: updates.role,
      active: updates.active,
      updatedAt: serverTimestamp(),
    });
    await recordAuditLog({
      actor,
      action: 'user.roleUpdate',
      entityType: 'users',
      entityId: targetUid,
      summary: `Updated user ${targetUid} to role=${updates.role}, active=${updates.active}`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
