import { cookies } from 'next/headers';

const dictionaries: Record<string, any> = {
  de: () => import('@/locales/de.json').then((module) => module.default),
  en: () => import('@/locales/en.json').then((module) => module.default),
  es: () => import('@/locales/es.json').then((module) => module.default),
};

export const getLocaleObj = async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'es';
  const dict = dictionaries[locale] ? await dictionaries[locale]() : await dictionaries['en']();
  return { locale, dict };
};

export const getTranslation = (dict: any, keyString: string) => {
  const keys = keyString.split('.');
  let result = dict;
  for (const k of keys) {
    if (result && typeof result === 'object') {
      result = result[k];
    } else {
      return keyString;
    }
  }
  return result || keyString;
};
