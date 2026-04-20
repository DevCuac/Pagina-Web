'use server';

import { signIn } from '@/lib/auth';

export async function loginWithDiscord(callbackUrl: string) {
  await signIn('discord', { redirectTo: callbackUrl });
}

export async function loginWithGoogle(callbackUrl: string) {
  await signIn('google', { redirectTo: callbackUrl });
}
