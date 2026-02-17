// Map 노드 데이터 - roadmap.sh 스타일 시각화용

export interface SubNode {
  id: string;
  label: string;
  href?: string;
}

export interface MapNode {
  id: string;
  title: string;
  titleEn?: string;
  icon: string;
  what: string; // 1문장 설명
  whatEn?: string;
  done: string; // 완료 기준
  time: string; // 예상 소요 시간
  timeEn?: string;
  href: string; // 상세 페이지 링크
  subNodes: SubNode[];
  order: number; // 순서 (Guided 모드용)
  row: number; // 시각화 행 위치 (0 또는 1)
  col: number; // 시각화 열 위치
  group: 'dev' | 'ops' | 'infra'; // 영역 그룹
}

export function getLocalizedNode(node: MapNode, locale: string = 'ko') {
  if (locale === 'en') {
    return {
      ...node,
      title: node.titleEn || node.title,
      what: node.whatEn || node.what,
      time: node.timeEn || node.time,
    };
  }
  return node;
}

export const MAP_NODES: MapNode[] = [
  // === 개발 영역 (dev) ===
  {
    id: 'dns',
    title: '도메인',
    titleEn: 'Domain',
    icon: '🌐',
    what: '나만의 도메인을 서비스에 연결합니다',
    whatEn: 'Connect your own domain to your service',
    done: 'https://내도메인.com 접속 성공',
    time: '10-20분',
    timeEn: '10-20 min',
    href: '/map/dns',
    order: 1,
    row: 0,
    col: 0,
    group: 'dev',
    subNodes: [
      { id: 'domain-purchase', label: '도메인 준비', href: '/map/dns#domain' },
      { id: 'cloudflare-connect', label: 'Cloudflare 연결', href: '/map/dns#cloudflare' },
      { id: 'https-redirect', label: 'HTTPS 확인', href: '/map/dns#https' },
    ],
  },
  {
    id: 'frontend',
    title: '프론트엔드',
    titleEn: 'Frontend',
    icon: '🎨',
    what: 'React/Vue로 UI를 만들고 배포합니다',
    whatEn: 'Build and deploy UI with React/Vue',
    done: 'Cloudflare Pages에 프론트엔드 배포 완료',
    time: '15-30분',
    timeEn: '15-30 min',
    href: '/map/frontend',
    order: 2,
    row: 0,
    col: 1,
    group: 'dev',
    subNodes: [
      { id: 'react', label: 'React', href: '/map/frontend/react' },
      { id: 'vue', label: 'Vue', href: '/map/frontend/vue' },
    ],
  },
  {
    id: 'backend',
    title: '백엔드',
    titleEn: 'Backend',
    icon: '⚙️',
    what: 'API 서버를 만들고 클라우드에 배포합니다',
    whatEn: 'Build an API server and deploy to the cloud',
    done: 'Cloud Run에 백엔드 배포, API 응답 확인',
    time: '20-40분',
    timeEn: '20-40 min',
    href: '/map/backend',
    order: 3,
    row: 0,
    col: 2,
    group: 'dev',
    subNodes: [
      { id: 'fastapi', label: 'FastAPI', href: '/map/backend/fastapi' },
      { id: 'hono', label: 'Hono', href: '/map/backend/hono' },
      { id: 'go', label: 'Go', href: '/map/backend/go' },
      { id: 'dotnet', label: '.NET', href: '/map/backend/dotnet' },
      { id: 'nest', label: 'NestJS', href: '/map/backend/nest' },
    ],
  },
  {
    id: 'database',
    title: '데이터베이스',
    titleEn: 'Database',
    icon: '🗄️',
    what: '데이터를 저장하고 관리합니다',
    whatEn: 'Store and manage your data',
    done: 'DB 연결 및 CRUD 동작 확인',
    time: '15-30분',
    timeEn: '15-30 min',
    href: '/map/database',
    order: 4,
    row: 0,
    col: 3,
    group: 'dev',
    subNodes: [
      { id: 'database-overview', label: '개요', href: '/map/database' },
      { id: 'sql-basics', label: 'SQL Basics', href: '/map/database/sql-basics' },
      { id: 'rdb', label: 'RDB', href: '/map/database/rdb' },
      { id: 'nosql', label: 'NoSQL', href: '/map/database/nosql' },
      { id: 'cache', label: 'Cache', href: '/map/database/cache' },
      { id: 'vector', label: 'Vector DB', href: '/map/database/vector' },
      { id: 'supabase', label: 'Supabase', href: '/baas/supabase' },
    ],
  },
  // === 운영 영역 (ops) ===
  {
    id: 'runtime',
    title: '환경변수',
    titleEn: 'Environment',
    icon: '🔧',
    what: '환경변수와 런타임 설정을 관리합니다',
    whatEn: 'Manage environment variables and runtime config',
    done: '환경변수 설정 및 동작 확인',
    time: '10-15분',
    timeEn: '10-15 min',
    href: '/map/runtime',
    order: 5,
    row: 1,
    col: 0,
    group: 'ops',
    subNodes: [
      { id: 'env-vars', label: '환경변수 설정', href: '/map/runtime#env' },
      { id: 'env-split', label: '멀티 환경 운영', href: '/map/runtime/environments' },
      { id: 'secrets', label: '시크릿 관리', href: '/map/runtime#secrets' },
    ],
  },
  {
    id: 'ops',
    title: '모니터링',
    titleEn: 'Monitoring',
    icon: '📊',
    what: '서비스 상태를 모니터링하고 관리합니다',
    whatEn: 'Monitor and manage your service health',
    done: '로그/메트릭 대시보드 설정 완료',
    time: '15-30분',
    timeEn: '15-30 min',
    href: '/map/ops',
    order: 6,
    row: 1,
    col: 1,
    group: 'ops',
    subNodes: [
      { id: 'logging', label: '로깅', href: '/map/ops#logging' },
      { id: 'monitoring', label: '모니터링', href: '/map/ops#monitoring' },
      { id: 'alerting', label: '알림 설정', href: '/map/ops#alerting' },
      { id: 'release-rollback', label: '릴리즈/롤백 런북', href: '/map/ops/release-rollback' },
    ],
  },
  // === 인프라 영역 (infra) ===
  {
    id: 'docker',
    title: 'Docker',
    titleEn: 'Docker',
    icon: '🐳',
    what: '컨테이너로 앱을 패키징합니다',
    whatEn: 'Package your app into containers',
    done: 'Dockerfile 작성 및 이미지 빌드 성공',
    time: '15-30분',
    timeEn: '15-30 min',
    href: '/map/docker',
    order: 7,
    row: 1,
    col: 2,
    group: 'infra',
    subNodes: [
      { id: 'dockerfile', label: 'Dockerfile 작성', href: '/map/docker#dockerfile' },
      { id: 'docker-compose', label: 'Docker Compose', href: '/map/docker#compose' },
      { id: 'registry', label: '이미지 레지스트리', href: '/map/docker#registry' },
    ],
  },
  {
    id: 'cicd',
    title: 'CI/CD',
    titleEn: 'CI/CD',
    icon: '🔄',
    what: '자동 빌드/배포 파이프라인을 구축합니다',
    whatEn: 'Build automated build/deploy pipelines',
    done: 'GitHub Actions로 자동 배포 동작 확인',
    time: '20-40분',
    timeEn: '20-40 min',
    href: '/map/cicd',
    order: 8,
    row: 1,
    col: 3,
    group: 'infra',
    subNodes: [
      { id: 'github-actions', label: 'GitHub Actions', href: '/map/cicd#github-actions' },
      { id: 'workflows', label: '워크플로우 설정', href: '/map/cicd#workflows' },
      { id: 'deploy-triggers', label: '배포 트리거', href: '/map/cicd#triggers' },
    ],
  },
];

