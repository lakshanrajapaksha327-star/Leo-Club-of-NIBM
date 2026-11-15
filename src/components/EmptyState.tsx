import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  icon,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B0F1A]/95 px-6 py-12 md:px-10 md:py-14 text-center max-w-2xl mx-auto shadow-xl">
      {icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#7A184D]/20 border border-[#E8AF25]/25 text-[#F3D754]">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg md:text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2.5 text-sm md:text-base text-slate-400 leading-relaxed max-w-lg mx-auto">
        {description}
      </p>
      {actionLabel && actionTo && (
        <div className="mt-6">
          <Link
            to={actionTo}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-slate-100 hover:border-[#F3D754] hover:text-[#F3D754] hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap shrink-0"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}
