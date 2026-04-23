import type { Metadata } from 'next';
import './globals.css';
import SessionProvider from '@/components/providers/SessionProvider';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getLocaleObj } from '@/lib/i18n';
import { I18nProvider } from '@/components/I18nProvider';

import prisma from '@/lib/db';

export async function generateMetadata(): Promise<Metadata> {
  const customSettings = await prisma.siteSetting.findMany({
    where: { key: { in: ['site_name', 'site_description', 'site_favicon'] } }
  });
  
  const config = customSettings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);

  const siteName = config['site_name'] || 'CrossPixel — The Ultimate Minecraft Experience';
  const siteDesc = config['site_description'] || 'Bienvenido a CrossPixel Network. Únete a nuestros servidores de Survival, Duels, Build Battle y más. ¡Conecta ahora y sé parte de nuestra comunidad!';
  const siteFavicon = config['site_favicon'] || '/favicon.ico';

  return {
    title: {
      default: siteName,
      template: `%s • ${siteName.split(' ')[0]}`,
    },
    description: siteDesc,
    icons: {
      icon: siteFavicon,
    },
    keywords: ['minecraft', 'server', 'crosspixel', 'pvp', 'survival', 'comunidad'],
  };
}

import { ToastProvider } from '@/components/providers/ToastProvider';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale, dict } = await getLocaleObj();

  return (
    <html lang={locale} className={cn("dark font-sans", geist.variable)}>
      <body>
        <I18nProvider locale={locale} dict={dict}>
          <ToastProvider>
            <SessionProvider>
              <Navbar />
              <main>{children}</main>
              <Footer />
            </SessionProvider>
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
