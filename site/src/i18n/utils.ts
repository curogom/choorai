import { ui, defaultLang, type Lang } from './ui';

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]): string {
    return ui[lang]?.[key] || ui[defaultLang][key];
  };
}

export function getLocalePath(lang: Lang, path: string): string {
  if (lang === defaultLang) return path;
  return `/${lang}${path}`;
}

export function getPathWithoutLocale(pathname: string): string {
  for (const lang of Object.keys(ui)) {
    if (lang !== defaultLang && pathname.startsWith(`/${lang}/`)) {
      return pathname.slice(lang.length + 1);
    }
    if (lang !== defaultLang && pathname === `/${lang}`) {
      return '/';
    }
  }
  return pathname;
}
