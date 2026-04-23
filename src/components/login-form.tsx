'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
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
import { loginWithDiscord, loginWithGoogle } from '@/app/login/oauth-actions';
import { useTranslation } from '@/components/I18nProvider';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      window.location.href = callbackUrl;
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-none shadow-2xl bg-zinc-950/50 backdrop-blur-xl border border-zinc-800/50">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-black tracking-tighter text-white">
            {t('auth.login_title')}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {t('auth.login_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                type="button" 
                className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white gap-2 h-11"
                onClick={() => loginWithDiscord(callbackUrl)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                </svg>
                Discord
              </Button>
              <Button 
                variant="outline" 
                type="button" 
                className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white gap-2 h-11"
                onClick={() => loginWithGoogle(callbackUrl)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#09090b]/80 backdrop-blur-sm px-4 text-zinc-500 font-bold tracking-widest">
                  {t('auth.or_continue_with')}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-zinc-300 font-semibold ml-1">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500 h-11"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" title="Password" className="text-zinc-300 font-semibold">{t('auth.password')}</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-blue-500 hover:text-blue-400 transition-colors font-medium"
                  >
                    {t('auth.forgot_password')}
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-900/50 border-zinc-800 text-white focus-visible:ring-blue-500 h-11"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-tight h-11 mt-2 shadow-lg shadow-blue-600/20" disabled={loading}>
                {loading ? t('auth.login_loading') : t('auth.login_btn')}
              </Button>
            </form>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-medium animate-in fade-in zoom-in">
                {error === 'CredentialsSignin' ? t('auth.err_credentials')
                : error === 'UnverifiedEmail' ? t('auth.err_unverified')
                : t('auth.err_generic')}
              </div>
            )}

            <div className="text-center text-sm text-zinc-400 mt-2">
              {t('auth.no_account')}{" "}
              <Link href="/register" className="text-blue-500 hover:text-blue-400 transition-colors font-bold">
                {t('auth.register_btn')}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="px-8 text-center text-[10px] text-zinc-500 leading-relaxed uppercase tracking-widest font-medium opacity-50">
        By clicking continue, you agree to our{" "}
        <Link href="#" className="underline hover:text-zinc-300">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="#" className="underline hover:text-zinc-300">
          Privacy Policy
        </Link>.
      </div>
    </div>
  )
}
