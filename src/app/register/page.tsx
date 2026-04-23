import { RegisterForm } from "@/components/register-form"
import Link from "next/link"
import prisma from "@/lib/db"

export default async function RegisterPage() {
  const bgSetting = await (prisma.siteSetting as any).findUnique({
    where: { key: 'auth_background_url' }
  });
  
  const bgUrl = bgSetting?.value || "/login_bg_cross_pixel_1776919751758.png";

  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-zinc-950 font-sans">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-bold text-white group">
            <div className="flex size-8 items-center justify-center rounded-md bg-blue-600 text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <span className="text-sm font-black italic">CP</span>
            </div>
            Cross-Pixel
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <RegisterForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block border-l border-zinc-800/50">
        <img
          src={bgUrl}
          alt="Cross-Pixel Register Background"
          className="absolute inset-0 h-full w-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 to-transparent" />
      </div>
    </div>
  )
}
