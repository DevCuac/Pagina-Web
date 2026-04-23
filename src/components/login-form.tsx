'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useTranslation } from '@/components/I18nProvider'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FieldGroup } from "@/components/ui/field"
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl md:text-4xl font-display font-black tracking-tighter text-white uppercase leading-tight drop-shadow-2xl">
          {t('auth.login_title_premium') || '¡BIENVENIDO DE NUEVO A CROSSPIXEL!'}
        </h1>
        <p className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-[0.3em]">
          {t('auth.login_desc_premium') || 'INICIA SESIÓN PARA CONTINUAR'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <FieldGroup>
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
              {t('auth.email_label') || 'CORREO ELECTRÓNICO'}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="example@mail.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-950 border-zinc-800/50 h-14 px-4 rounded-2xl focus:ring-electric/20 focus:border-electric transition-all text-sm flex items-center"
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between px-1">
              <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                {t('auth.password_label') || 'CONTRASEÑA'}
              </Label>
              <Link
                href="/forgot-password"
                className="text-[10px] font-black uppercase tracking-widest text-electric hover:underline"
              >
                {t('auth.forgot_password') || '¡HE OLVIDADO MI CONTRASEÑA!'}
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-950 border-zinc-800/50 h-14 px-4 pr-12 rounded-2xl focus:ring-electric/20 focus:border-electric transition-all text-sm flex items-center"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-shake">
              {error === 'CredentialsSignin' ? (t('auth.err_credentials') || 'CREDENCIALES INVÁLIDAS') : (t('auth.err_generic') || 'HA OCURRIDO UN ERROR')}
            </p>
          )}

          <Button 
            type="submit" 
            className="w-full h-14 rounded-2xl bg-electric hover:bg-electric/90 text-white font-black uppercase tracking-widest btn-glow transition-all disabled:opacity-50 mt-2 shadow-xl shadow-electric/20"
            disabled={loading}
          >
            {loading ? (t('auth.loading') || 'INICIANDO...') : (t('auth.login_btn') || 'INICIAR SESIÓN')}
          </Button>
        </FieldGroup>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-800/30" />
          </div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
            <span className="bg-zinc-950 px-4 text-zinc-600">
              {t('auth.or_continue_with') || 'O CONTINÚA CON'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* ... Buttons ... */}
        </div>

        <div className="text-center text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest mt-2">
          {t('auth.no_account') || '¿NO TIENES CUENTA?'} {" "}
          <Link href="/register" className="text-electric hover:underline font-black">
            {t('auth.register_free') || 'REGÍSTRATE GRATIS'}
          </Link>
        </div>
      </form>
    </div>
  )
}
