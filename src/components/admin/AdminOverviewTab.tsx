import {
  Award,
  BookOpen,
  Calendar,
  Camera,
  FolderKanban,
  Inbox,
  Mail,
  Newspaper,
  Users,
} from 'lucide-react';
import type {
  Achievement,
  ClubEvent,
  ContactMessage,
  GalleryAlbum,
  MembershipEnquiry,
  NewsArticle,
  Officer,
  Project,
  Publication,
  SiteSettings,
  UserProfile,
} from '../../types/club';

interface AdminOverviewTabProps {
  userProfile: UserProfile;
  settings: SiteSettings;
  projects: Project[];
  events: ClubEvent[];
  officers: Officer[];
  galleries: GalleryAlbum[];
  publications: Publication[];
  news: NewsArticle[];
  achievements: Achievement[];
  enquiries: MembershipEnquiry[];
  messages: ContactMessage[];
  onNavigateTab: (tab: string) => void;
}

export function AdminOverviewTab({
  userProfile,
  settings,
  projects,
  events,
  officers,
  galleries,
  publications,
  news,
  achievements,
  enquiries,
  messages,
  onNavigateTab,
}: AdminOverviewTabProps) {
  const publishedProjects = projects.filter((p) => p.publicationStatus === 'published').length;
  const pendingReview = projects.filter((p) =>
    ['submitted', 'underReview'].includes(p.publicationStatus),
  );
  const newEnquiries = enquiries.filter((e) => e.status === 'new').length;
  const newMessages = messages.filter((m) => m.status === 'new').length;

  const cards = [
    {
      label: 'Projects (Published / Total)',
      value: `${publishedProjects} / ${projects.length}`,
      icon: FolderKanban,
      tab: 'projects',
    },
    {
      label: 'Pending Project Reviews',
      value: String(pendingReview.length),
      icon: FolderKanban,
      tab: 'projects',
    },
    {
      label: 'Events',
      value: String(events.length),
      icon: Calendar,
      tab: 'events',
    },
    {
      label: 'Executive Board Officers',
      value: String(officers.length),
      icon: Users,
      tab: 'team',
    },
    {
      label: 'Gallery Albums',
      value: String(galleries.length),
      icon: Camera,
      tab: 'gallery',
    },
    {
      label: 'News & Updates',
      value: String(news.length),
      icon: Newspaper,
      tab: 'news',
    },
    {
      label: 'Publications & Magazines',
      value: String(publications.length),
      icon: BookOpen,
      tab: 'publications',
    },
    {
      label: 'Verified Awards',
      value: String(achievements.length),
      icon: Award,
      tab: 'awards',
    },
    {
      label: 'New Join Enquiries',
      value: String(newEnquiries),
      icon: Inbox,
      tab: 'enquiries',
    },
    {
      label: 'New Contact Messages',
      value: String(newMessages),
      icon: Mail,
      tab: 'messages',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#F3D754]">
            Active Leostic Year {settings.currentLeosticYear}
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-white">
            Welcome, {userProfile.displayName || userProfile.email}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Assigned role: <span className="font-mono text-[#F3D754]">{userProfile.role}</span> ·{' '}
            Changes publish immediately to live Firestore listeners when approved.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab('projects')}
          className="rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-[#05070D] hover:bg-[#F3D754] transition-colors whitespace-nowrap shrink-0"
        >
          Manage Projects →
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              type="button"
              onClick={() => onNavigateTab(card.tab)}
              className="text-left rounded-2xl border border-white/10 bg-[#0B0F1A] p-5 hover:border-[#E8AF25]/50 transition-colors"
            >
              <div className="flex items-center justify-between text-slate-400">
                <Icon className="w-4 h-4 text-[#E8AF25]" aria-hidden="true" />
              </div>
              <div className="mt-3 font-display text-2xl font-bold text-white tabular-nums">
                {card.value}
              </div>
              <div className="mt-1 text-xs text-slate-400">{card.label}</div>
            </button>
          );
        })}
      </div>

      {pendingReview.length > 0 && (
        <div className="rounded-2xl border border-[#E8AF25]/30 bg-[#0B0F1A] p-6 space-y-4">
          <h3 className="font-display text-lg font-bold text-white">
            Projects Awaiting Review / Approval
          </h3>
          <div className="divide-y divide-white/10">
            {pendingReview.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">{p.title}</div>
                  <div className="text-xs text-slate-400">
                    {p.category} · {p.leosticYear} · Status: {p.publicationStatus}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab('projects')}
                  className="text-xs font-semibold text-[#F3D754] hover:underline"
                >
                  Open in Editor →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
