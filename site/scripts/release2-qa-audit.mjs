#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd());
const siteRoot = path.join(repoRoot, 'site');
const srcPagesRoot = path.join(siteRoot, 'src', 'pages');
const distRoot = path.join(siteRoot, 'dist');

const release2Targets = [
  'recipes/react-bootstrap',
  'recipes/fastapi-bootstrap',
  'recipes/hono-bootstrap',
  'recipes/add-crud-endpoint',
  'recipes/add-auth-cookie',
  'recipes/review-pr-quality',
  'deploy/netlify',
  'deploy/railway',
  'map/runtime/environments',
  'map/ops/release-rollback',
];

const targetPages = release2Targets.flatMap((target) => ([
  {
    locale: 'ko',
    route: `/${target}`,
    source: path.join(srcPagesRoot, `${target}.astro`),
  },
  {
    locale: 'en',
    route: `/en/${target}`,
    source: path.join(srcPagesRoot, `en/${target}.astro`),
  },
]));

function exists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function routeToDistPath(route) {
  if (route === '/') return path.join(distRoot, 'index.html');
  const trimmed = route.replace(/^\/+/, '');
  return path.join(distRoot, trimmed, 'index.html');
}

function walkDir(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function collectBuiltRoutes() {
  const routes = new Set();
  if (!exists(distRoot)) {
    return routes;
  }
  const htmlFiles = walkDir(distRoot).filter((filePath) => filePath.endsWith('index.html'));
  for (const filePath of htmlFiles) {
    const rel = path.relative(distRoot, filePath).replace(/\\/g, '/');
    if (rel === 'index.html') {
      routes.add('/');
      continue;
    }
    const normalized = rel.replace(/\/index\.html$/, '');
    routes.add(`/${normalized}`);
  }
  return routes;
}

function normalizeInternalPath(rawHref) {
  const noHash = rawHref.split('#')[0];
  const noQuery = noHash.split('?')[0];
  if (!noQuery) return '/';
  if (noQuery !== '/' && noQuery.endsWith('/')) {
    return noQuery.slice(0, -1);
  }
  return noQuery;
}

function isSkippableInternalPath(route) {
  return /\.(png|jpg|jpeg|gif|webp|svg|ico|txt|xml|json|pdf)$/i.test(route);
}

function extractInternalHrefs(sourceText) {
  const hrefs = [];
  const regex = /href=(["'])(.*?)\1/g;
  let match = regex.exec(sourceText);
  while (match) {
    const href = match[2];
    if (href.startsWith('/') && !href.startsWith('//')) {
      hrefs.push(href);
    }
    match = regex.exec(sourceText);
  }
  return hrefs;
}

function collectJsonLdTypes(value, types) {
  if (!value) return;
  if (Array.isArray(value)) {
    value.forEach((item) => collectJsonLdTypes(item, types));
    return;
  }
  if (typeof value !== 'object') return;

  const typeValue = value['@type'];
  if (typeof typeValue === 'string') {
    types.add(typeValue);
  } else if (Array.isArray(typeValue)) {
    typeValue.forEach((t) => {
      if (typeof t === 'string') types.add(t);
    });
  }

  if (value['@graph']) {
    collectJsonLdTypes(value['@graph'], types);
  }

  for (const v of Object.values(value)) {
    if (typeof v === 'object') {
      collectJsonLdTypes(v, types);
    }
  }
}

function extractJsonLdTypesFromHtml(htmlText) {
  const types = new Set();
  const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match = scriptRegex.exec(htmlText);
  while (match) {
    const raw = match[1].trim();
    if (!raw) {
      match = scriptRegex.exec(htmlText);
      continue;
    }
    try {
      const parsed = JSON.parse(raw);
      collectJsonLdTypes(parsed, types);
    } catch {
      // Ignore malformed JSON-LD blocks for this audit.
    }
    match = scriptRegex.exec(htmlText);
  }
  return types;
}

const sectionMatchers = {
  tldr: [/TL;DR/i],
  prerequisites: [/Prerequisites/i, /사전 준비/i],
  steps: [/Steps/i, /실행 순서/i, /단계/i, /절차/i],
  validation: [/Validation/i, /검증/i],
  troubleshooting: [/Troubleshooting/i, /문제 해결/i, /트러블슈팅/i],
  references: [/References/i, /관련 문서/i, /참고/i],
};

function extractVisibleText(htmlText) {
  return htmlText
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function auditTemplateSections(visibleText) {
  const result = {};
  for (const [section, patterns] of Object.entries(sectionMatchers)) {
    result[section] = patterns.some((pattern) => pattern.test(visibleText));
  }
  return result;
}

function runAudit() {
  const builtRoutes = collectBuiltRoutes();
  const routeRenderFailures = [];
  const linkFailures = [];
  const jsonLdFailures = [];
  const templateFailures = [];
  const pairFailures = [];

  for (const page of targetPages) {
    if (!exists(page.source)) {
      routeRenderFailures.push({
        route: page.route,
        source: page.source,
        reason: 'source_missing',
      });
      continue;
    }

    const distPath = routeToDistPath(page.route);
    if (!exists(distPath)) {
      routeRenderFailures.push({
        route: page.route,
        source: page.source,
        distPath,
        reason: 'dist_missing',
      });
      continue;
    }

    const sourceText = fs.readFileSync(page.source, 'utf8');
    const htmlText = fs.readFileSync(distPath, 'utf8');

    const hrefs = extractInternalHrefs(sourceText);
    for (const href of hrefs) {
      const normalized = normalizeInternalPath(href);
      if (isSkippableInternalPath(normalized)) continue;
      if (!builtRoutes.has(normalized)) {
        linkFailures.push({
          source: page.source,
          fromRoute: page.route,
          href,
          normalized,
        });
      }
    }

    const types = extractJsonLdTypesFromHtml(htmlText);
    const hasArticle = types.has('Article');
    const hasBreadcrumb = types.has('BreadcrumbList');
    if (!hasArticle || !hasBreadcrumb) {
      jsonLdFailures.push({
        route: page.route,
        source: page.source,
        hasArticle,
        hasBreadcrumb,
      });
    }

    const visibleText = extractVisibleText(htmlText);
    const templateResult = auditTemplateSections(visibleText);
    const missingSections = Object.entries(templateResult)
      .filter(([, ok]) => !ok)
      .map(([section]) => section);
    if (missingSections.length > 0) {
      templateFailures.push({
        route: page.route,
        source: page.source,
        missingSections,
      });
    }
  }

  for (const target of release2Targets) {
    const koSource = path.join(srcPagesRoot, `${target}.astro`);
    const enSource = path.join(srcPagesRoot, `en/${target}.astro`);
    if (!exists(koSource) || !exists(enSource)) {
      pairFailures.push({
        target,
        koExists: exists(koSource),
        enExists: exists(enSource),
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      targets: release2Targets.length,
      pages: targetPages.length,
      routeRenderFailures: routeRenderFailures.length,
      linkFailures: linkFailures.length,
      jsonLdFailures: jsonLdFailures.length,
      templateFailures: templateFailures.length,
      pairFailures: pairFailures.length,
    },
    routeRenderFailures,
    linkFailures,
    jsonLdFailures,
    templateFailures,
    pairFailures,
  };
}

const report = runAudit();
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
