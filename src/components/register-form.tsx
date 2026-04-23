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
      <Card className="border-none shadow-2xl bg-zinc-950/50 backdrop-blur-xl text-center p-6 max-w-sm mx-auto">
        <div className="text-5xl mb-4">✉️</div>
        <CardTitle className="text-2xl font-bold text-blue-500 mb-2">{t('auth.check_mail_title')}</CardTitle>
        <CardDescription className="text-zinc-400 mb-6">
          {t('auth.check_mail_desc')} <strong className="text-white">{form.email}</strong>.
          <br />
          {t('auth.check_mail_hint')}
        </CardDescription>
        <Link href="/login" className="w-full block">
          <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold">
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
          <CardTitle className="text-xl font-bold text-white">{t('auth.register_title')}</CardTitle>
          <CardDescription className="text-zinc-400">
            {t('auth.register_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">{t('auth.username')}</FieldLabel>
                <Input
                  id="username"
                  name="username"
                  placeholder="Steve"
                  required
                  value={form.username}
                  onChange={handleChange}
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">{t('auth.email')}</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="minecraftName">{t('auth.minecraft_name')}</FieldLabel>
                <Input
                  id="minecraftName"
                  name="minecraftName"
                  placeholder="Minecraft_User"
                  value={form.minecraftName}
                  onChange={handleChange}
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
                <FieldDescription>{t('auth.minecraft_hint')}</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="password">{t('auth.password')}</FieldLabel>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  required 
                  value={form.password}
                  onChange={handleChange}
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </Field>
              <Field>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold" disabled={loading}>
                  {loading ? t('auth.register_loading') : t('auth.register_btn')}
                </Button>
                {error && (
                  <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center mt-2">
                    {error}
                  </div>
                )}
                <FieldDescription className="text-center mt-2">
                  {t('auth.already_account')}{" "}
                  <Link href="/login" className="text-blue-500 hover:underline underline-offset-4">
                    {t('auth.login_btn')}
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <Link href="#" className="underline text-zinc-400">Terms of Service</Link>{" "}
        and <Link href="#" className="underline text-zinc-400">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  )
}
