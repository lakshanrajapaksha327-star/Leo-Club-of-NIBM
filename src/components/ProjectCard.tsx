import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '../types/club';
import { BrandImage } from './BrandImage';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F1A] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-[#E8AF25]/55 hover:shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
      <Link
        to={`/projects/${project.slug}`}
        className="relative aspect-[4/3] overflow-hidden bg-[#111726] block"
      >
        <BrandImage
          src={project.coverImage}
          alt={project.coverAlt || project.title}
          fallbackLabel={project.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
          <span className="text-[#F3D754] font-medium">{project.category}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{project.leosticYear}</span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">{project.status}</span>
        </div>

        <h3 className="mt-2.5 font-display text-lg font-semibold text-white leading-snug group-hover:text-[#F3D754] transition-colors">
          <Link to={`/projects/${project.slug}`}>{project.title}</Link>
        </h3>

        <p className="mt-2.5 text-sm text-slate-300 leading-relaxed line-clamp-3 flex-1">
          {project.summary}
        </p>

        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-4 text-xs text-slate-400">
          <span className="truncate">{project.location || 'NIBM, Sri Lanka'}</span>
          <Link
            to={`/projects/${project.slug}`}
            className="inline-flex items-center gap-1 font-medium text-slate-200 group-hover:text-[#F3D754] transition-colors whitespace-nowrap shrink-0"
          >
            <span>Read story</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
