'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/components/I18nProvider'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FieldGroup } from "@/components/ui/field"
import Link from 'next/link'

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { t } = useTranslation()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [minecraftName, setMinecraftName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, minecraftName }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al registrarse')
      } else {
        router.push('/login?registered=true')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl md:text-3xl font-display font-black tracking-tighter text-white uppercase leading-tight">
          {t('auth.register_title_premium') || 'CREA TU CUENTA DE CROSSPIXEL'}
        </h1>
        <p className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-[0.2em]">
          {t('auth.register_desc_premium') || 'ÚNETE A NUESTRA COMUNIDAD'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <FieldGroup>
          <div className="grid gap-2">
            <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
              {t('auth.username_label') || 'NOMBRE DE USUARIO'}
            </Label>
            <Input
              id="username"
              placeholder="Steve"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-zinc-950 border-zinc-800/50 h-12 rounded-xl focus:ring-electric/20 focus:border-electric transition-all"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
              {t('auth.email_label') || 'CORREO ELECTRÓNICO'}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="m@ejemplo.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-950 border-zinc-800/50 h-12 rounded-xl focus:ring-electric/20 focus:border-electric transition-all"
            />
          </div>

          <div className="grid gap-2">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="minecraft" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                {t('auth.minecraft_label') || 'NOMBRE DE MINECRAFT (OPCIONAL)'}
              </Label>
              <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest ml-1 mb-1">
                {t('auth.minecraft_hint') || 'TU NOMBRE DE USUARIO EN MINECRAFT JAVA EDITION'}
              </span>
            </div>
            <Input
              id="minecraft"
              placeholder="Minecraft_User"
              value={minecraftName}
              onChange={(e) => setMinecraftName(e.target.value)}
              className="bg-zinc-950 border-zinc-800/50 h-12 rounded-xl focus:ring-electric/20 focus:border-electric transition-all"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
              {t('auth.password_label') || 'CONTRASEÑA'}
            </Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-zinc-950 border-zinc-800/50 h-12 rounded-xl focus:ring-electric/20 focus:border-electric transition-all"
            />
          </div>

          {error && (
            <p className="text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-lg animate-shake">
              {error}
            </p>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl bg-electric hover:bg-electric/90 text-white font-black uppercase tracking-widest btn-glow transition-all disabled:opacity-50 mt-2"
            disabled={loading}
          >
            {loading ? t('auth.loading') : (t('auth.register_btn') || 'CREAR CUENTA')}
          </Button>
        </FieldGroup>

        <div className="text-center text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest">
          {t('auth.already_account') || '¿Ya tienes cuenta?'} {" "}
          <Link href="/login" className="text-electric hover:underline">
            {t('auth.login_now') || 'Inicia sesión'}
          </Link>
        </div>
      </form>
    </div>
  )
}
