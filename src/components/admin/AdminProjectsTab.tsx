import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  FileText,
  Image as ImageIcon,
  Plus,
  Save,
  Star,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import type {
  Project,
  ProjectDocument,
  ProjectMedia,
  ProjectMetric,
  ProjectStatus,
  PublicationStatus,
  SiteSettings,
  TaxonomyItem,
  UserProfile,
} from '../../types/club';
import {
  canRolePerform,
  canTransitionPublicationStatus,
  generateSlug,
  parseVideoEmbedUrl,
} from '../../utils/clubLogic';
import { deleteProject, saveProject } from '../../services/contentService';
import { deleteStorageAsset } from '../../services/mediaService';
import { formatFriendlyFirebaseError } from '../../lib/firebase';
import { MediaUploader } from './MediaUploader';

interface AdminProjectsTabProps {
  userProfile: UserProfile;
  settings: SiteSettings;
  projects: Project[];
  serviceCategories: TaxonomyItem[];
}

const ALL_PUB_STATUSES: PublicationStatus[] = [
  'draft',
  'submitted',
  'underReview',
  'approved',
  'published',
  'archived',
  'rejected',
];

function emptyProject(settings: SiteSettings, categories: TaxonomyItem[]): Omit<Project, 'id'> {
  return {
    title: '',
    slug: '',
    summary: '',
    story: '',
    storySections: {
      background: '',
      need: '',
      objectives: '',
      planning: '',
      implementation: '',
      whatWeDid: '',
      outcomes: '',
      futurePhases: '',
      reflection: '',
    },
    category: categories[0]?.name || 'Community & Rural Development',
    secondaryCategory: '',
    leosticYear: settings.currentLeosticYear,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    location: 'NIBM, Sri Lanka',
    status: 'planned',
    publicationStatus: 'draft',
    coverImage: '',
    coverAlt: '',
    media: [],
    videoUrls: [],
    documents: [],
    metrics: [],
    partners: [],
    projectChair: '',
    organisers: [],
    participatingLeos: '',
    beneficiaries: '',
    volunteerHours: '',
    fundsDisplayApproved: false,
    evidenceNote: '',
    reviewNote: '',
    featured: false,
  };
}

