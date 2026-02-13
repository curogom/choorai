import type { Lang } from '../i18n/ui';

export interface PageInfo {
  path: string;
  title: string;
}

// 한국어 타이틀 (기본)
const PAGE_TITLES_KO: Record<string, string> = {
  '/path/60min': '60분 완주',
  '/start/60min/frontend/react': 'React 프론트엔드',
  '/start/60min/frontend/vue': 'Vue 프론트엔드',
  '/start/60min/backend/fastapi': 'FastAPI 백엔드',
  '/start/60min/backend/hono': 'Hono 백엔드',
  '/start/60min/connect': '프론트+백 연결',
  '/start/60min/deploy': '배포하기',
  '/start/60min/complete': '완료!',
  '/map/tools': '도구 준비',
  '/map': '전체 로드맵',
  '/map/dns': '도메인 & DNS',
  '/map/frontend': '프론트엔드',
  '/map/frontend/react': 'React',
  '/map/frontend/vue': 'Vue',
  '/map/backend': '백엔드',
  '/map/backend/fastapi': 'FastAPI',
  '/map/backend/hono': 'Hono',
  '/map/backend/go': 'Go',
  '/map/backend/dotnet': '.NET',
  '/map/backend/nest': 'NestJS',
  '/map/database': '데이터베이스',
  '/map/database/sql-basics': 'SQL Basics',
  '/map/database/rdb': 'RDB',
  '/map/database/nosql': 'NoSQL',
  '/map/database/cache': 'Cache',
  '/map/database/vector': 'Vector DB',
  '/map/runtime': '환경변수 & Runtime',
  '/map/ops': '모니터링 & Ops',
  '/map/docker': 'Docker',
  '/map/cicd': 'CI/CD',
  '/baas/supabase': 'Supabase',
  '/baas/firebase': 'Firebase',
  '/map/auth': '인증 개요',
  '/map/auth/clerk': 'Clerk',
  '/map/auth/nextauth': 'NextAuth',
  '/map/auth/auth0': 'Auth0',
  '/map/auth/firebase': 'Firebase Auth',
  '/map/testing': '테스팅 개요',
  '/map/testing/unit': '단위 테스트',
  '/map/testing/e2e': 'E2E 테스트',
  '/deploy/cloudflare-pages': 'Cloudflare Pages',
  '/deploy/vercel': 'Vercel',
  '/deploy/cloud-run': 'Cloud Run',
  '/recipes': 'Agent Recipes',
  '/reference': '예제 프로젝트',
};

// 영어 타이틀
const PAGE_TITLES_EN: Record<string, string> = {
  '/path/60min': '60-min Challenge',
  '/start/60min/frontend/react': 'React Frontend',
  '/start/60min/frontend/vue': 'Vue Frontend',
  '/start/60min/backend/fastapi': 'FastAPI Backend',
  '/start/60min/backend/hono': 'Hono Backend',
  '/start/60min/connect': 'Connect Front+Back',
  '/start/60min/deploy': 'Deploy',
  '/start/60min/complete': 'Done!',
  '/map/tools': 'Tools Setup',
  '/map': 'Full Roadmap',
  '/map/dns': 'Domain & DNS',
  '/map/frontend': 'Frontend',
  '/map/frontend/react': 'React',
  '/map/frontend/vue': 'Vue',
  '/map/backend': 'Backend',
  '/map/backend/fastapi': 'FastAPI',
  '/map/backend/hono': 'Hono',
  '/map/backend/go': 'Go',
  '/map/backend/dotnet': '.NET',
  '/map/backend/nest': 'NestJS',
  '/map/database': 'Database',
  '/map/database/sql-basics': 'SQL Basics',
  '/map/database/rdb': 'RDB',
  '/map/database/nosql': 'NoSQL',
  '/map/database/cache': 'Cache',
  '/map/database/vector': 'Vector DB',
  '/map/runtime': 'Env Variables & Runtime',
  '/map/ops': 'Monitoring & Ops',
  '/map/docker': 'Docker',
  '/map/cicd': 'CI/CD',
  '/baas/supabase': 'Supabase',
  '/baas/firebase': 'Firebase',
  '/map/auth': 'Auth Overview',
  '/map/auth/clerk': 'Clerk',
  '/map/auth/nextauth': 'NextAuth',
  '/map/auth/auth0': 'Auth0',
  '/map/auth/firebase': 'Firebase Auth',
  '/map/testing': 'Testing Overview',
  '/map/testing/unit': 'Unit Testing',
  '/map/testing/e2e': 'E2E Testing',
  '/deploy/cloudflare-pages': 'Cloudflare Pages',
  '/deploy/vercel': 'Vercel',
  '/deploy/cloud-run': 'Cloud Run',
  '/recipes': 'Agent Recipes',
  '/reference': 'Example Projects',
};

const PAGE_TITLES: Record<Lang, Record<string, string>> = {
  ko: PAGE_TITLES_KO,
  en: PAGE_TITLES_EN,
};

// 정규 경로 순서 (로케일 prefix 없이)
const PAGE_PATHS = [
  '/path/60min',
  '/start/60min/frontend/react',
  '/start/60min/frontend/vue',
  '/start/60min/backend/fastapi',
  '/start/60min/backend/hono',
  '/start/60min/connect',
  '/start/60min/deploy',
  '/start/60min/complete',
  '/map/tools',
  '/map',
  '/map/dns',
  '/map/frontend',
  '/map/frontend/react',
  '/map/frontend/vue',
  '/map/backend',
  '/map/backend/fastapi',
  '/map/backend/hono',
  '/map/backend/go',
  '/map/backend/dotnet',
  '/map/backend/nest',
  '/map/database',
  '/map/database/sql-basics',
  '/map/database/rdb',
  '/map/database/nosql',
  '/map/database/cache',
  '/map/database/vector',
  '/map/runtime',
  '/map/ops',
  '/map/docker',
  '/map/cicd',
  '/baas/supabase',
  '/baas/firebase',
  '/map/auth',
  '/map/auth/clerk',
  '/map/auth/nextauth',
  '/map/auth/auth0',
  '/map/auth/firebase',
  '/map/testing',
  '/map/testing/unit',
  '/map/testing/e2e',
  '/deploy/cloudflare-pages',
  '/deploy/vercel',
  '/deploy/cloud-run',
  '/recipes',
  '/reference',
];

// 하위 호환을 위한 기존 PAGE_ORDER export
export const PAGE_ORDER: PageInfo[] = PAGE_PATHS.map((path) => ({
  path,
  title: PAGE_TITLES_KO[path] || path,
}));

export function getNavigation(currentPath: string, lang: Lang = 'ko') {
  const idx = PAGE_PATHS.findIndex((p) => p === currentPath);
  if (idx === -1) return { prev: null, next: null };

  const titles = PAGE_TITLES[lang] || PAGE_TITLES_KO;

  const makePage = (i: number): PageInfo => ({
    path: PAGE_PATHS[i],
    title: titles[PAGE_PATHS[i]] || PAGE_PATHS[i],
  });

  return {
    prev: idx > 0 ? makePage(idx - 1) : null,
    next: idx < PAGE_PATHS.length - 1 ? makePage(idx + 1) : null,
  };
}
