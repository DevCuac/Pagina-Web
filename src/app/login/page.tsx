import { LoginForm } from "@/components/login-form"
import Link from "next/link"
import prisma from "@/lib/db"
import { getLocaleObj, getTranslation } from "@/lib/i18n"

export default async function LoginPage() {
  const { dict } = await getLocaleObj();
  
  const bgSetting = await (prisma.siteSetting as any).findUnique({
    where: { key: 'auth_background_url' }
  });
  
  const bgUrl = bgSetting?.value || "/login_bg_cross_pixel_1776919751758.png";

  const title = getTranslation(dict, 'auth.ultimate_network_title');
  const desc = getTranslation(dict, 'auth.ultimate_network_desc');
  const cta = getTranslation(dict, 'auth.ultimate_network_cta');

  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-[#050505] font-sans selection:bg-electric/30">
      <div className="flex flex-col gap-4 p-6 md:p-10 relative z-10">
        <div className="flex justify-between items-center w-full">
          <Link href="/" className="flex items-center gap-2 font-black text-white group tracking-tighter">
            <div className="flex size-9 items-center justify-center rounded-xl bg-electric text-white shadow-xl shadow-electric/20 group-hover:scale-110 transition-all duration-500">
              <span className="text-sm font-black italic">CP</span>
            </div>
            <span className="text-xl uppercase">Cross-Pixel</span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[340px] animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <LoginForm />
          </div>
        </div>
      </div>

      <div className="relative hidden bg-zinc-950 lg:block border-l border-white/5">
        <img
          src={bgUrl}
          alt="Cross-Pixel Login Background"
          className="absolute inset-0 h-full w-full object-cover opacity-40 grayscale hover:grayscale-0 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent" />
        <div className="absolute bottom-20 left-12 right-12 z-20">
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
            <h2 
              className="text-4xl font-display font-black text-white uppercase tracking-tighter leading-none"
              dangerouslySetInnerHTML={{ __html: title }}
            />
            <div className="flex flex-col gap-3">
              <p className="text-sm text-zinc-300 font-medium leading-relaxed max-w-sm">
                {desc}
              </p>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                {cta}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
