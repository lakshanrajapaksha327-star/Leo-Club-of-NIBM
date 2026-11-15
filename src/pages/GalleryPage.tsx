import { useMemo, useState } from 'react';
import { Camera } from 'lucide-react';
import { useClubData } from '../context/ClubContext';
import { PageShell } from '../components/Reveal';
import { EmptyState } from '../components/EmptyState';
import { BrandImage } from '../components/BrandImage';
import { Lightbox, type LightboxPhoto } from '../components/Lightbox';

export function GalleryPage() {
  const { galleries, settings, loading } = useClubData();
  const [selectedYear, setSelectedYear] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const publishedAlbums = useMemo(
    () =>
      galleries
        .filter((g) => g.publicationStatus === 'published')
        .filter((g) => (selectedYear === 'all' ? true : g.leosticYear === selectedYear)),
    [galleries, selectedYear],
  );

  const allPhotos: LightboxPhoto[] = useMemo(
    () =>
      publishedAlbums.flatMap((album) =>
        album.photos
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((photo) => ({
            id: photo.id,
            url: photo.url,
            caption: photo.caption || album.title,
            altText: photo.altText || `${album.title} photograph`,
          })),
      ),
    [publishedAlbums],
  );

  return (
    <PageShell>
      <section className="border-b border-white/10 bg-[#05070D] bg-d7-atmosphere py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#F3D754]">
              Visual Archive
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-5xl font-bold text-white">
              Photo Gallery
            </h1>
            <p className="mt-3 text-base text-slate-300 max-w-2xl">
              Approved photography from service initiatives, inductions, and club fellowships.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedYear('all')}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                selectedYear === 'all'
                  ? 'bg-[#E8AF25] text-[#080B12]'
                  : 'border border-white/12 bg-[#0B0F1A] text-slate-300 hover:text-white'
              }`}
            >
              All years
            </button>
            {settings.availableYears.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold tabular-nums transition-colors whitespace-nowrap shrink-0 ${
                  selectedYear === yr
                    ? 'bg-[#E8AF25] text-[#080B12]'
                    : 'border border-white/12 bg-[#0B0F1A] text-slate-300 hover:text-white'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-[#080B13] bg-grid-architectural min-h-[50vh]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-64 rounded-2xl border border-white/10 bg-[#0B0F1A] animate-pulse"
                />
              ))}
            </div>
          ) : allPhotos.length === 0 ? (
            <EmptyState
              icon={<Camera className="w-6 h-6" aria-hidden="true" />}
              title="No approved gallery photographs yet"
              description="Only genuine club photographs uploaded and approved by administrators (with captions, alt text, and participant consent verified) appear here."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPhotos.map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className="group text-left overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F1A] hover:border-[#E8AF25]/50 transition-colors"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <BrandImage
                      src={photo.url}
                      alt={photo.altText}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-4 text-xs text-slate-300">{photo.caption}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <Lightbox
        photos={allPhotos}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={(next) => setLightboxIndex(next)}
      />
    </PageShell>
  );
}
