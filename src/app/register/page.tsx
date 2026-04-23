import { RegisterForm } from "@/components/register-form"
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-zinc-950 p-6 md:p-10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600 blur-[120px]" />
      </div>

      <div className="flex w-full max-w-md flex-col gap-6 relative z-10">
        <Link href="/" className="flex items-center gap-2 self-center font-bold text-white group">
          <div className="flex size-8 items-center justify-center rounded-md bg-blue-600 text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <span className="text-sm font-black italic">CP</span>
          </div>
          Cross-Pixel
        </Link>
        <RegisterForm />
      </div>
    </div>
  )
}
