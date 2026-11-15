import { useState } from 'react';
import {
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  Camera,
  Database,
  FileCheck2,
  FolderKanban,
  HardDrive,
  Lock,
  Settings,
  Shield,
  Upload,
  Users,
} from 'lucide-react';
import { SERVICE_CATEGORIES } from '../data/brand';
import { useClubData } from '../context/ClubContext';
import {
  generateSlug,
  parseVideoEmbedUrl,
  validateMediaFile,
} from '../utils/clubLogic';
import { PageShell } from '../components/Reveal';

type AdminTab =
  | 'projects'
  | 'team'
  | 'publications'
  | 'events'
  | 'gallery'
  | 'awards'
  | 'settings';

const ADMIN_TABS: { id: AdminTab; label: string; icon: typeof FolderKanban }[] = [
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'team', label: 'Executive Board', icon: Users },
  { id: 'publications', label: 'Magazines', icon: BookOpen },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'gallery', label: 'Gallery', icon: Camera },
  { id: 'awards', label: 'Awards', icon: Award },
  { id: 'settings', label: 'Site Settings', icon: Settings },
];

const ROLE_MATRIX = [
  {
    role: 'superAdmin',
    summary: 'Full access, role grants, site settings, publish & archive across all modules.',
  },
  {
    role: 'president',
    summary: 'Review, approve, publish, and archive projects, events, officers, and awards.',
  },
  {
    role: 'secretary',
    summary: 'Approve and publish club records, events, publications, and enquiries.',
  },
  {
    role: 'projectEditor',
    summary: 'Create project drafts, upload media, edit details, and submit for approval.',
  },
  {
    role: 'mediaEditor',
    summary: 'Upload approved photo albums, captions, alt text, and video embeds.',
  },
  {
    role: 'viewer',
    summary: 'Read-only access to internal admin status and submitted drafts.',
  },
] as const;

