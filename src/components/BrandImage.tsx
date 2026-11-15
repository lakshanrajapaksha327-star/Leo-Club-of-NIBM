import { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface BrandImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function BrandImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackLabel,
}: BrandImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#131929] via-[#1C142B] to-[#0D111A] text-slate-400 p-4 text-center"
      >
        <ImageOff className="w-6 h-6 text-[#E8AF25]/70" aria-hidden="true" />
        <span className="text-xs font-medium text-slate-300 line-clamp-2">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
