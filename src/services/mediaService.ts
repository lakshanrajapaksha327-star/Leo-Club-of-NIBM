import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
  type UploadTask,
} from 'firebase/storage';
import { storage } from '../lib/firebase';
import { validateMediaFile } from '../utils/clubLogic';

export type StorageVisibility = 'public' | 'private';

export interface UploadProgressState {
  id: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'cancelled';
  error?: string;
  url?: string;
  storagePath?: string;
}

function sanitizeFileName(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 96);
}

export function uploadClubFile(params: {
  file: File;
  kind: 'image' | 'video' | 'document';
  visibility: StorageVisibility;
  module: 'projects' | 'events' | 'officers' | 'gallery' | 'publications' | 'news' | 'site';
  recordId: string;
  onProgress?: (pct: number) => void;
}): {
  promise: Promise<{ url: string; storagePath: string }>;
  cancel: () => void;
} {
  const check = validateMediaFile(params.file, params.kind);
  if (!check.valid) {
    return {
      promise: Promise.reject(new Error(check.reason || 'Invalid media file.')),
      cancel: () => {},
    };
  }

  if (!storage) {
    return {
      promise: Promise.reject(
        new Error('Firebase Storage is not initialized. Check your Firebase configuration.'),
      ),
      cancel: () => {},
    };
  }

  const safeId = params.recordId.replace(/[^a-zA-Z0-9_-]/g, '_') || 'general';
  const fileKey = `${Date.now()}-${sanitizeFileName(params.file.name)}`;
  const storagePath = `${params.visibility}/${params.module}/${safeId}/${fileKey}`;
  const storageRef = ref(storage, storagePath);

  let task: UploadTask | null = null;
  let cancelled = false;

  const promise = new Promise<{ url: string; storagePath: string }>((resolve, reject) => {
    task = uploadBytesResumable(storageRef, params.file, {
      contentType: params.file.type,
      cacheControl:
        params.visibility === 'public'
          ? 'public,max-age=3600'
          : 'private,max-age=0,no-store',
    });

    task.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes > 0) {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          params.onProgress?.(pct);
        }
      },
      (err) => {
        if (cancelled || err.code === 'storage/canceled') {
          reject(new Error(`Upload cancelled for ${params.file.name}.`));
          return;
        }
        if (
          err.code === 'storage/unauthorized' ||
          err.code === 'storage/unknown' ||
          /bucket/i.test(err.message)
        ) {
          reject(
            new Error(
              `Storage upload failed for ${params.file.name}: ensure Firebase Cloud Storage is enabled on the Blaze billing plan and storage.rules are deployed.`,
            ),
          );
          return;
        }
        reject(new Error(err.message || `Failed to upload ${params.file.name}.`));
      },
      async () => {
        try {
          const url = await getDownloadURL(task!.snapshot.ref);
          resolve({ url, storagePath });
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Failed to get download URL.'));
        }
      },
    );
  });

  return {
    promise,
    cancel: () => {
      cancelled = true;
      task?.cancel();
    },
  };
}

export async function deleteStorageAsset(storagePath?: string): Promise<void> {
  if (!storage || !storagePath) return;
  try {
    await deleteObject(ref(storage, storagePath));
  } catch (err) {
    console.warn('Storage asset cleanup skipped or failed:', err);
  }
}
