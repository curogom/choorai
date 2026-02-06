export interface PageInfo {
  path: string;
  title: string;
}

export const PAGE_ORDER: PageInfo[] = [
  // 60분 코스
  { path: '/path/60min', title: '60분 완주' },
  { path: '/start/60min/frontend/react', title: 'React 프론트엔드' },
  { path: '/start/60min/frontend/vue', title: 'Vue 프론트엔드' },
  { path: '/start/60min/backend/fastapi', title: 'FastAPI 백엔드' },
  { path: '/start/60min/backend/hono', title: 'Hono 백엔드' },
  { path: '/start/60min/connect', title: '프론트+백 연결' },
  { path: '/start/60min/deploy', title: '배포하기' },
  { path: '/start/60min/complete', title: '완료!' },
  // Map 메인
  { path: '/map/tools', title: '도구 준비' },
  { path: '/map', title: '전체 로드맵' },
  { path: '/map/dns', title: '도메인 & DNS' },
  // Frontend
  { path: '/map/frontend', title: '프론트엔드' },
  { path: '/map/frontend/vue', title: 'Vue' },
  // Backend
  { path: '/map/backend', title: '백엔드' },
  { path: '/map/backend/hono', title: 'Hono' },
  { path: '/map/backend/go', title: 'Go' },
  { path: '/map/backend/dotnet', title: '.NET' },
  { path: '/map/backend/nest', title: 'NestJS' },
  // Database
  { path: '/map/database', title: '데이터베이스' },
  { path: '/map/database/rdb', title: 'RDB' },
  { path: '/map/database/nosql', title: 'NoSQL' },
  { path: '/map/database/cache', title: 'Cache' },
  { path: '/map/database/vector', title: 'Vector DB' },
  // Runtime & Ops
  { path: '/map/runtime', title: '환경변수 & Runtime' },
  { path: '/map/ops', title: '모니터링 & Ops' },
  // Advanced
  { path: '/map/docker', title: 'Docker' },
  { path: '/map/cicd', title: 'CI/CD' },
  // BaaS
  { path: '/baas/supabase', title: 'Supabase' },
  { path: '/baas/firebase', title: 'Firebase' },
  // Auth
  { path: '/map/auth', title: '인증 개요' },
  { path: '/map/auth/clerk', title: 'Clerk' },
  { path: '/map/auth/nextauth', title: 'NextAuth' },
  { path: '/map/auth/auth0', title: 'Auth0' },
  { path: '/map/auth/firebase', title: 'Firebase Auth' },
  // Testing
  { path: '/map/testing', title: '테스팅 개요' },
  { path: '/map/testing/unit', title: '단위 테스트' },
  { path: '/map/testing/e2e', title: 'E2E 테스트' },
  // Deploy
  { path: '/deploy/cloudflare-pages', title: 'Cloudflare Pages' },
  { path: '/deploy/vercel', title: 'Vercel' },
  { path: '/deploy/cloud-run', title: 'Cloud Run' },
  // Reference
  { path: '/recipes', title: 'Agent Recipes' },
  { path: '/reference', title: '예제 프로젝트' },
];

export function getNavigation(currentPath: string) {
  const idx = PAGE_ORDER.findIndex((p) => p.path === currentPath);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? PAGE_ORDER[idx - 1] : null,
    next: idx < PAGE_ORDER.length - 1 ? PAGE_ORDER[idx + 1] : null,
  };
}