export function AdminPage() {
  const { backendStatus, settings } = useClubData();
  const [activeTab, setActiveTab] = useState<AdminTab>('projects');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [category, setCategory] = useState<string>(SERVICE_CATEGORIES[0]);
  const [videoInput, setVideoInput] = useState('');
  const [fileFeedback, setFileFeedback] = useState<string | null>(null);

  const parsedVideo = videoInput.trim() ? parseVideoEmbedUrl(videoInput) : null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugEdited) {
      setSlug(generateSlug(val));
    }
  };

  const handleFileCheck = (files: FileList | null, kind: 'image' | 'video') => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const check = validateMediaFile(file, kind);
    if (!check.valid) {
      setFileFeedback(check.reason || 'Invalid file.');
    } else {
      setFileFeedback(
        `${file.name} passed validation (${(file.size / (1024 * 1024)).toFixed(2)} MB). Connect Firebase Storage (Blaze plan) to enable live uploads.`,
      );
    }
  };

  return (
    <PageShell>
      <section className="border-b border-white/10 bg-[#05070D] bg-d7-atmosphere py-14 md:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 text-xs font-semibold tracking-wide text-[#F3D754]">
            <Shield className="w-4 h-4" aria-hidden="true" />
            <span>Role-Gated Content Management</span>
          </div>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-white">
            Admin Portal & Club CMS
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-3xl">
            Manage Leo Club of NIBM projects, Executive Board portraits (President, Secretary, Treasurer), magazines, events, gallery albums, awards, and club history for {settings.currentLeosticYear}.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[#080B13] bg-grid-architectural">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Backend Connection Notice */}
          <div className="rounded-2xl border border-[#E8AF25]/35 bg-[#0B0F1A] p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <Lock className="w-5 h-5 text-[#F3D754] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h2 className="font-display text-lg font-semibold text-white">
                    Firebase Authentication & Backend Required
                  </h2>
                  <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                    Google Sign-In and live database writes are disabled until Firebase Authentication, Cloud Firestore, and Cloud Storage are provisioned. No fake login or browser localStorage persistence is used.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={!backendStatus.authConnected}
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-white/10 px-5 py-2.5 text-xs font-semibold text-slate-300 cursor-not-allowed whitespace-nowrap shrink-0"
              >
                Sign in with Google (Awaiting Step 2)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-white/10 text-xs">
              <div className="rounded-xl border border-white/10 bg-[#05070D] p-4 space-y-1">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <Database className="w-4 h-4 text-[#E8AF25]" aria-hidden="true" />
                  <span>Cloud Firestore</span>
                </div>
                <p className="text-slate-400">
                  Status: Not provisioned. Choose an Asia region carefully (e.g. asia-south1 Mumbai) — region cannot be changed later.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#05070D] p-4 space-y-1">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <HardDrive className="w-4 h-4 text-[#E8AF25]" aria-hidden="true" />
                  <span>Cloud Storage</span>
                </div>
                <p className="text-slate-400">
                  Requires Firebase Blaze pay-as-you-go plan for default bucket media uploads (20 MB images / 100 MB videos).
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#05070D] p-4 space-y-1">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <FileCheck2 className="w-4 h-4 text-[#E8AF25]" aria-hidden="true" />
                  <span>First Super Admin</span>
                </div>
                <p className="text-slate-400">
                  Granted manually by the project owner in Firestore Console on users/&#123;uid&#125;. Self-assignment is blocked.
                </p>
              </div>
            </div>
          </div>

          {/* CMS Module Tabs */}
          <div className="flex flex-wrap gap-2">
            {ADMIN_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-[#E8AF25] text-[#05070D]'
                      : 'border border-white/12 bg-[#0B0F1A] text-slate-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-5">
              {activeTab === 'projects' && (
                <>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-white">
                      Project Editor Workflow
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                      Test the validated project slug generator, YouTube/Vimeo parser, and media constraint checker.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="admin-proj-title" className="block text-xs font-medium text-slate-300 mb-1.5">
                        Official Project Title
                      </label>
                      <input
                        id="admin-proj-title"
                        type="text"
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="e.g. NIBM Green Horizon"
                        className="w-full min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white placeholder:text-slate-500 focus:border-[#E8AF25] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="admin-proj-slug" className="block text-xs font-medium text-slate-300 mb-1.5">
                        URL Slug (auto-generated, editable)
                      </label>
                      <input
                        id="admin-proj-slug"
                        type="text"
                        value={slug}
                        onChange={(e) => {
                          setSlugEdited(true);
                          setSlug(generateSlug(e.target.value));
                        }}
                        placeholder="nibm-green-horizon"
                        className="w-full min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 font-mono text-xs text-[#F3D754] focus:border-[#E8AF25] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="admin-proj-category" className="block text-xs font-medium text-slate-300 mb-1.5">
                        Primary Service Category
                      </label>
                      <select
                        id="admin-proj-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white focus:border-[#E8AF25] focus:outline-none"
                      >
                        {SERVICE_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="admin-proj-video" className="block text-xs font-medium text-slate-300 mb-1.5">
                        YouTube / Vimeo URL Validator
                      </label>
                      <input
                        id="admin-proj-video"
                        type="url"
                        value={videoInput}
                        onChange={(e) => setVideoInput(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white placeholder:text-slate-500 focus:border-[#E8AF25] focus:outline-none"
                      />
                      {parsedVideo && (
                        <p
                          className={`mt-1 text-[11px] ${
                            parsedVideo.provider === 'invalid' ? 'text-red-400' : 'text-emerald-300'
                          }`}
                        >
                          {parsedVideo.provider === 'invalid'
                            ? 'Enter a valid YouTube, Vimeo, or direct MP4/WebM URL.'
                            : `Valid ${parsedVideo.provider} embed detected.`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-dashed border-white/20 bg-[#05070D] p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
                      <Upload className="w-4 h-4 text-[#E8AF25]" aria-hidden="true" />
                      <span>Media Constraint Check (JPG/PNG/WebP ≤ 20 MB · MP4/WebM/MOV ≤ 100 MB)</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <label className="cursor-pointer rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 transition-colors">
                        Test Image File
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="sr-only"
                          onChange={(e) => handleFileCheck(e.target.files, 'image')}
                        />
                      </label>
                      <label className="cursor-pointer rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 transition-colors">
                        Test Video File
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime"
                          className="sr-only"
                          onChange={(e) => handleFileCheck(e.target.files, 'video')}
                        />
                      </label>
                    </div>
                    {fileFeedback && <p className="text-xs text-[#F3D754]">{fileFeedback}</p>}
                  </div>
                </>
              )}

              {activeTab !== 'projects' && (
                <div className="space-y-4">
                  <h2 className="font-display text-xl font-semibold text-white capitalize">
                    {ADMIN_TABS.find((t) => t.id === activeTab)?.label} Manager
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {activeTab === 'team' &&
                      'Add and order Executive Board portraits, names, positions (President, Secretary, Treasurer, Vice Presidents, Directors), and biographies per Leostic year without overwriting past terms.'}
                    {activeTab === 'publications' &&
                      'Upload club newsletter covers, issue labels, dates, and public PDF links for the Latest Magazines homepage showcase and /publications archive.'}
                    {activeTab === 'events' &&
                      'Publish upcoming club meetings, fellowships, and service drives with dates, venues, and registration links.'}
                    {activeTab === 'gallery' &&
                      'Create photo albums with captions, alt text, ordering, and participant consent verification.'}
                    {activeTab === 'awards' &&
                      'Record verified district and multiple district awards by Leostic year for the Our Key Awards showcase.'}
                    {activeTab === 'settings' &&
                      'Configure official club email, phone, social handles, annual theme, charter date, mission, vision, history, and verified impact metrics.'}
                  </p>
                  <div className="rounded-xl border border-white/10 bg-[#05070D] p-4 text-xs text-slate-400">
                    Live create, edit, publish, and archive actions activate immediately once Firebase Authentication and Firestore are connected in Step 2.
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-start gap-2.5 text-xs text-slate-400">
                <AlertTriangle className="w-4 h-4 text-[#E8AF25] shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Internal approval forms, invoices, and private member sheets must only be uploaded to restricted private storage paths once Firebase Storage is configured, never to public-media.
                </span>
              </div>
            </div>

            {/* Role Matrix */}
            <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-4">
              <h2 className="font-display text-xl font-semibold text-white">
                Access Roles Matrix
              </h2>
              <p className="text-xs text-slate-400">
                Only Super Admin, President, and Secretary can publish records publicly.
              </p>

              <div className="divide-y divide-white/10">
                {ROLE_MATRIX.map((item) => (
                  <div key={item.role} className="py-3">
                    <div className="font-mono text-xs font-semibold text-[#F3D754]">
                      {item.role}
                    </div>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
