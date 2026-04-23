import { RegisterForm } from "@/components/register-form"
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-950 p-6 md:p-10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600 blur-[120px]" />
      </div>

      <div className="flex w-full max-w-md flex-col gap-8 relative z-10">
        <Link href="/" className="flex flex-col items-center gap-2 group">
          <div className="flex size-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
            <span className="text-2xl font-bold">CP</span>
          </div>
          <div className="flex flex-col items-center">
             <span className="text-xl font-bold tracking-tighter text-white">CROSS<span className="text-blue-500">PIXEL</span></span>
             <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">Gaming Community</span>
          </div>
        </Link>
        <RegisterForm />
      </div>
    </div>
  )
}
