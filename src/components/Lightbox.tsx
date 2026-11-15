import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

export interface LightboxPhoto {
  id: string;
  url: string;
  caption: string;
  altText: string;
}

interface LightboxProps {
  photos: LightboxPhoto[];
  activeIndex: number | null;
  onClose: () => void;
  onChangeIndex: (nextIndex: number) => void;
}

export function Lightbox({
  photos,
  activeIndex,
  onClose,
  onChangeIndex,
}: LightboxProps) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (activeIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && photos.length > 1) {
        onChangeIndex((activeIndex + 1) % photos.length);
      } else if (e.key === 'ArrowLeft' && photos.length > 1) {
        onChangeIndex((activeIndex - 1 + photos.length) % photos.length);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIndex, photos.length, onClose, onChangeIndex]);

  const current = activeIndex !== null ? photos[activeIndex] : null;

  return (
    <AnimatePresence>
      {activeIndex !== null && current && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={current.caption || current.altText || 'Image preview'}
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070D]/92 backdrop-blur-md p-4 md:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-5xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-300">
              <span className="tabular-nums">
                Photo {activeIndex + 1} of {photos.length}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close image lightbox"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white hover:bg-white/15 transition-colors"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="relative w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded-2xl border border-white/12 bg-[#0B0F1A]">
              <img
                src={current.url}
                alt={current.altText}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />

              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => onChangeIndex((activeIndex - 1 + photos.length) % photos.length)}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/65 border border-white/15 text-white hover:bg-[#E8AF25] hover:text-[#05070D] transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeIndex((activeIndex + 1) % photos.length)}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/65 border border-white/15 text-white hover:bg-[#E8AF25] hover:text-[#05070D] transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>

            {(current.caption || current.altText) && (
              <p className="mt-3 text-sm text-slate-300 text-center max-w-2xl">
                {current.caption || current.altText}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
