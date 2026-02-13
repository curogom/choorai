import type { Lang } from './ui';
import { useTranslations, getLocalePath } from './utils';

interface NavItem {
  label: string;
  href?: string;
  badge?: string;
  tags?: string[];
  indent?: number;
}

interface NavGroupType {
  title: string;
  storageKey: string;
  items: NavItem[];
}

interface NavSection {
  title: string;
  href?: string;
  groups?: NavGroupType[];
  items?: NavItem[];
}

export function getNavigation(lang: Lang): NavSection[] {
  const t = useTranslations(lang);
  const lp = (path: string) => getLocalePath(lang, path);

  return [
    {
      title: t('nav.path'),
      href: lp('/path'),
      groups: [
        {
          title: t('nav.courseList'),
          storageKey: 'path-courses',
          items: [
            { label: t('nav.60min'), href: lp('/path/60min'), tags: ['🌱'], indent: 1 },
            { label: lang === 'ko' ? '프론트엔드' : 'Frontend', indent: 1 },
            { label: 'React', href: lp('/start/60min/frontend/react'), indent: 2 },
            { label: 'Vue', href: lp('/start/60min/frontend/vue'), indent: 2 },
            { label: lang === 'ko' ? '백엔드' : 'Backend', indent: 1 },
            { label: 'FastAPI', href: lp('/start/60min/backend/fastapi'), indent: 2 },
            { label: 'Hono', href: lp('/start/60min/backend/hono'), indent: 2 },
            { label: lang === 'ko' ? '연결' : 'Connect', href: lp('/start/60min/connect'), indent: 1 },
            { label: lang === 'ko' ? '배포' : 'Deploy', href: lp('/start/60min/deploy'), indent: 1 },
            { label: t('nav.complete'), href: lp('/start/60min/complete'), indent: 1 },
            { label: t('nav.miniSaas'), badge: t('nav.preparing'), indent: 1 },
            { label: t('nav.b2bAdmin'), badge: t('nav.preparing'), indent: 1 },
          ],
        },
      ],
      items: [
        { label: t('nav.tools'), href: lp('/map/tools') },
        { label: lang === 'en' ? 'Git Basics' : 'Git 기초', href: lp('/map/git'), indent: 1 },
        { label: lang === 'en' ? 'CLI Basics' : 'CLI 기초', href: lp('/map/cli-basics'), indent: 1 },
        { label: lang === 'en' ? 'Package Basics' : '패키지 기초', href: lp('/map/package-basics'), indent: 1 },
      ],
    },
    {
      title: t('nav.map'),
      href: lp('/map'),
      groups: [
        {
          title: t('nav.basicCycles'),
          storageKey: 'map-basic',
          items: [
            { label: t('nav.roadmap'), href: lp('/map') },
            { label: lang === 'en' ? 'HTTP/API Basics' : 'HTTP/API 기초', href: lp('/map/http-api') },
            { label: t('nav.dns'), href: lp('/map/dns') },
            { label: t('nav.frontend'), href: lp('/map/frontend'), indent: 1 },
            { label: 'React', href: lp('/map/frontend/react'), badge: 'Lv.1', tags: ['🌱'], indent: 2 },
            { label: lang === 'en' ? 'Data Flow' : '데이터 흐름', href: lp('/map/frontend-data-flow'), indent: 2 },
            { label: lang === 'en' ? 'SPA Routing' : 'SPA 라우팅', href: lp('/map/spa-routing'), indent: 2 },
            { label: 'Vue', href: lp('/map/frontend/vue'), badge: 'Lv.2', indent: 2 },
            { label: t('nav.backend'), href: lp('/map/backend'), indent: 1 },
            { label: 'Hono', href: lp('/map/backend/hono'), badge: 'Lv.1', tags: ['🌱'], indent: 2 },
            { label: 'FastAPI', href: lp('/map/backend/fastapi'), badge: 'Lv.2', indent: 2 },
            { label: 'Go', href: lp('/map/backend/go'), badge: 'Lv.3', indent: 2 },
            { label: '.NET', href: lp('/map/backend/dotnet'), badge: 'Lv.3', indent: 2 },
            { label: 'NestJS', href: lp('/map/backend/nest'), badge: 'Lv.4', indent: 2 },
            { label: t('nav.database'), href: lp('/map/database'), indent: 1 },
            { label: 'SQL Basics', href: lp('/map/database/sql-basics'), badge: 'Lv.1', tags: ['🌱'], indent: 2 },
            { label: 'RDB', href: lp('/map/database/rdb'), badge: 'Lv.2', indent: 2 },
            { label: 'NoSQL', href: lp('/map/database/nosql'), badge: 'Lv.2', indent: 2 },
            { label: 'Cache', href: lp('/map/database/cache'), badge: 'Lv.3', indent: 2 },
            { label: 'Vector DB', href: lp('/map/database/vector'), badge: 'Lv.4', indent: 2 },
            { label: t('nav.envVars'), href: lp('/map/runtime'), indent: 1 },
            { label: lang === 'en' ? 'Env Basics' : '환경변수 기초', href: lp('/map/env-basics'), indent: 2 },
            { label: t('nav.monitoring'), href: lp('/map/ops'), indent: 1 },
          ],
        },
        {
          title: t('nav.advanced'),
          storageKey: 'map-advanced',
          items: [
            { label: 'Docker', href: lp('/map/docker'), indent: 1 },
            { label: 'CI/CD', href: lp('/map/cicd'), indent: 1 },
            { label: lang === 'en' ? 'Deploy Basics' : '배포 기초', href: lp('/map/deploy-basics'), indent: 1 },
            { label: lang === 'en' ? 'CORS Basics' : 'CORS 기초', href: lp('/map/cors-basics'), indent: 1 },
            { label: lang === 'en' ? 'Auth Basics' : '인증 입문', href: lp('/map/auth-basics'), indent: 1 },
            { label: lang === 'en' ? 'Auth Overview' : '인증 개요', href: lp('/map/auth'), indent: 2 },
            { label: 'Clerk', href: lp('/map/auth/clerk'), badge: 'Lv.2', tags: ['👍'], indent: 2 },
            { label: 'NextAuth', href: lp('/map/auth/nextauth'), badge: 'Lv.3', indent: 2 },
            { label: 'Auth0', href: lp('/map/auth/auth0'), badge: 'Lv.3', indent: 2 },
            { label: 'Firebase Auth', href: lp('/map/auth/firebase'), badge: 'Lv.2', indent: 2 },
            { label: lang === 'en' ? 'Testing Basics' : '테스트 기초', href: lp('/map/testing-basics'), indent: 1 },
            { label: lang === 'en' ? 'Testing Overview' : '테스팅 개요', href: lp('/map/testing'), indent: 2 },
            { label: lang === 'en' ? 'Unit Testing' : '단위 테스트', href: lp('/map/testing/unit'), indent: 2 },
            { label: lang === 'en' ? 'E2E Testing' : 'E2E 테스트', href: lp('/map/testing/e2e'), indent: 2 },
          ],
        },
      ],
    },
    {
      title: t('nav.baas'),
      items: [
        { label: 'Supabase', href: lp('/baas/supabase'), badge: 'Lv.3', tags: ['👍'] },
        { label: 'Firebase', href: lp('/baas/firebase'), badge: 'Lv.2' },
      ],
    },
    {
      title: t('nav.fix'),
      href: lp('/fix'),
      items: [
        { label: t('nav.troubleshooting'), href: lp('/fix') },
        { label: t('nav.corsError'), href: lp('/fix/cors'), indent: 1 },
        { label: t('nav.envVar'), href: lp('/fix/env'), indent: 1 },
        { label: 'SPA 404', href: lp('/fix/spa-404'), indent: 1 },
        { label: t('nav.buildFail'), href: lp('/fix/build-fail'), indent: 1 },
        { label: t('nav.authCookie'), href: lp('/fix/auth-cookie'), indent: 1 },
      ],
    },
    {
      title: t('nav.recipes'),
      href: lp('/recipes'),
      items: [
        { label: 'Agent Recipes', href: lp('/recipes') },
      ],
    },
    {
      title: t('nav.reference'),
      href: lp('/reference'),
      items: [
        { label: t('nav.examples'), href: lp('/reference') },
      ],
    },
    {
      title: t('nav.deploy'),
      items: [
        { label: 'Cloudflare Pages', href: lp('/deploy/cloudflare-pages') },
        { label: 'Vercel', href: lp('/deploy/vercel') },
        { label: 'Cloud Run', href: lp('/deploy/cloud-run') },
      ],
    },
  ];
}
