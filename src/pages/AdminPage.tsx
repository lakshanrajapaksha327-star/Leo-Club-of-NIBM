import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Calendar,
  CalendarRange,
  Camera,
  ClipboardList,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Newspaper,
  Settings,
  Shield,
  UserCog,
  Users,
} from 'lucide-react';
import { useClubData } from '../context/ClubContext';
import { canRolePerform } from '../utils/clubLogic';
import { subscribeAdminAllCollections } from '../services/contentService';
import { subscribeAdminInvites, subscribeAdminUsers } from '../services/authService';
import { formatFriendlyFirebaseError } from '../lib/firebase';
import type {
  Achievement,
  AdminInvite,
  AuditLog,
  ClubEvent,
  ContactMessage,
  GalleryAlbum,
  MembershipEnquiry,
  NewsArticle,
  Officer,
  Project,
  Publication,
  UserProfile,
} from '../types/club';
import { PageShell } from '../components/Reveal';
import { AdminOverviewTab } from '../components/admin/AdminOverviewTab';
import { AdminProjectsTab } from '../components/admin/AdminProjectsTab';
import {
  AdminAwardsTab,
  AdminEventsTab,
  AdminGalleryTab,
  AdminNewsTab,
  AdminPublicationsTab,
  AdminTeamTab,
} from '../components/admin/AdminContentManagers';
import {
  AdminAuditLogTab,
  AdminEnquiriesTab,
  AdminMessagesTab,
  AdminSettingsTab,
  AdminUsersTab,
  AdminYearsTab,
} from '../components/admin/AdminInquiriesAndOps';

type AdminTabId =
  | 'overview'
  | 'projects'
  | 'events'
  | 'team'
  | 'gallery'
  | 'news'
  | 'publications'
  | 'awards'
  | 'enquiries'
  | 'messages'
  | 'years'
  | 'settings'
  | 'users'
  | 'audit';

const ADMIN_TABS: { id: AdminTabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'team', label: 'Executive Board', icon: Users },
  { id: 'gallery', label: 'Gallery', icon: Camera },
  { id: 'news', label: 'News & Updates', icon: Newspaper },
  { id: 'publications', label: 'Magazines', icon: BookOpen },
  { id: 'awards', label: 'Awards', icon: Award },
  { id: 'enquiries', label: 'Join Enquiries', icon: Inbox },
  { id: 'messages', label: 'Contact Messages', icon: Mail },
  { id: 'years', label: 'Club Years', icon: CalendarRange },
  { id: 'settings', label: 'Settings & Causes', icon: Settings },
  { id: 'users', label: 'Users & Roles', icon: UserCog },
  { id: 'audit', label: 'Audit Log', icon: ClipboardList },
];

