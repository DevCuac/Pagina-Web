'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from '@/components/I18nProvider';

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { t } = useTranslation();
  const router = useRouter();
  
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    minecraftName: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Algo salió mal');
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
        router.refresh();
      }
    } catch {
      setError('Error del servidor. Intenta de nuevo.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-none shadow-2xl bg-zinc-950/50 backdrop-blur-xl border border-zinc-800/50 text-center p-8 max-w-sm mx-auto animate-in fade-in zoom-in duration-500">
        <div className="text-6xl mb-6">✉️</div>
        <CardTitle className="text-2xl font-black text-blue-500 mb-3 tracking-tighter">{t('auth.check_mail_title')}</CardTitle>
        <CardDescription className="text-zinc-400 mb-8 leading-relaxed">
          {t('auth.check_mail_desc')} <strong className="text-white">{form.email}</strong>.
          <br /><br />
          <span className="text-xs uppercase tracking-widest font-bold opacity-60">{t('auth.check_mail_hint')}</span>
        </CardDescription>
        <Link href="/login" className="w-full block">
          <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest h-12 shadow-lg shadow-blue-600/20">
            {t('auth.go_login')}
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-none shadow-2xl bg-zinc-950/50 backdrop-blur-xl border border-zinc-800/50">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-black tracking-tighter text-white">
            {t('auth.register_title')}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {t('auth.register_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="username" className="text-zinc-300 font-semibold ml-1">{t('auth.username')}</Label>
              <Input
                id="username"
                name="username"
                placeholder="Steve"
                required
                value={form.username}
                onChange={handleChange}
                className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 h-11"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-zinc-300 font-semibold ml-1">{t('auth.email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                value={form.email}
                onChange={handleChange}
                className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 h-11"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="minecraftName" className="text-zinc-300 font-semibold ml-1">{t('auth.minecraft_name')}</Label>
              <Input
                id="minecraftName"
                name="minecraftName"
                placeholder="Minecraft_User"
                value={form.minecraftName}
                onChange={handleChange}
                className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 h-11"
              />
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider ml-1 opacity-60">
                {t('auth.minecraft_hint')}
              </span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" title="Password" className="text-zinc-300 font-semibold ml-1">{t('auth.password')}</Label>
              <Input 
                id="password" 
                name="password"
                type="password" 
                required 
                value={form.password}
                onChange={handleChange}
                className="bg-zinc-900/50 border-zinc-800 text-white h-11"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-tight h-12 mt-2 shadow-lg shadow-blue-600/20" disabled={loading}>
              {loading ? t('auth.register_loading') : t('auth.register_btn')}
            </Button>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-medium animate-in fade-in zoom-in">
                {error}
              </div>
            )}

            <div className="text-center text-sm text-zinc-400 mt-2 font-medium">
              {t('auth.already_account')}{" "}
              <Link href="/login" className="text-blue-500 hover:text-blue-400 transition-colors font-bold">
                {t('auth.login_btn')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="px-8 text-center text-[10px] text-zinc-500 leading-relaxed uppercase tracking-widest font-medium opacity-50">
        By clicking continue, you agree to our <Link href="#" className="underline hover:text-zinc-300">Terms of Service</Link>{" "}
        and <Link href="#" className="underline hover:text-zinc-300">Privacy Policy</Link>.
      </div>
    </div>
  )
}