export function AdminProjectsTab({
  userProfile,
  settings,
  projects,
  serviceCategories,
}: AdminProjectsTabProps) {
  const canEdit = canRolePerform(userProfile.role, 'editContent');
  const canPublish = canRolePerform(userProfile.role, 'publish');
  const canDelete = canRolePerform(userProfile.role, 'delete');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Project, 'id'>>(() =>
    emptyProject(settings, serviceCategories),
  );
  const [slugEdited, setSlugEdited] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [videoInput, setVideoInput] = useState('');
  const [partnerInput, setPartnerInput] = useState('');
  const [organiserInput, setOrganiserInput] = useState('');
  const [metricLabel, setMetricLabel] = useState('');
  const [metricValue, setMetricValue] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [docPublicApproved, setDocPublicApproved] = useState(false);

  const recordKey = selectedId || form.slug || `draft-${Date.now()}`;

  const activeCategories = useMemo(
    () => serviceCategories.filter((c) => c.active),
    [serviceCategories],
  );

  const filteredProjects = useMemo(
    () =>
      projects.filter((p) =>
        filterStatus === 'all' ? true : p.publicationStatus === filterStatus,
      ),
    [projects, filterStatus],
  );

  const loadForEdit = (proj: Project) => {
    setSelectedId(proj.id);
    setSlugEdited(true);
    setFeedback(null);
    setForm({
      title: proj.title,
      slug: proj.slug,
      summary: proj.summary,
      story: proj.story,
      storySections: {
        background: proj.storySections?.background || '',
        need: proj.storySections?.need || '',
        objectives: proj.storySections?.objectives || '',
        planning: proj.storySections?.planning || '',
        implementation: proj.storySections?.implementation || '',
        whatWeDid: proj.storySections?.whatWeDid || '',
        outcomes: proj.storySections?.outcomes || '',
        futurePhases: proj.storySections?.futurePhases || '',
        reflection: proj.storySections?.reflection || '',
      },
      category: proj.category,
      secondaryCategory: proj.secondaryCategory || '',
      leosticYear: proj.leosticYear,
      startDate: proj.startDate,
      endDate: proj.endDate || '',
      location: proj.location,
      status: proj.status,
      publicationStatus: proj.publicationStatus,
      coverImage: proj.coverImage,
      coverAlt: proj.coverAlt,
      media: proj.media || [],
      videoUrls: proj.videoUrls || [],
      documents: proj.documents || [],
      metrics: proj.metrics || [],
      partners: proj.partners || [],
      projectChair: proj.projectChair || '',
      organisers: proj.organisers || [],
      participatingLeos: proj.participatingLeos || '',
      beneficiaries: proj.beneficiaries || '',
      volunteerHours: proj.volunteerHours || '',
      fundsDisplayApproved: Boolean(proj.fundsDisplayApproved),
      evidenceNote: proj.evidenceNote || '',
      reviewNote: proj.reviewNote || '',
      reviewedBy: proj.reviewedBy,
      reviewedAt: proj.reviewedAt,
      publishedAt: proj.publishedAt,
      featured: Boolean(proj.featured),
    });
  };

  const startNew = () => {
    setSelectedId(null);
    setSlugEdited(false);
    setFeedback(null);
    setForm(emptyProject(settings, activeCategories));
  };

  const handleSave = async (overridePubStatus?: PublicationStatus) => {
    if (!canEdit) return;
    setFeedback(null);

    const targetStatus = overridePubStatus || form.publicationStatus;
    if (!canTransitionPublicationStatus(userProfile.role, targetStatus)) {
      setFeedback({
        type: 'err',
        text: `Role "${userProfile.role}" cannot set publication status to "${targetStatus}". Submit for review instead.`,
      });
      return;
    }

    if (form.title.trim().length < 2 || form.summary.trim().length < 10) {
      setFeedback({
        type: 'err',
        text: 'Enter a valid project title and a summary of at least 10 characters.',
      });
      return;
    }

    setSaving(true);
    try {
      const savedId = await saveProject(userProfile, {
        ...form,
        id: selectedId || undefined,
        publicationStatus: targetStatus,
        reviewedBy: canPublish ? userProfile.uid : form.reviewedBy,
        reviewedAt: canPublish ? new Date().toISOString().slice(0, 10) : form.reviewedAt,
      });
      setSelectedId(savedId);
      setForm((prev) => ({ ...prev, publicationStatus: targetStatus }));
      setFeedback({
        type: 'ok',
        text: `Project saved (${targetStatus}).`,
      });
    } catch (err) {
      setFeedback({ type: 'err', text: formatFriendlyFirebaseError(err) });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (proj: Project) => {
    if (!canDelete) return;
    setFeedback(null);
    try {
      await deleteProject(userProfile, proj.id, proj.title);
      if (selectedId === proj.id) startNew();
      setFeedback({ type: 'ok', text: `Deleted project "${proj.title}".` });
    } catch (err) {
      setFeedback({ type: 'err', text: formatFriendlyFirebaseError(err) });
    }
  };

  const moveMedia = (idx: number, delta: -1 | 1) => {
    setForm((prev) => {
      const next = [...prev.media];
      const target = idx + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return {
        ...prev,
        media: next.map((m, i) => ({ ...m, order: i + 1 })),
      };
    });
  };

  const removeMedia = async (item: ProjectMedia) => {
    if (item.storagePath) {
      await deleteStorageAsset(item.storagePath);
    }
    setForm((prev) => ({
      ...prev,
      media: prev.media.filter((m) => m.id !== item.id).map((m, i) => ({ ...m, order: i + 1 })),
    }));
  };

  const parsedVideo = videoInput.trim() ? parseVideoEmbedUrl(videoInput) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left List */}
      <div className="lg:col-span-4 space-y-4">
        <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-white">
              Projects ({filteredProjects.length})
            </h2>
            {canEdit && (
              <button
                type="button"
                onClick={startNew}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-[#05070D] hover:bg-[#F3D754] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>New Project</span>
              </button>
            )}
          </div>

          <select
            aria-label="Filter admin projects by publication status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full min-h-[40px] rounded-xl border border-white/12 bg-[#05070D] px-3 text-xs text-slate-200"
          >
            <option value="all">All workflow statuses</option>
            {ALL_PUB_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredProjects.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No projects in this filter yet.
              </p>
            ) : (
              filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  className={`rounded-xl border p-3.5 transition-colors cursor-pointer ${
                    selectedId === proj.id
                      ? 'border-[#E8AF25] bg-[#7A184D]/20'
                      : 'border-white/10 bg-[#05070D] hover:border-white/25'
                  }`}
                  onClick={() => loadForEdit(proj)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{proj.title}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                        <span className="text-[#F3D754]">{proj.publicationStatus}</span>
                        <span>·</span>
                        <span className="capitalize">{proj.status}</span>
                        <span>·</span>
                        <span>{proj.leosticYear}</span>
                      </div>
                    </div>
                    {canDelete && (
                      <button
                        type="button"
                        aria-label={`Delete ${proj.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDelete(proj);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Full Editor */}
      <div className="lg:col-span-8 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 sm:p-7 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-white">
                {selectedId ? 'Edit Project Story' : 'Create New Project'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Activity status (planned/ongoing/completed) is independent from editorial publication approval.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white hover:border-[#E8AF25]"
            >
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Preview Story</span>
            </button>
          </div>

          {feedback && (
            <div
              role="status"
              className={`rounded-xl border px-4 py-3 text-xs ${
                feedback.type === 'ok'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  : 'border-red-500/35 bg-red-500/10 text-red-200'
              }`}
            >
              {feedback.text}
            </div>
          )}

          {/* Core Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Project Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    title: val,
                    slug: slugEdited ? prev.slug : generateSlug(val),
                  }));
                }}
                placeholder="e.g. NIBM Green Horizon"
                className="w-full min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                URL Slug *
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  setForm((prev) => ({ ...prev, slug: generateSlug(e.target.value) }));
                }}
                placeholder="nibm-green-horizon"
                className="w-full min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 font-mono text-xs text-[#F3D754]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Primary MD 306 Service Cause *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
              >
                {activeCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Secondary Service Cause (Optional)
              </label>
              <select
                value={form.secondaryCategory || ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, secondaryCategory: e.target.value }))
                }
                className="w-full min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
              >
                <option value="">None</option>
                {activeCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Leostic Year
              </label>
              <select
                value={form.leosticYear}
                onChange={(e) => setForm((prev) => ({ ...prev, leosticYear: e.target.value }))}
                className="w-full min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
              >
                {settings.availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Activity Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, status: e.target.value as ProjectStatus }))
                }
                className="w-full min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
              >
                <option value="planned">Planned</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Start Date *
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-full min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={form.endDate || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                className="w-full min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                className="w-full min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Project Chairperson
              </label>
              <input
                type="text"
                value={form.projectChair || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, projectChair: e.target.value }))}
                className="w-full min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              disabled={!canPublish}
              onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
              className="rounded border-white/25 bg-[#05070D]"
            />
            <span>Feature this project prominently in the Projects Archive & Homepage</span>
          </label>

          {/* Editorial Narrative */}
          <div className="space-y-4 pt-2 border-t border-white/10">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Short Summary * (min 10 characters)
              </label>
              <textarea
                rows={2}
                value={form.summary}
                onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
                className="w-full rounded-xl border border-white/12 bg-[#05070D] p-3 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Narrative Story
              </label>
              <textarea
                rows={4}
                value={form.story}
                onChange={(e) => setForm((prev) => ({ ...prev, story: e.target.value }))}
                placeholder="Write the main project story (or fill the structured sections below)..."
                className="w-full rounded-xl border border-white/12 bg-[#05070D] p-3 text-sm text-white"
              />
            </div>

            <details className="rounded-xl border border-white/10 bg-[#05070D] p-4">
              <summary className="cursor-pointer text-xs font-semibold text-[#F3D754]">
                Structured Story Sections (Background, Need, Objectives, Planning, Outcomes, Reflection)
              </summary>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(
                  [
                    ['background', 'Background'],
                    ['need', 'Community Need'],
                    ['objectives', 'Objectives'],
                    ['planning', 'Planning & Preparation'],
                    ['implementation', 'Implementation'],
                    ['whatWeDid', 'What We Did'],
                    ['outcomes', 'Outcomes & Impact'],
                    ['futurePhases', 'Future Phases'],
                    ['reflection', 'Reflection & Next Steps'],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className={key === 'reflection' ? 'sm:col-span-2' : ''}>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      {label}
                    </label>
                    <textarea
                      rows={2}
                      value={form.storySections?.[key] || ''}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          storySections: { ...prev.storySections, [key]: e.target.value },
                        }))
                      }
                      className="w-full rounded-lg border border-white/12 bg-[#0B0F1A] p-2.5 text-xs text-white"
                    />
                  </div>
                ))}
              </div>
            </details>
          </div>

          {/* Cover & Gallery Upload */}
          <div className="space-y-4 pt-2 border-t border-white/10">
            <h3 className="font-display text-sm font-semibold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#E8AF25]" aria-hidden="true" />
              <span>Cover Photo & Multi-Image / Video Gallery</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={form.coverImage}
                  onChange={(e) => setForm((prev) => ({ ...prev, coverImage: e.target.value }))}
                  placeholder="https://... or upload below"
                  className="w-full min-h-[40px] rounded-xl border border-white/12 bg-[#05070D] px-3 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Cover Alt Text
                </label>
                <input
                  type="text"
                  value={form.coverAlt}
                  onChange={(e) => setForm((prev) => ({ ...prev, coverAlt: e.target.value }))}
                  placeholder="Accessible description of cover photo"
                  className="w-full min-h-[40px] rounded-xl border border-white/12 bg-[#05070D] px-3 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MediaUploader
                kind="image"
                visibility="public"
                module="projects"
                recordId={recordKey}
                multiple
                label="Upload Project Photos (sets cover if empty)"
                onUploaded={({ url, storagePath, fileName }) => {
                  setForm((prev) => {
                    const nextMedia: ProjectMedia = {
                      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                      url,
                      storagePath,
                      type: 'image',
                      caption: '',
                      altText: fileName.replace(/\.[^.]+$/, ''),
                      photoCredit: '',
                      consentConfirmed: false,
                      order: prev.media.length + 1,
                    };
                    return {
                      ...prev,
                      coverImage: prev.coverImage || url,
                      coverAlt: prev.coverAlt || nextMedia.altText,
                      media: [...prev.media, nextMedia],
                    };
                  });
                }}
              />
              <MediaUploader
                kind="video"
                visibility="public"
                module="projects"
                recordId={recordKey}
                label="Upload Project Video (MP4/WebM/MOV <= 100 MB)"
                onUploaded={({ url, storagePath, fileName }) => {
                  setForm((prev) => ({
                    ...prev,
                    media: [
                      ...prev.media,
                      {
                        id: `v-${Date.now()}`,
                        url,
                        storagePath,
                        type: 'video',
                        caption: fileName,
                        altText: fileName,
                        consentConfirmed: true,
                        order: prev.media.length + 1,
                      },
                    ],
                  }));
                }}
              />
            </div>

            {form.media.length > 0 && (
              <div className="space-y-2.5">
                {form.media.map((item, idx) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/10 bg-[#05070D] p-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                  >
                    <div className="sm:col-span-2">
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.altText}
                          className="h-16 w-full object-cover rounded-lg border border-white/10"
                        />
                      ) : (
                        <div className="h-16 w-full flex items-center justify-center rounded-lg border border-white/10 bg-black text-xs text-[#F3D754]">
                          Video
                        </div>
                      )}
                    </div>
                    <div className="sm:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={item.caption}
                        placeholder="Caption"
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            media: prev.media.map((m) =>
                              m.id === item.id ? { ...m, caption: e.target.value } : m,
                            ),
                          }))
                        }
                        className="rounded-lg border border-white/12 bg-[#0B0F1A] px-2.5 py-1.5 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={item.altText}
                        placeholder="Alt text"
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            media: prev.media.map((m) =>
                              m.id === item.id ? { ...m, altText: e.target.value } : m,
                            ),
                          }))
                        }
                        className="rounded-lg border border-white/12 bg-[#0B0F1A] px-2.5 py-1.5 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={item.photoCredit || ''}
                        placeholder="Photo credit (optional)"
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            media: prev.media.map((m) =>
                              m.id === item.id ? { ...m, photoCredit: e.target.value } : m,
                            ),
                          }))
                        }
                        className="rounded-lg border border-white/12 bg-[#0B0F1A] px-2.5 py-1.5 text-xs text-white"
                      />
                      <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-300">
                        <input
                          type="checkbox"
                          checked={Boolean(item.consentConfirmed)}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              media: prev.media.map((m) =>
                                m.id === item.id
                                  ? { ...m, consentConfirmed: e.target.checked }
                                  : m,
                              ),
                            }))
                          }
                        />
                        <span>Consent verified</span>
                      </label>
                    </div>
                    <div className="sm:col-span-3 flex items-center justify-end gap-1">
                      {item.type === 'image' && (
                        <button
                          type="button"
                          title="Set as cover image"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              coverImage: item.url,
                              coverAlt: item.altText || prev.coverAlt,
                            }))
                          }
                          className={`p-1.5 rounded-lg border border-white/10 text-xs ${
                            form.coverImage === item.url
                              ? 'text-[#F3D754] border-[#E8AF25]/50'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label="Move up"
                        onClick={() => moveMedia(idx, -1)}
                        className="p-1.5 text-slate-400 hover:text-white"
                      >
                        <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label="Move down"
                        onClick={() => moveMedia(idx, 1)}
                        className="p-1.5 text-slate-400 hover:text-white"
                      >
                        <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label="Remove media item"
                        onClick={() => void removeMedia(item)}
                        className="p-1.5 text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Video Embeds */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-[#E8AF25]" aria-hidden="true" />
                <span>Add YouTube / Vimeo Embed URL</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={videoInput}
                  onChange={(e) => setVideoInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1 min-h-[40px] rounded-xl border border-white/12 bg-[#05070D] px-3 text-xs text-white"
                />
                <button
                  type="button"
                  disabled={!parsedVideo || parsedVideo.provider === 'invalid'}
                  onClick={() => {
                    if (!videoInput.trim()) return;
                    setForm((prev) => ({
                      ...prev,
                      videoUrls: [...prev.videoUrls, videoInput.trim()],
                    }));
                    setVideoInput('');
                  }}
                  className="rounded-xl border border-white/15 bg-white/[0.06] px-4 text-xs font-semibold text-white disabled:opacity-40"
                >
                  Add
                </button>
              </div>
              {form.videoUrls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.videoUrls.map((url) => (
                    <span
                      key={url}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#05070D] px-2.5 py-1 text-[11px] text-slate-200"
                    >
                      <span className="truncate max-w-[220px]">{url}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            videoUrls: prev.videoUrls.filter((v) => v !== url),
                          }))
                        }
                        className="text-slate-400 hover:text-red-400"
                      >
                        <X className="w-3 h-3" aria-hidden="true" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Public vs Private Documents */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <h3 className="font-display text-sm font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#E8AF25]" aria-hidden="true" />
              <span>Project Documents (Public Report vs. Private Approval/Receipts)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="Document title (e.g. Official Impact Report)"
                className="min-h-[40px] rounded-xl border border-white/12 bg-[#05070D] px-3 text-xs text-white"
              />
              <label className="inline-flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={docPublicApproved}
                  onChange={(e) => setDocPublicApproved(e.target.checked)}
                />
                <span>Publicly approved (unchecked = uploads to Private Storage)</span>
              </label>
            </div>
            <MediaUploader
              kind="document"
              visibility={docPublicApproved ? 'public' : 'private'}
              module="projects"
              recordId={recordKey}
              label={
                docPublicApproved
                  ? 'Upload Publicly Approved PDF Report'
                  : 'Upload Private Approval / Financial PDF (Admin-only)'
              }
              onUploaded={({ url, storagePath, fileName }) => {
                const newDoc: ProjectDocument = {
                  id: `doc-${Date.now()}`,
                  title: docTitle.trim() || fileName,
                  url,
                  storagePath,
                  publicApproved: docPublicApproved,
                };
                setForm((prev) => ({
                  ...prev,
                  documents: [...(prev.documents || []), newDoc],
                }));
                setDocTitle('');
              }}
            />
            {form.documents && form.documents.length > 0 && (
              <ul className="space-y-1.5 text-xs">
                {form.documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-[#05070D] px-3 py-2"
                  >
                    <span className="text-slate-200">
                      {doc.title}{' '}
                      <span className="text-[11px] text-[#F3D754]">
                        ({doc.publicApproved ? 'Public' : 'Private'})
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        if (doc.storagePath) await deleteStorageAsset(doc.storagePath);
                        setForm((prev) => ({
                          ...prev,
                          documents: (prev.documents || []).filter((d) => d.id !== doc.id),
                        }));
                      }}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Metrics, Partners, Organisers, Evidence */}
          <div className="space-y-4 pt-2 border-t border-white/10">
            <h3 className="font-display text-sm font-semibold text-white">
              Impact Metrics, Organisers, Partners & Evidence Notes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={form.beneficiaries || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, beneficiaries: e.target.value }))}
                placeholder="Beneficiaries reached (e.g. 250+)"
                className="min-h-[40px] rounded-xl border border-white/12 bg-[#05070D] px-3 text-xs text-white"
              />
              <input
                type="text"
                value={form.participatingLeos || ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, participatingLeos: e.target.value }))
                }
                placeholder="Participating Leos (e.g. 32)"
                className="min-h-[40px] rounded-xl border border-white/12 bg-[#05070D] px-3 text-xs text-white"
              />
              <input
                type="text"
                value={form.volunteerHours || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, volunteerHours: e.target.value }))}
                placeholder="Volunteer hours (e.g. 160 hrs)"
                className="min-h-[40px] rounded-xl border border-white/12 bg-[#05070D] px-3 text-xs text-white"
              />
            </div>

            {/* Custom metric pairs */}
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={metricValue}
                onChange={(e) => setMetricValue(e.target.value)}
                placeholder="Value (e.g. 120)"
                className="w-32 min-h-[38px] rounded-lg border border-white/12 bg-[#05070D] px-3 text-xs text-white"
              />
              <input
                type="text"
                value={metricLabel}
                onChange={(e) => setMetricLabel(e.target.value)}
                placeholder="Metric label (e.g. Trees Planted)"
                className="flex-1 min-h-[38px] rounded-lg border border-white/12 bg-[#05070D] px-3 text-xs text-white"
              />
              <button
                type="button"
                onClick={() => {
                  if (!metricLabel.trim() || !metricValue.trim()) return;
                  const nextMetric: ProjectMetric = {
                    label: metricLabel.trim(),
                    value: metricValue.trim(),
                  };
                  setForm((prev) => ({ ...prev, metrics: [...prev.metrics, nextMetric] }));
                  setMetricLabel('');
                  setMetricValue('');
                }}
                className="rounded-lg border border-white/15 bg-white/[0.06] px-3 text-xs font-semibold text-white"
              >
                Add Metric
              </button>
            </div>
            {form.metrics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.metrics.map((m, idx) => (
                  <span
                    key={`${m.label}-${idx}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-[#05070D] px-3 py-1 text-xs text-slate-200"
                  >
                    <strong className="text-[#F3D754]">{m.value}</strong> {m.label}
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          metrics: prev.metrics.filter((_, i) => i !== idx),
                        }))
                      }
                      className="text-slate-400 hover:text-red-400"
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Partners & Organisers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={partnerInput}
                    onChange={(e) => setPartnerInput(e.target.value)}
                    placeholder="Add partner / sponsor..."
                    className="flex-1 min-h-[38px] rounded-lg border border-white/12 bg-[#05070D] px-3 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!partnerInput.trim()) return;
                      setForm((prev) => ({
                        ...prev,
                        partners: [...prev.partners, partnerInput.trim()],
                      }));
                      setPartnerInput('');
                    }}
                    className="rounded-lg border border-white/15 bg-white/[0.06] px-3 text-xs text-white"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.partners.map((p, idx) => (
                    <span
                      key={`${p}-${idx}`}
                      className="inline-flex items-center gap-1 rounded bg-[#05070D] border border-white/10 px-2 py-0.5 text-[11px] text-slate-300"
                    >
                      {p}
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            partners: prev.partners.filter((_, i) => i !== idx),
                          }))
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={organiserInput}
                    onChange={(e) => setOrganiserInput(e.target.value)}
                    placeholder="Add organising committee member..."
                    className="flex-1 min-h-[38px] rounded-lg border border-white/12 bg-[#05070D] px-3 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!organiserInput.trim()) return;
                      setForm((prev) => ({
                        ...prev,
                        organisers: [...(prev.organisers || []), organiserInput.trim()],
                      }));
                      setOrganiserInput('');
                    }}
                    className="rounded-lg border border-white/15 bg-white/[0.06] px-3 text-xs text-white"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(form.organisers || []).map((o, idx) => (
                    <span
                      key={`${o}-${idx}`}
                      className="inline-flex items-center gap-1 rounded bg-[#05070D] border border-white/10 px-2 py-0.5 text-[11px] text-slate-300"
                    >
                      {o}
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            organisers: (prev.organisers || []).filter((_, i) => i !== idx),
                          }))
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Internal Verification / Evidence Note
                </label>
                <textarea
                  rows={2}
                  value={form.evidenceNote || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, evidenceNote: e.target.value }))}
                  placeholder="Reference to attendance sheet, MYLCI/District report, or receipts..."
                  className="w-full rounded-xl border border-white/12 bg-[#05070D] p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Reviewer Note (Approving Officer)
                </label>
                <textarea
                  rows={2}
                  disabled={!canPublish}
                  value={form.reviewNote || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, reviewNote: e.target.value }))}
                  placeholder={
                    canPublish
                      ? 'Feedback or approval confirmation...'
                      : 'Editable by President, Secretary, or Super Admin'
                  }
                  className="w-full rounded-xl border border-white/12 bg-[#05070D] p-2.5 text-xs text-white disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Workflow Action Bar */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span>Current Publication Status:</span>
              <span className="font-mono font-semibold text-[#F3D754]">
                {form.publicationStatus}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {canEdit && (
                <>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void handleSave('draft')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white hover:border-white/40 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Save Draft</span>
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void handleSave('submitted')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#E8AF25]/45 bg-[#E8AF25]/10 px-4 py-2 text-xs font-semibold text-[#F3D754] hover:bg-[#E8AF25]/20 disabled:opacity-50"
                  >
                    <span>Submit for Review</span>
                  </button>
                </>
              )}

              {canPublish && (
                <>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void handleSave('rejected')}
                    className="rounded-full border border-red-500/35 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/20 disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void handleSave('archived')}
                    className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-50"
                  >
                    Archive
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void handleSave('published')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#E8AF25] px-5 py-2 text-xs font-semibold text-[#05070D] hover:bg-[#F3D754] disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{saving ? 'Saving...' : 'Approve & Publish'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      {previewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="max-w-3xl w-full max-h-[85vh] overflow-y-auto rounded-2xl border border-white/15 bg-[#0B0F1A] p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-semibold text-[#F3D754]">
                Editorial Preview ({form.publicationStatus})
              </span>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <div className="text-xs text-slate-400">
              {form.category} · {form.leosticYear} · {form.status} · {form.location}
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
              {form.title || 'Untitled Project'}
            </h3>
            <p className="text-sm text-slate-300">{form.summary}</p>
            {form.coverImage && (
              <img
                src={form.coverImage}
                alt={form.coverAlt || form.title}
                className="w-full max-h-72 object-cover rounded-xl border border-white/10"
              />
            )}
            <div className="text-sm text-slate-200 whitespace-pre-line">{form.story}</div>
          </div>
        </div>
      )}
    </div>
  );
}
