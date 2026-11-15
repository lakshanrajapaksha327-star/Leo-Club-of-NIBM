import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Check,
  Copy,
  FileText,
  FolderKanban,
  MapPin,
  Share2,
  User,
  Users,
} from 'lucide-react';
import { useClubData } from '../context/ClubContext';
import { parseVideoEmbedUrl } from '../utils/clubLogic';
import { PageShell } from '../components/Reveal';
import { BrandImage } from '../components/BrandImage';
import { EmptyState } from '../components/EmptyState';
import { Lightbox, type LightboxPhoto } from '../components/Lightbox';
import { ProjectCard } from '../components/ProjectCard';

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { projects, loading } = useClubData();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const publishedProjects = useMemo(
    () => projects.filter((p) => p.publicationStatus === 'published'),
    [projects],
  );

  const project = useMemo(
    () => publishedProjects.find((p) => p.slug === slug) || null,
    [publishedProjects, slug],
  );

  const relatedProjects = useMemo(() => {
    if (!project) return [];
    return publishedProjects
      .filter((p) => p.id !== project.id)
      .sort((a, b) => (a.category === project.category ? -1 : b.category === project.category ? 1 : 0))
      .slice(0, 3);
  }, [publishedProjects, project]);

  const galleryPhotos: LightboxPhoto[] = useMemo(() => {
    if (!project) return [];
    return project.media
      .filter((m) => m.type === 'image')
      .sort((a, b) => a.order - b.order)
      .map((m) => ({
        id: m.id,
        url: m.url,
        caption: m.caption,
        altText: m.altText || project.title,
      }));
  }, [project]);

  const uploadedVideos = useMemo(
    () => (project ? project.media.filter((m) => m.type === 'video') : []),
    [project],
  );

  const embedVideos = useMemo(() => {
    if (!project) return [];
    return project.videoUrls
      .map((url) => ({ raw: url, parsed: parseVideoEmbedUrl(url) }))
      .filter((v) => v.parsed.provider !== 'invalid' && v.parsed.embedUrl);
  }, [project]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  };

  if (loading) {
    return (
      <PageShell className="py-20 px-4 max-w-4xl mx-auto">
        <div className="h-96 rounded-2xl border border-white/10 bg-[#0B0F1A] animate-pulse" />
      </PageShell>
    );
  }

  if (!project) {
    return (
      <PageShell className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <EmptyState
          icon={<FolderKanban className="w-6 h-6" aria-hidden="true" />}
          title="Project story not found"
          description="This project either does not exist, has not been published yet, or is awaiting review in the club archive."
          actionLabel="Back to Projects Archive"
          actionTo="/projects"
        />
      </PageShell>
    );
  }

  const storySections = project.storySections;
  const hasStructuredSections =
    storySections &&
    Object.values(storySections).some((val) => typeof val === 'string' && val.trim().length > 0);

  return (
    <PageShell>
      {/* Editorial Article Header */}
      <article className="bg-[#080B13] bg-grid-architectural">
        <header className="border-b border-white/10 bg-[#05070D] bg-d7-atmosphere py-12 md:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-[#F3D754] transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>All Projects</span>
            </Link>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-400">
              <span className="text-[#F3D754] font-semibold">{project.category}</span>
              {project.secondaryCategory && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{project.secondaryCategory}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">Leostic Year {project.leosticYear}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{project.status}</span>
            </div>

            <h1 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-white leading-tight">
              {project.title}
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
              {project.summary}
            </p>

            {/* Fact Strip */}
            <dl className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-6 text-sm">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-[#E8AF25] mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-slate-400">Project Dates</dt>
                  <dd className="text-slate-100 tabular-nums mt-0.5">
                    {project.startDate}
                    {project.endDate ? ` — ${project.endDate}` : ''}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E8AF25] mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-slate-400">Location</dt>
                  <dd className="text-slate-100 mt-0.5">{project.location || 'NIBM, Sri Lanka'}</dd>
                </div>
              </div>

              {project.projectChair && (
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-[#E8AF25] mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <dt className="text-xs text-slate-400">Project Chairperson</dt>
                    <dd className="text-slate-100 mt-0.5">{project.projectChair}</dd>
                  </div>
                </div>
              )}
            </dl>
          </div>
        </header>

        {/* Cover Image */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
          <figure className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F1A]">
            <div className="aspect-[16/9]">
              <BrandImage
                src={project.coverImage}
                alt={project.coverAlt || project.title}
                fallbackLabel={project.title}
              />
            </div>
            {project.coverAlt && (
              <figcaption className="px-5 py-3 text-xs text-slate-400 border-t border-white/10">
                {project.coverAlt}
              </figcaption>
            )}
          </figure>
        </div>

        {/* Main Long-Form Story + Sidebar Facts */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Editorial Story Body */}
          <div className="lg:col-span-8 space-y-8">
            {hasStructuredSections ? (
              <div className="space-y-8">
                {[
                  { heading: 'Background', body: storySections?.background },
                  { heading: 'Need', body: storySections?.need },
                  { heading: 'Objectives', body: storySections?.objectives },
                  { heading: 'What We Did', body: storySections?.whatWeDid },
                  { heading: 'Outcomes', body: storySections?.outcomes },
                  { heading: 'Reflection & Next Steps', body: storySections?.reflection },
                ]
                  .filter((sec) => sec.body && sec.body.trim().length > 0)
                  .map((sec) => (
                    <section key={sec.heading} className="space-y-2.5">
                      <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                        {sec.heading}
                      </h2>
                      <p className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line">
                        {sec.body}
                      </p>
                    </section>
                  ))}
              </div>
            ) : (
              <div className="space-y-4 text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line">
                {project.story}
              </div>
            )}

            {/* Photo Gallery */}
            {galleryPhotos.length > 0 && (
              <section className="pt-8 border-t border-white/10">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-white mb-4">
                  Project Photo Gallery
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {galleryPhotos.map((photo, idx) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setLightboxIndex(idx)}
                      className="group text-left overflow-hidden rounded-xl border border-white/10 bg-[#0B0F1A] hover:border-[#E8AF25]/50 transition-colors"
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <BrandImage
                          src={photo.url}
                          alt={photo.altText}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      </div>
                      {photo.caption && (
                        <div className="p-3 text-xs text-slate-300">{photo.caption}</div>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Embedded & Uploaded Videos */}
            {(embedVideos.length > 0 || uploadedVideos.length > 0) && (
              <section className="pt-8 border-t border-white/10 space-y-5">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                  Project Videos
                </h2>
                <div className="space-y-6">
                  {embedVideos.map((vid) => (
                    <div
                      key={vid.raw}
                      className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black"
                    >
                      {vid.parsed.provider === 'direct' ? (
                        <video controls className="w-full h-full" src={vid.parsed.embedUrl || undefined} />
                      ) : (
                        <iframe
                          title={`${project.title} video`}
                          src={vid.parsed.embedUrl || undefined}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                    </div>
                  ))}
                  {uploadedVideos.map((vid) => (
                    <figure
                      key={vid.id}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F1A]"
                    >
                      <video controls className="w-full aspect-video bg-black" src={vid.url} />
                      {vid.caption && (
                        <figcaption className="px-4 py-2.5 text-xs text-slate-300">
                          {vid.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar: Impact Metrics, Organisers, Partners, Approved Docs, Share */}
          <aside className="lg:col-span-4 space-y-6">
            {project.metrics.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-4">
                <h2 className="font-display text-base font-semibold text-white">
                  Verified Impact
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {project.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="rounded-xl border border-white/10 bg-[#05070D] p-4"
                    >
                      <div className="font-display text-2xl font-bold text-[#F3D754] tabular-nums">
                        {m.value}
                      </div>
                      <div className="text-xs text-slate-300 mt-1">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(project.organisers?.length || project.partners.length > 0) && (
              <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-4">
                {project.organisers && project.organisers.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold tracking-wide text-[#F3D754] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#E8AF25]" aria-hidden="true" />
                      <span>Organising Team</span>
                    </h3>
                    <ul className="mt-2 space-y-1 text-sm text-slate-200">
                      {project.organisers.map((org) => (
                        <li key={org}>{org}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {project.partners.length > 0 && (
                  <div className="pt-3 border-t border-white/10">
                    <h3 className="text-xs font-semibold tracking-wide text-[#F3D754]">
                      Partner Organisations
                    </h3>
                    <ul className="mt-2 space-y-1 text-sm text-slate-200">
                      {project.partners.map((partner) => (
                        <li key={partner}>{partner}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {project.documents && project.documents.some((d) => d.publicApproved) && (
              <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-3">
                <h2 className="font-display text-base font-semibold text-white">
                  Public Documents
                </h2>
                <ul className="space-y-2">
                  {project.documents
                    .filter((d) => d.publicApproved)
                    .map((doc) => (
                      <li key={doc.id}>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-[#F3D754] hover:underline"
                        >
                          <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>{doc.title}</span>
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-3">
              <h2 className="font-display text-sm font-semibold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#E8AF25]" aria-hidden="true" />
                <span>Share This Story</span>
              </h2>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-white hover:border-[#E8AF25]/50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#F3D754]" aria-hidden="true" />
                    <span>Link copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" aria-hidden="true" />
                    <span>Copy project link</span>
                  </>
                )}
              </button>
            </div>
          </aside>
        </div>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <section className="border-t border-white/10 bg-[#05070D] py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="font-display text-2xl font-bold text-white mb-6">
                Related Projects
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedProjects.map((rel) => (
                  <ProjectCard key={rel.id} project={rel} />
                ))}
              </div>
            </div>
          </section>
        )}
      </article>

      <Lightbox
        photos={galleryPhotos}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={(next) => setLightboxIndex(next)}
      />
    </PageShell>
  );
}
