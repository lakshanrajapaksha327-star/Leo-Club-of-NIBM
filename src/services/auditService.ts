import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import type { UserProfile } from '../types/club';

export async function recordAuditLog(params: {
  actor: Pick<UserProfile, 'uid' | 'email' | 'role'>;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
}): Promise<void> {
  if (!db) return;
  const path = 'auditLogs';
  try {
    await addDoc(collection(db, path), {
      actorUid: params.actor.uid.slice(0, 128),
      actorEmail: params.actor.email.slice(0, 160),
      actorRole: params.actor.role.slice(0, 40),
      action: params.action.slice(0, 80),
      entityType: params.entityType.slice(0, 60),
      entityId: params.entityId.slice(0, 128),
      summary: params.summary.slice(0, 400),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    // Log audit failures without breaking primary operator UX unless permission fails
    if (error instanceof Error && /permission/i.test(error.message)) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
    console.warn('Audit log write failed:', error);
  }
}
