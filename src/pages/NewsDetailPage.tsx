import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Check, Copy, Newspaper, Share2 } from 'lucide-react';
import { useClubData } from '../context/ClubContext';
import { PageShell } from '../components/Reveal';
import { BrandImage } from '../components/BrandImage';
import { EmptyState } from '../components/EmptyState';

export function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { news, loading } = useClubData();
  const [copied, setCopied] = useState(false);

  const article = useMemo(
    () =>
      news.find((n) => n.publicationStatus === 'published' && n.slug === slug) || null,
    [news, slug],
  );

  useEffect(() => {
    if (!article) return;
    const prevTitle = document.title;
    document.title = `${article.title} | Leo Club of NIBM`;
    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute('content') || '';
    if (metaDesc) {
      metaDesc.setAttribute('content', article.excerpt);
    }
    return () => {
      document.title = prevTitle;
      if (metaDesc && prevDesc) {
        metaDesc.setAttribute('content', prevDesc);
      }
    };
  }, [article]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  if (loading) {
    return (
      <PageShell className="py-20 px-4 max-w-4xl mx-auto">
        <div className="h-96 rounded-2xl border border-white/10 bg-[#0B0F1A] animate-pulse" />
      </PageShell>
    );
  }

  if (!article) {
    return (
      <PageShell className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <EmptyState
          icon={<Newspaper className="w-6 h-6" aria-hidden="true" />}
          title="News article not found"
          description="This article does not exist or has not been published yet."
          actionLabel="Back to News & Updates"
          actionTo="/news"
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <article className="bg-[#080B13] bg-grid-architectural">
        <header className="border-b border-white/10 bg-[#05070D] bg-d7-atmosphere py-12 md:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Link
              to="/news"
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-[#F3D754] transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>All News & Updates</span>
            </Link>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 text-[#F3D754] font-semibold tabular-nums">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                {article.date}
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">Leostic Year {article.leosticYear}</span>
            </div>

            <h1 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-white leading-tight">
              {article.title}
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
              {article.excerpt}
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {article.coverUrl && (
            <figure className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F1A]">
              <div className="aspect-[16/9]">
                <BrandImage
                  src={article.coverUrl}
                  alt={article.title}
                  fallbackLabel={article.title}
                />
              </div>
            </figure>
          )}

          <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 sm:p-9 space-y-6">
            <div className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line">
              {article.body}
            </div>

            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-slate-400 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#E8AF25]" aria-hidden="true" />
                Share this club update
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white hover:border-[#E8AF25]/50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#F3D754]" aria-hidden="true" />
                    <span>Link copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Copy article link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