export function AdminPage() {
  const {
    authReady,
    authLoading,
    userProfile,
    settings,
    clubYears,
    serviceCategories,
    awardCategories,
    signOutUser,
  } = useClubData();

  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');
  const [adminError, setAdminError] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [galleries, setGalleries] = useState<GalleryAlbum[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [enquiries, setEnquiries] = useState<MembershipEnquiry[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [adminUsers, setAdminUsers] = useState<UserProfile[]>([]);
  const [adminInvites, setAdminInvites] = useState<AdminInvite[]>([]);

  const isAuthorised = Boolean(
    userProfile?.active && canRolePerform(userProfile.role, 'viewAdmin'),
  );

  useEffect(() => {
    if (!authReady || !isAuthorised || !userProfile) return;

    const unsubMain = subscribeAdminAllCollections({
      canReadPrivateInquiries: canRolePerform(userProfile.role, 'viewPrivateInquiries'),
      onProjects: setProjects,
      onEvents: setEvents,
      onOfficers: setOfficers,
      onGalleries: setGalleries,
      onPublications: setPublications,
      onNews: setNews,
      onAchievements: setAchievements,
      onEnquiries: setEnquiries,
      onMessages: setMessages,
      onAuditLogs: setAuditLogs,
      onError: (msg) => setAdminError(formatFriendlyFirebaseError(msg)),
    });

    let unsubUsers = () => {};
    let unsubInvites = () => {};
    if (canRolePerform(userProfile.role, 'manageUsers')) {
      unsubUsers = subscribeAdminUsers(setAdminUsers, setAdminError);
      unsubInvites = subscribeAdminInvites(setAdminInvites, setAdminError);
    }

    return () => {
      unsubMain();
      unsubUsers();
      unsubInvites();
    };
  }, [authReady, isAuthorised, userProfile]);

  if (!authReady || authLoading) {
    return (
      <PageShell className="py-24 px-4 max-w-5xl mx-auto">
        <div className="h-64 rounded-2xl border border-white/10 bg-[#0B0F1A] animate-pulse" />
      </PageShell>
    );
  }

  if (!isAuthorised || !userProfile) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <PageShell>
      {/* Top Admin Header */}
      <section className="border-b border-white/10 bg-[#05070D] bg-d7-atmosphere py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#F3D754]">
              <Shield className="w-4 h-4" aria-hidden="true" />
              <span>Authenticated CMS · Role: {userProfile.role}</span>
            </div>
            <h1 className="mt-1.5 font-display text-2xl sm:text-4xl font-bold text-white">
              Leo Club of NIBM Admin Portal
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Signed in as {userProfile.email} · Active Year {settings.currentLeosticYear}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void signOutUser()}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2 text-xs font-semibold text-white hover:border-[#F3D754] hover:text-[#F3D754] transition-colors self-start sm:self-auto"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </div>
      </section>

      {/* 14-Module CMS Tabs & Active Module */}
      <section className="py-10 md:py-14 bg-[#080B13] bg-grid-architectural min-h-[65vh]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {adminError && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-xs text-red-200"
            >
              {adminError}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {ADMIN_TABS.map((tab) => {
              const Icon = tab.icon;
              if (tab.id === 'users' && !canRolePerform(userProfile.role, 'manageUsers')) {
                return null;
              }
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
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

          {activeTab === 'overview' && (
            <AdminOverviewTab
              userProfile={userProfile}
              settings={settings}
              projects={projects}
              events={events}
              officers={officers}
              galleries={galleries}
              publications={publications}
              news={news}
              achievements={achievements}
              enquiries={enquiries}
              messages={messages}
              onNavigateTab={(tab) => setActiveTab(tab as AdminTabId)}
            />
          )}

          {activeTab === 'projects' && (
            <AdminProjectsTab
              userProfile={userProfile}
              settings={settings}
              projects={projects}
              serviceCategories={serviceCategories}
            />
          )}

          {activeTab === 'events' && (
            <AdminEventsTab userProfile={userProfile} settings={settings} events={events} />
          )}

          {activeTab === 'team' && (
            <AdminTeamTab userProfile={userProfile} settings={settings} officers={officers} />
          )}

          {activeTab === 'gallery' && (
            <AdminGalleryTab
              userProfile={userProfile}
              settings={settings}
              galleries={galleries}
            />
          )}

          {activeTab === 'news' && (
            <AdminNewsTab userProfile={userProfile} settings={settings} news={news} />
          )}

          {activeTab === 'publications' && (
            <AdminPublicationsTab
              userProfile={userProfile}
              settings={settings}
              publications={publications}
            />
          )}

          {activeTab === 'awards' && (
            <AdminAwardsTab
              userProfile={userProfile}
              settings={settings}
              achievements={achievements}
              awardCategories={awardCategories}
            />
          )}

          {activeTab === 'enquiries' && (
            <AdminEnquiriesTab userProfile={userProfile} enquiries={enquiries} />
          )}

          {activeTab === 'messages' && (
            <AdminMessagesTab userProfile={userProfile} messages={messages} />
          )}

          {activeTab === 'years' && (
            <AdminYearsTab userProfile={userProfile} clubYears={clubYears} />
          )}

          {activeTab === 'settings' && (
            <AdminSettingsTab
              userProfile={userProfile}
              settings={settings}
              serviceCategories={serviceCategories}
              awardCategories={awardCategories}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsersTab
              userProfile={userProfile}
              users={adminUsers}
              invites={adminInvites}
            />
          )}

          {activeTab === 'audit' && (
            <AdminAuditLogTab userProfile={userProfile} logs={auditLogs} />
          )}
        </div>
      </section>
    </PageShell>
  );
}
