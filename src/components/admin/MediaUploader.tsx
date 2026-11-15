import { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, RefreshCw, Upload, X } from 'lucide-react';
import {
  uploadClubFile,
  type StorageVisibility,
  type UploadProgressState,
} from '../../services/mediaService';

interface MediaUploaderProps {
  kind: 'image' | 'video' | 'document';
  visibility: StorageVisibility;
  module: 'projects' | 'events' | 'officers' | 'gallery' | 'publications' | 'news' | 'site';
  recordId: string;
  multiple?: boolean;
  label?: string;
  onUploaded: (result: { url: string; storagePath: string; fileName: string }) => void;
}

export function MediaUploader({
  kind,
  visibility,
  module,
  recordId,
  multiple = false,
  label,
  onUploaded,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelMapRef = useRef<Record<string, () => void>>({});
  const fileMapRef = useRef<Record<string, File>>({});
  const [tasks, setTasks] = useState<UploadProgressState[]>([]);

  const accept =
    kind === 'image'
      ? 'image/jpeg,image/png,image/webp'
      : kind === 'video'
      ? 'video/mp4,video/webm,video/quicktime'
      : 'application/pdf';

  const startUpload = (file: File, existingId?: string) => {
    const id = existingId || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    fileMapRef.current[id] = file;

    setTasks((prev) => {
      const nextItem: UploadProgressState = {
        id,
        fileName: file.name,
        progress: 0,
        status: 'uploading',
      };
      if (existingId) {
        return prev.map((t) => (t.id === existingId ? nextItem : t));
      }
      return [nextItem, ...prev.slice(0, 7)];
    });

    const { promise, cancel } = uploadClubFile({
      file,
      kind,
      visibility,
      module,
      recordId,
      onProgress: (pct) => {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, progress: pct } : t)),
        );
      },
    });

    cancelMapRef.current[id] = cancel;

    promise
      .then((res) => {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, progress: 100, status: 'completed', url: res.url, storagePath: res.storagePath }
              : t,
          ),
        );
        onUploaded({ ...res, fileName: file.name });
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Upload failed.';
        const wasCancelled = /cancelled/i.test(message);
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: wasCancelled ? 'cancelled' : 'error',
                  error: message,
                }
              : t,
          ),
        );
      });
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => startUpload(file));
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <label
        className={`flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-4 text-center cursor-pointer transition-colors ${
          visibility === 'private'
            ? 'border-amber-500/35 bg-amber-500/5 hover:bg-amber-500/10'
            : 'border-white/20 bg-[#05070D] hover:border-[#E8AF25]/60'
        }`}
      >
        <Upload className="w-4 h-4 text-[#E8AF25] mb-1.5" aria-hidden="true" />
        <span className="text-xs font-semibold text-white">
          {label ||
            `Upload ${kind}${multiple ? 's' : ''} to ${visibility === 'private' ? 'Private Storage' : 'Public Media'}`}
        </span>
        <span className="text-[11px] text-slate-400 mt-0.5">
          {kind === 'image' && 'JPG, PNG, WebP · max 20 MB per file'}
          {kind === 'video' && 'MP4, WebM, MOV · max 100 MB per file'}
          {kind === 'document' && 'PDF only · max 25 MB'}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {tasks.length > 0 && (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-xl border border-white/10 bg-[#05070D] px-3.5 py-2.5 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium text-slate-200">{task.fileName}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {task.status === 'uploading' && (
                    <>
                      <span className="text-[#F3D754] tabular-nums">{task.progress}%</span>
                      <button
                        type="button"
                        onClick={() => cancelMapRef.current[task.id]?.()}
                        aria-label={`Cancel upload for ${task.fileName}`}
                        className="text-slate-400 hover:text-red-300"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </>
                  )}
                  {task.status === 'completed' && (
                    <span className="inline-flex items-center gap-1 text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Uploaded
                    </span>
                  )}
                  {(task.status === 'error' || task.status === 'cancelled') && (
                    <button
                      type="button"
                      onClick={() => {
                        const file = fileMapRef.current[task.id];
                        if (file) startUpload(file, task.id);
                      }}
                      className="inline-flex items-center gap-1 text-[#F3D754] hover:underline"
                    >
                      <RefreshCw className="w-3 h-3" aria-hidden="true" />
                      Retry
                    </button>
                  )}
                </div>
              </div>

              {task.status === 'uploading' && (
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[#E8AF25] transition-all duration-150"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              )}

              {task.error && (
                <div className="flex items-start gap-1.5 text-[11px] text-red-300">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{task.error}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
