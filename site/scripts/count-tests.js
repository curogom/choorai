#!/usr/bin/env node
/**
 * 테스트 수 카운트 스크립트
 * 빌드 전에 실행하여 test-counts.json 생성
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../../');

function getFiles(dir, pattern) {
  if (!existsSync(dir)) return [];

  const files = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getFiles(fullPath, pattern));
    } else if (pattern.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function countPythonTests(dir) {
  const files = getFiles(join(rootDir, dir), /^test_.*\.py$/);
  let count = 0;

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const matches = content.match(/def test_/g);
    count += matches ? matches.length : 0;
  }

  return count;
}

function countJsTests(dir) {
  const files = getFiles(join(rootDir, dir), /\.(test|spec|e2e-spec)\.(ts|tsx)$/);
  let count = 0;

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const matches = content.match(/(?:it|test)\s*\(/g);
    count += matches ? matches.length : 0;
  }

  return count;
}

// 카운트 실행
const counts = {
  b2bAdmin: {
    api: countPythonTests('examples/b2b-admin/api/tests'),
    apiHono: countJsTests('examples/b2b-admin/api-hono/src'),
    apiNest: countJsTests('examples/b2b-admin/api-nest/test'),
    web: countJsTests('examples/b2b-admin/web/src'),
    webVue: countJsTests('examples/b2b-admin/web-vue/src'),
  },
  b2cTodo: {
    api: countPythonTests('examples/b2c-todo/api/tests'),
    apiHono: countJsTests('examples/b2c-todo/api-hono/src'),
    apiNest: countJsTests('examples/b2c-todo/api-nest/test'),
    web: countJsTests('examples/b2c-todo/web/src'),
    webVue: countJsTests('examples/b2c-todo/web-vue/src'),
  },
};

const result = {
  b2bAdmin: counts.b2bAdmin.api + counts.b2bAdmin.apiHono + counts.b2bAdmin.apiNest + counts.b2bAdmin.web + counts.b2bAdmin.webVue,
  b2cTodo: counts.b2cTodo.api + counts.b2cTodo.apiHono + counts.b2cTodo.apiNest + counts.b2cTodo.web + counts.b2cTodo.webVue,
  total: counts.b2bAdmin.api + counts.b2bAdmin.apiHono + counts.b2bAdmin.apiNest + counts.b2bAdmin.web + counts.b2bAdmin.webVue + counts.b2cTodo.api + counts.b2cTodo.apiHono + counts.b2cTodo.apiNest + counts.b2cTodo.web + counts.b2cTodo.webVue,
  breakdown: counts,
  generatedAt: new Date().toISOString(),
};

// JSON 파일로 저장
const outputPath = join(__dirname, '../src/data/test-counts.json');
writeFileSync(outputPath, JSON.stringify(result, null, 2));

console.log('✅ Test counts generated:', result);
