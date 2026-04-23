import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { getLocaleObj, getTranslation } from '@/lib/i18n';
import ProfileActions from '@/components/profile/ProfileActions';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect('/login');

  const [dbUser, postCount, ticketCount, unreadNotifs] = await Promise.all([
    (prisma.user as any).findUnique({ 
      where: { id: session.user.id }, 
      select: { 
        bio: true, banner: true, avatar: true, 
        instagram: true, twitter: true, discord: true, youtube: true, facebook: true 
      } 
    }),
    prisma.forumPost.count({ where: { authorId: session.user.id } }),
    prisma.ticket.count({ where: { authorId: session.user.id } }),
    prisma.notification.count({ where: { userId: session.user.id, isRead: false } }),
  ]);

  const { dict } = await getLocaleObj();
  const t = (key: string) => getTranslation(dict, key);

  const finalBanner = dbUser?.banner || session.user.banner;
  const isStaff = session.user.isAdmin || session.user.isStaff;

  return (
    <div className="page-content bg-zinc-950 min-h-screen pb-20">
      <div className="container max-w-5xl">
        
        {/* Banner Area */}
        <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl mb-8 relative">
          <div className="h-40 relative">
             <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent z-10" />
             <div 
               className="h-full w-full"
               style={{
                background: finalBanner
                  ? `url(${finalBanner}) center/cover`
                  : `linear-gradient(135deg, ${session.user.roleColor}33, #18181b)`,
               }} 
             />
          </div>

          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <ProfileActions userId={session.user.id} />
          </div>

          <div className="px-8 pb-8 flex flex-col md:flex-row gap-6 items-end -mt-12 relative z-20">
            <div className="size-28 rounded-2xl border-4 bg-zinc-900 flex-shrink-0 overflow-hidden shadow-2xl"
                 style={{ borderColor: session.user.roleColor }}>
              {(dbUser?.avatar || session.user.avatar || session.user.image) ? (
                <img src={dbUser?.avatar || session.user.avatar || session.user.image || ''} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-zinc-500">
                  {session.user.username[0]}
                </div>
              )}
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: session.user.roleColor }}>
                {t('dashboard.greeting').split(',')[0]}, {session.user.username}!
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex gap-2">
                   {dbUser?.instagram && <span title="Instagram" className="text-xl">📸</span>}
                   {dbUser?.twitter && <span title="Twitter" className="text-xl">🐦</span>}
                   {dbUser?.discord && <span title="Discord" className="text-xl">💬</span>}
                </div>
                <p className="text-zinc-400 text-sm font-medium">{t('dashboard.greeting').split(', ')[1] || 'Welcome back'}</p>
              </div>
            </div>
          </div>
          {dbUser?.bio && (
            <div className="px-8 pb-8 text-zinc-300 text-sm max-w-2xl leading-relaxed">
              {dbUser.bio}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center hover:bg-zinc-900 transition-colors">
            <div className="text-3xl font-black text-white">{postCount}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">{t('dashboard.posts')}</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center hover:bg-zinc-900 transition-colors">
            <div className="text-3xl font-black text-white">{ticketCount}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">{t('dashboard.tickets')}</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center hover:bg-zinc-900 transition-colors">
            <div className="text-3xl font-black" style={{ color: unreadNotifs > 0 ? '#f59e0b' : 'white' }}>{unreadNotifs}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">{t('dashboard.notifications')}</div>
          </div>
        </div>

        {/* Analytics Section for Staff */}
        {isStaff && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
              Platform Insights
            </h2>
            <AnalyticsDashboard />
          </div>
        )}

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/dashboard/profile" className="group bg-zinc-900/40 border border-zinc-800 p-6 rounded-xl hover:bg-blue-600/10 hover:border-blue-500/50 transition-all">
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
               <span className="text-blue-500 group-hover:scale-110 transition-transform text-lg">👤</span>
               {t('dashboard.edit_profile')}
            </h3>
            <p className="text-zinc-400 text-sm">{t('dashboard.edit_profile_desc')}</p>
          </Link>
          <Link href="/notifications" className="group bg-zinc-900/40 border border-zinc-800 p-6 rounded-xl hover:bg-amber-600/10 hover:border-amber-500/50 transition-all">
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
               <span className="text-amber-500 group-hover:scale-110 transition-transform text-lg">🔔</span>
               {t('dashboard.notifications')}
            </h3>
            <p className="text-zinc-400 text-sm">Review your latest activity and alerts.</p>
          </Link>
          <Link href="/support" className="group bg-zinc-900/40 border border-zinc-800 p-6 rounded-xl hover:bg-emerald-600/10 hover:border-emerald-500/50 transition-all">
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
               <span className="text-emerald-500 group-hover:scale-110 transition-transform text-lg">🎫</span>
               {t('dashboard.my_tickets')}
            </h3>
            <p className="text-zinc-400 text-sm">{t('dashboard.my_tickets_desc')}</p>
          </Link>
          <Link href="/forums" className="group bg-zinc-900/40 border border-zinc-800 p-6 rounded-xl hover:bg-indigo-600/10 hover:border-indigo-500/50 transition-all">
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
               <span className="text-indigo-500 group-hover:scale-110 transition-transform text-lg">💬</span>
               {t('dashboard.forums')}
            </h3>
            <p className="text-zinc-400 text-sm">{t('dashboard.forums_desc')}</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
