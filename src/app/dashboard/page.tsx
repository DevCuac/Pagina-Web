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
  // Temporarily set isStaff to true to make sure you see the analytics while we test
  const isStaff = true; 

  return (
    <div className="page-content bg-[#09090b] min-h-screen pb-20 text-white font-sans">
      <div className="container max-w-6xl mx-auto px-4">
        
        <header className="mb-10 pt-8">
          <h1 className="text-4xl font-black tracking-tight mb-2">
            Control <span className="text-blue-500 italic">Panel</span>
          </h1>
          <p className="text-zinc-500 font-medium">Manage your profile, activity and platform insights.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Profile Card */}
          <div className="lg:col-span-2 space-y-8">
            <div className="relative group rounded-3xl overflow-hidden bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm shadow-2xl transition-all hover:border-blue-500/30">
              <div className="h-48 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] to-transparent z-10" />
                <div 
                  className="h-full w-full transform group-hover:scale-105 transition-transform duration-700"
                  style={{
                    background: finalBanner
                      ? `url(${finalBanner}) center/cover`
                      : `linear-gradient(135deg, ${session.user.roleColor}, #1e1b4b)`,
                  }} 
                />
              </div>

              <div className="absolute top-6 right-6 z-20">
                <ProfileActions userId={session.user.id} />
              </div>

              <div className="px-10 pb-10 flex flex-col md:flex-row gap-8 items-end -mt-16 relative z-20">
                <div className="size-32 rounded-[2rem] border-8 border-[#09090b] bg-zinc-900 flex-shrink-0 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  {(dbUser?.avatar || session.user.avatar || session.user.image) ? (
                    <img src={dbUser?.avatar || session.user.avatar || session.user.image || ''} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-black text-zinc-700 bg-zinc-800">
                      {session.user.username[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-4xl font-black tracking-tighter" style={{ color: session.user.roleColor }}>
                      {session.user.username}
                    </h2>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/10 border border-white/10">
                      {session.user.role || 'Member'}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-lg font-medium">Welcome back to the grid.</p>
                </div>
              </div>

              {dbUser?.bio && (
                <div className="px-10 pb-10">
                  <div className="p-6 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 text-zinc-400 text-sm italic leading-relaxed">
                    "{dbUser.bio}"
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: t('dashboard.edit_profile'), icon: '👤', href: '/dashboard/profile', color: 'blue' },
                { label: 'Notifications', icon: '🔔', href: '/notifications', color: 'amber' },
                { label: 'Support', icon: '🎫', href: '/support', color: 'emerald' },
                { label: 'Forums', icon: '💬', href: '/forums', color: 'indigo' },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="group p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-800/50 transition-all text-center">
                  <div className="text-2xl mb-2 transform group-hover:scale-125 transition-transform">{item.icon}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">{item.label}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar Area: Stats & Analytics */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-4">
              <div className="p-8 rounded-3xl bg-blue-600 shadow-[0_20px_40px_rgba(37,99,235,0.2)] relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 transform group-hover:scale-110 transition-transform">💬</div>
                <div className="text-5xl font-black text-white mb-1">{postCount}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-blue-100">{t('dashboard.posts')}</div>
              </div>
              <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 text-8xl opacity-5 transform group-hover:scale-110 transition-transform">🎫</div>
                <div className="text-5xl font-black text-white mb-1">{ticketCount}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t('dashboard.tickets')}</div>
              </div>
            </div>

            {/* Analytics Section */}
            {isStaff && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 px-2 flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-blue-500" />
                  Analytics
                </h3>
                <AnalyticsDashboard />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
