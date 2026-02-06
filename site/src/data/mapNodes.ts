// Map 노드 데이터 - roadmap.sh 스타일 시각화용

export interface SubNode {
  id: string;
  label: string;
  href?: string;
}

export interface MapNode {
  id: string;
  title: string;
  icon: string;
  what: string; // 1문장 설명
  done: string; // 완료 기준
  time: string; // 예상 소요 시간
  href: string; // 상세 페이지 링크
  subNodes: SubNode[];
  order: number; // 순서 (Guided 모드용)
  row: number; // 시각화 행 위치 (0 또는 1)
  col: number; // 시각화 열 위치
  group: 'dev' | 'ops' | 'infra'; // 영역 그룹
}

export const MAP_NODES: MapNode[] = [
  // === 개발 영역 (dev) ===
  {
    id: 'dns',
    title: '도메인',
    icon: '🌐',
    what: '나만의 도메인을 서비스에 연결합니다',
    done: 'https://내도메인.com 접속 성공',
    time: '10-20분',
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
    icon: '🎨',
    what: 'React/Vue로 UI를 만들고 배포합니다',
    done: 'Cloudflare Pages에 프론트엔드 배포 완료',
    time: '15-30분',
    href: '/map/frontend',
    order: 2,
    row: 0,
    col: 1,
    group: 'dev',
    subNodes: [
      { id: 'react', label: 'React', href: '/map/frontend' },
      { id: 'vue', label: 'Vue', href: '/map/frontend/vue' },
    ],
  },
  {
    id: 'backend',
    title: '백엔드',
    icon: '⚙️',
    what: 'API 서버를 만들고 클라우드에 배포합니다',
    done: 'Cloud Run에 백엔드 배포, API 응답 확인',
    time: '20-40분',
    href: '/map/backend',
    order: 3,
    row: 0,
    col: 2,
    group: 'dev',
    subNodes: [
      { id: 'fastapi', label: 'FastAPI', href: '/map/backend' },
      { id: 'hono', label: 'Hono', href: '/map/backend/hono' },
      { id: 'go', label: 'Go', href: '/map/backend/go' },
      { id: 'dotnet', label: '.NET', href: '/map/backend/dotnet' },
      { id: 'nest', label: 'NestJS', href: '/map/backend/nest' },
    ],
  },
  {
    id: 'database',
    title: '데이터베이스',
    icon: '🗄️',
    what: '데이터를 저장하고 관리합니다',
    done: 'DB 연결 및 CRUD 동작 확인',
    time: '15-30분',
    href: '/map/database',
    order: 4,
    row: 0,
    col: 3,
    group: 'dev',
    subNodes: [
      { id: 'database-overview', label: '개요', href: '/map/database' },
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
    icon: '🔧',
    what: '환경변수와 런타임 설정을 관리합니다',
    done: '환경변수 설정 및 동작 확인',
    time: '10-15분',
    href: '/map/runtime',
    order: 5,
    row: 1,
    col: 0,
    group: 'ops',
    subNodes: [
      { id: 'env-vars', label: '환경변수 설정', href: '/map/runtime#env' },
      { id: 'secrets', label: '시크릿 관리', href: '/map/runtime#secrets' },
    ],
  },
  {
    id: 'ops',
    title: '모니터링',
    icon: '📊',
    what: '서비스 상태를 모니터링하고 관리합니다',
    done: '로그/메트릭 대시보드 설정 완료',
    time: '15-30분',
    href: '/map/ops',
    order: 6,
    row: 1,
    col: 1,
    group: 'ops',
    subNodes: [
      { id: 'logging', label: '로깅', href: '/map/ops#logging' },
      { id: 'monitoring', label: '모니터링', href: '/map/ops#monitoring' },
      { id: 'alerting', label: '알림 설정', href: '/map/ops#alerting' },
    ],
  },
  // === 인프라 영역 (infra) ===
  {
    id: 'docker',
    title: 'Docker',
    icon: '🐳',
    what: '컨테이너로 앱을 패키징합니다',
    done: 'Dockerfile 작성 및 이미지 빌드 성공',
    time: '15-30분',
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
    icon: '🔄',
    what: '자동 빌드/배포 파이프라인을 구축합니다',
    done: 'GitHub Actions로 자동 배포 동작 확인',
    time: '20-40분',
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
    id: 'auth',
    title: '인증',
    icon: '🔐',
    what: '로그인/회원가입 기능을 구현합니다',
    done: '로그인 플로우 동작 확인',
    time: '30-60분',
    href: '/map/auth',
    order: 9,
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
    icon: '🧪',
    what: '테스트 코드를 작성하고 실행합니다',
    done: '테스트 통과 및 커버리지 확인',
    time: '30-60분',
    href: '/map/testing',
    order: 10,
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
    icon: '🛠️',
    what: '개발에 필요한 도구를 설치합니다',
    done: 'VS Code, Git, Node.js 설치 완료',
    time: '10-20분',
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
