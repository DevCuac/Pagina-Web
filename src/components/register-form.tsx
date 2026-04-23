'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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
      <div className="text-center p-6 animate-in fade-in zoom-in duration-500">
        <div className="text-6xl mb-6">✉️</div>
        <h2 className="text-2xl font-black text-blue-500 mb-3 tracking-tighter">{t('auth.check_mail_title')}</h2>
        <p className="text-zinc-400 mb-8 leading-relaxed text-sm">
          {t('auth.check_mail_desc')} <strong className="text-white">{form.email}</strong>.
          <br /><br />
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">{t('auth.check_mail_hint')}</span>
        </p>
        <Link href="/login" className="w-full block">
          <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest h-12 shadow-lg shadow-blue-600/20">
            {t('auth.go_login')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center mb-4">
            <h1 className="text-3xl font-display font-black tracking-tighter text-white uppercase">{t('auth.register_title')}</h1>
            <p className="text-sm text-balance text-zinc-500 font-medium uppercase tracking-widest">
              {t('auth.register_desc')}
            </p>
          </div>
          
          <Field>
            <FieldLabel htmlFor="username" className="font-bold uppercase text-[10px] tracking-widest ml-1">{t('auth.username')}</FieldLabel>
            <Input
              id="username"
              name="username"
              placeholder="Steve"
              required
              value={form.username}
              onChange={handleChange}
              className="bg-zinc-900 border-zinc-800 text-white h-11"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="email" className="font-bold uppercase text-[10px] tracking-widest ml-1">{t('auth.email')}</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
              value={form.email}
              onChange={handleChange}
              className="bg-zinc-900 border-zinc-800 text-white h-11"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="minecraftName" className="font-bold uppercase text-[10px] tracking-widest ml-1">{t('auth.minecraft_name')}</FieldLabel>
            <Input
              id="minecraftName"
              name="minecraftName"
              placeholder="Minecraft_User"
              value={form.minecraftName}
              onChange={handleChange}
              className="bg-zinc-900 border-zinc-800 text-white h-11"
            />
            <FieldDescription className="font-bold text-[9px] uppercase tracking-wider ml-1 opacity-60">
              {t('auth.minecraft_hint')}
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="password" title="Password" className="font-bold uppercase text-[10px] tracking-widest ml-1">{t('auth.password')}</FieldLabel>
            <Input 
              id="password" 
              name="password"
              type="password" 
              required 
              value={form.password}
              onChange={handleChange}
              className="bg-zinc-900 border-zinc-800 text-white h-11"
            />
          </Field>

          <Field>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-tight h-12 mt-2 shadow-lg shadow-blue-600/20" disabled={loading}>
              {loading ? t('auth.register_loading') : t('auth.register_btn')}
            </Button>
          </Field>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-bold animate-in fade-in zoom-in">
              {error}
            </div>
          )}

          <FieldDescription className="text-center mt-2 font-bold">
            {t('auth.already_account')}{" "}
            <Link href="/login" className="text-blue-500 hover:underline underline-offset-4">
              {t('auth.login_btn')}
            </Link>
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  )
}