// 추가 가이드 노드 (Map에는 표시 안 되지만 네비게이션에서 사용)
export const EXTRA_NODES: MapNode[] = [
  {
    id: 'http-api',
    title: 'HTTP/API 기초',
    titleEn: 'HTTP/API Basics',
    icon: '📡',
    what: 'API 요청/응답의 기본 구조와 상태코드를 익힙니다',
    whatEn: 'Learn request/response flow and status codes',
    done: 'Endpoint, Method, Status Code 해석 가능',
    time: '10-20분',
    timeEn: '10-20 min',
    href: '/map/http-api',
    order: 12,
    row: -1,
    col: -1,
    group: 'dev',
    subNodes: [
      { id: 'endpoint', label: 'Endpoint', href: '/map/http-api' },
      { id: 'status-code', label: 'Status Code', href: '/map/http-api' },
      { id: 'json', label: 'JSON', href: '/map/http-api' },
    ],
  },
  {
    id: 'deploy-basics',
    title: '배포 기초',
    titleEn: 'Deploy Basics',
    icon: '🚀',
    what: 'Build/Artifact/Hosting/Runtime 개념을 정리합니다',
    whatEn: 'Understand build, artifact, hosting, and runtime',
    done: '배포 단계 핵심 용어 구분 가능',
    time: '10-20분',
    timeEn: '10-20 min',
    href: '/map/deploy-basics',
    order: 13,
    row: -1,
    col: -1,
    group: 'ops',
    subNodes: [
      { id: 'build', label: 'Build', href: '/map/deploy-basics' },
      { id: 'artifact', label: 'Artifact', href: '/map/deploy-basics' },
      { id: 'hosting', label: 'Hosting', href: '/map/deploy-basics' },
    ],
  },
  {
    id: 'package-basics',
    title: '패키지 기초',
    titleEn: 'Package Basics',
    icon: '📦',
    what: 'npm/pip 의존성 관리와 lockfile 개념을 익힙니다',
    whatEn: 'Learn npm/pip dependency management and lockfiles',
    done: 'dependency/devDependency 구분 가능',
    time: '10-20분',
    timeEn: '10-20 min',
    href: '/map/package-basics',
    order: 14,
    row: -1,
    col: -1,
    group: 'dev',
    subNodes: [
      { id: 'npm', label: 'npm', href: '/map/package-basics' },
      { id: 'pip', label: 'pip', href: '/map/package-basics' },
      { id: 'lockfile', label: 'Lockfile', href: '/map/package-basics' },
    ],
  },
  {
    id: 'cors-basics',
    title: 'CORS 기초',
    titleEn: 'CORS Basics',
    icon: '🛡️',
    what: '브라우저 교차 출처 정책과 해결 패턴을 익힙니다',
    whatEn: 'Learn browser cross-origin policy and fixes',
    done: 'Preflight/CORS 에러 원인 파악 가능',
    time: '10-15분',
    timeEn: '10-15 min',
    href: '/map/cors-basics',
    order: 15,
    row: -1,
    col: -1,
    group: 'ops',
    subNodes: [
      { id: 'same-origin', label: 'Same-Origin', href: '/map/cors-basics' },
      { id: 'preflight', label: 'Preflight', href: '/map/cors-basics' },
    ],
  },
  {
    id: 'frontend-data-flow',
    title: '데이터 흐름',
    titleEn: 'Data Flow',
    icon: '🔄',
    what: 'Query/Mutation 중심 프론트 데이터 흐름을 이해합니다',
    whatEn: 'Understand query/mutation-based frontend data flow',
    done: '캐시 무효화 흐름 설명 가능',
    time: '10-20분',
    timeEn: '10-20 min',
    href: '/map/frontend-data-flow',
    order: 16,
    row: -1,
    col: -1,
    group: 'dev',
    subNodes: [
      { id: 'query', label: 'Query', href: '/map/frontend-data-flow' },
      { id: 'mutation', label: 'Mutation', href: '/map/frontend-data-flow' },
    ],
  },
  {
    id: 'auth-basics',
    title: '인증 입문',
    titleEn: 'Auth Basics',
    icon: '🔐',
    what: '인증/인가와 세션/JWT의 차이를 이해합니다',
    whatEn: 'Understand authn/authz and session/JWT differences',
    done: 'AuthN/AuthZ 구분 가능',
    time: '10-20분',
    timeEn: '10-20 min',
    href: '/map/auth-basics',
    order: 17,
    row: -1,
    col: -1,
    group: 'dev',
    subNodes: [
      { id: 'authn', label: 'Authentication', href: '/map/auth-basics' },
      { id: 'authz', label: 'Authorization', href: '/map/auth-basics' },
      { id: 'oauth', label: 'OAuth', href: '/map/auth-basics' },
    ],
  },
  {
    id: 'spa-routing',
    title: 'SPA 라우팅',
    titleEn: 'SPA Routing',
    icon: '🧭',
    what: '새로고침 404를 포함한 SPA 라우팅 문제를 이해합니다',
    whatEn: 'Understand SPA routing issues including refresh 404',
    done: 'fallback 라우팅 설정 이유 설명 가능',
    time: '10-15분',
    timeEn: '10-15 min',
    href: '/map/spa-routing',
    order: 18,
    row: -1,
    col: -1,
    group: 'dev',
    subNodes: [
      { id: 'client-routing', label: 'Client Routing', href: '/map/spa-routing' },
      { id: 'fallback', label: 'Fallback', href: '/map/spa-routing' },
    ],
  },
  {
    id: 'testing-basics',
    title: '테스트 기초',
    titleEn: 'Testing Basics',
    icon: '🧪',
    what: 'Unit/Integration/E2E 테스트 용어를 빠르게 정리합니다',
    whatEn: 'Quick primer on unit/integration/E2E testing terms',
    done: '테스트 전략 기본 구조 이해',
    time: '10-15분',
    timeEn: '10-15 min',
    href: '/map/testing-basics',
    order: 19,
    row: -1,
    col: -1,
    group: 'dev',
    subNodes: [
      { id: 'unit-test', label: 'Unit', href: '/map/testing-basics' },
      { id: 'integration-test', label: 'Integration', href: '/map/testing-basics' },
      { id: 'e2e-test', label: 'E2E', href: '/map/testing-basics' },
    ],
  },
  {
    id: 'env-basics',
    title: '환경변수 기초',
    titleEn: 'Env Basics',
    icon: '🧩',
    what: '빌드타임/런타임 변수와 OS별 설정 방법을 익힙니다',
    whatEn: 'Learn build/runtime env vars and OS-specific setup',
    done: '.env 및 배포 변수 설정 실수 예방',
    time: '15-25분',
    timeEn: '15-25 min',
    href: '/map/env-basics',
    order: 20,
    row: -1,
    col: -1,
    group: 'ops',
    subNodes: [
      { id: 'build-env', label: 'Build-time', href: '/map/env-basics' },
      { id: 'runtime-env', label: 'Runtime', href: '/map/env-basics' },
      { id: 'secrets', label: 'Secrets', href: '/map/env-basics' },
    ],
  },
  {
    id: 'cli-basics',
    title: 'CLI 기초',
    titleEn: 'CLI Basics',
    icon: '⌨️',
    what: 'OS별 터미널 명령과 경로 차이를 익힙니다',
    whatEn: 'Learn OS-specific terminal commands and path differences',
    done: '기본 파일/폴더 조작 명령 실행 가능',
    time: '15-25분',
    timeEn: '15-25 min',
    href: '/map/cli-basics',
    order: 21,
    row: -1,
    col: -1,
    group: 'dev',
    subNodes: [
      { id: 'path', label: 'Path', href: '/map/cli-basics' },
      { id: 'file-ops', label: 'File Ops', href: '/map/cli-basics' },
      { id: 'shell', label: 'Shell', href: '/map/cli-basics' },
    ],
  },
  {
    id: 'git',
    title: 'Git 기초',
    titleEn: 'Git Basics',
    icon: '🧾',
    what: 'Repository, Branch, Commit, PR 같은 Git 핵심 개념을 익힙니다',
    whatEn: 'Learn core Git concepts like repository, branch, commit, and PR',
    done: 'git add/commit/push 흐름 이해',
    time: '10-20분',
    timeEn: '10-20 min',
    href: '/map/git',
    order: 9,
    row: -1,
    col: -1,
    group: 'dev',
    subNodes: [
      { id: 'repo', label: 'Repository', href: '/map/git' },
      { id: 'branch', label: 'Branch', href: '/map/git' },
      { id: 'commit', label: 'Commit', href: '/map/git' },
      { id: 'pr', label: 'Pull Request', href: '/map/git' },
    ],
  },
  {
    id: 'auth',
    title: '인증',
    titleEn: 'Auth',
    icon: '🔐',
    what: '로그인/회원가입 기능을 구현합니다',
    whatEn: 'Implement login/signup functionality',
    done: '로그인 플로우 동작 확인',
    time: '30-60분',
    timeEn: '30-60 min',
    href: '/map/auth',
    order: 10,
    row: -1,
    col: -1,
    group: 'dev',
    subNodes: [
      { id: 'clerk', label: 'Clerk', href: '/map/auth/clerk' },
      { id: 'nextauth', label: 'NextAuth', href: '/map/auth/nextauth' },
      { id: 'auth0', label: 'Auth0', href: '/map/auth/auth0' },
      { id: 'firebase', label: 'Firebase', href: '/map/auth/firebase' },
    ],
  },
  {
    id: 'testing',
    title: '테스팅',
    titleEn: 'Testing',
    icon: '🧪',
    what: '테스트 코드를 작성하고 실행합니다',
    whatEn: 'Write and run test code',
    done: '테스트 통과 및 커버리지 확인',
    time: '30-60분',
    timeEn: '30-60 min',
    href: '/map/testing',
    order: 11,
    row: -1,
    col: -1,
    group: 'dev',
    subNodes: [
      { id: 'unit', label: '유닛 테스트', href: '/map/testing/unit' },
      { id: 'e2e', label: 'E2E 테스트', href: '/map/testing/e2e' },
    ],
  },
  {
    id: 'tools',
    title: '도구 준비',
    titleEn: 'Tools Setup',
    icon: '🛠️',
    what: '개발에 필요한 도구를 설치합니다',
    whatEn: 'Install the tools needed for development',
    done: 'VS Code, Git, Node.js 설치 완료',
    time: '10-20분',
    timeEn: '10-20 min',
    href: '/map/tools',
    order: 0,
    row: -1,
    col: -1,
    group: 'dev',
    subNodes: [
      { id: 'vscode', label: 'VS Code', href: '/map/tools#vscode' },
      { id: 'git', label: 'Git', href: '/map/tools#git' },
      { id: 'nodejs', label: 'Node.js', href: '/map/tools#nodejs' },
    ],
  },
];

// 노드 ID로 노드 찾기
export function getNodeById(id: string): MapNode | undefined {
  return [...MAP_NODES, ...EXTRA_NODES].find((node) => node.id === id);
}

// 다음 노드 찾기 (Guided 모드용)
export function getNextNode(currentId: string): MapNode | undefined {
  const currentNode = getNodeById(currentId);
  if (!currentNode) return undefined;
  return MAP_NODES.find((node) => node.order === currentNode.order + 1);
}

// 이전 노드 찾기
export function getPrevNode(currentId: string): MapNode | undefined {
  const currentNode = getNodeById(currentId);
  if (!currentNode) return undefined;
  return MAP_NODES.find((node) => node.order === currentNode.order - 1);
}
