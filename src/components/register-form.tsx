'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
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
  const router = useRouter();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    minecraftName: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          minecraftName: form.minecraftName || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al crear la cuenta');
        setLoading(false);
        return;
      }

      if (data.verificationRequired) {
        setSuccess(true);
        setLoading(false);
        return;
      }

      const loginResult = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (loginResult?.ok) {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Error del servidor. Intenta de nuevo.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-none shadow-2xl bg-zinc-950/50 backdrop-blur-xl text-center p-6">
        <div className="text-5xl mb-4">✉️</div>
        <CardTitle className="text-2xl font-bold text-blue-500 mb-2">{t('auth.check_mail_title')}</CardTitle>
        <CardDescription className="text-zinc-400 mb-6">
          {t('auth.check_mail_desc')} <strong className="text-white">{form.email}</strong>.
          <br />
          {t('auth.check_mail_hint')}
        </CardDescription>
        <Link href="/login" className="w-full block">
          <Button className="w-full bg-zinc-900 border-zinc-800 hover:bg-zinc-800">
            {t('auth.go_login')}
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-none shadow-2xl bg-zinc-950/50 backdrop-blur-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            {t('auth.register_title')}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {t('auth.register_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username" className="text-zinc-300">{t('auth.username')}</Label>
              <Input
                id="username"
                name="username"
                placeholder="TuNombre"
                required
                value={form.username}
                onChange={handleChange}
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-zinc-300">{t('auth.email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="user@mail.com"
                required
                value={form.email}
                onChange={handleChange}
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password" title="Password" className="text-zinc-300">{t('auth.password')}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" title="Confirm" className="text-zinc-300">{t('auth.confirm_password')}</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="minecraftName" className="text-zinc-300">{t('auth.minecraft_name')}</Label>
              <Input
                id="minecraftName"
                name="minecraftName"
                placeholder="Steve"
                value={form.minecraftName}
                onChange={handleChange}
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500"
              />
              <p className="text-[10px] text-zinc-500">{t('auth.minecraft_hint')}</p>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold" disabled={loading}>
              {loading ? t('auth.register_loading') : t('auth.register_btn')}
            </Button>
          </form>

          {error && (
            <div className="mt-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center">
              {error}
            </div>
          )}

          <div className="mt-4 text-center text-sm text-zinc-400">
            {t('auth.has_account')}{" "}
            <a href="/login" className="text-blue-500 hover:underline underline-offset-4">
              {t('auth.login_btn')}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
