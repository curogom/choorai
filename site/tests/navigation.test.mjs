// @ts-nocheck
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
const nativeRequire = createRequire(import.meta.url);
const cache = new Map();
let states = [], effects = [], cursor = 0;
const react = {
  useState(initial) { const i = cursor++; if (!(i in states)) states[i] = initial; return [states[i], (v) => { states[i] = typeof v === 'function' ? v(states[i]) : v; }]; },
  useEffect(fn) { effects.push(fn); },
};
function load(file) {
  file = resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const mod = { exports: {} }; cache.set(file, mod);
  const output = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  new Function('require', 'module', 'exports', output)((id) => id === 'react' ? react : id.startsWith('.') ? load(resolve(dirname(file), `${id}.ts`)) : nativeRequire(id), mod, mod.exports);
  return mod.exports;
}
const store = new Map(); let writes = 0; let denyWrite = false;
globalThis.localStorage = { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => { writes++; if (denyWrite) throw new Error('QuotaExceededError'); store.set(key, value); }, removeItem: (key) => store.delete(key) };
const listeners = new Map();
globalThis.window = { addEventListener: (name, fn) => { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); }, removeEventListener: (name, fn) => listeners.get(name)?.delete(fn), dispatchEvent: (event) => { for (const fn of listeners.get(event.type) || []) fn(event); } };
const tracks = load('src/data/challengePath.ts');
const nav = load('src/data/pageOrder.ts');
const progress = load('src/lib/progressStore.ts');
const checklist = load('src/components/Checklist.tsx').default;
const stepper = load('src/components/Stepper.tsx').default;
function reset() { store.clear(); tracks.clearUnsavedChallengeTracks?.(); writes = 0; denyWrite = false; states = []; effects = []; cursor = 0; listeners.clear(); }
function render(props) { effects = []; cursor = 0; const tree = checklist(props); for (const effect of effects) effect(); return tree; }
function renderWithoutEffects(props) { effects = []; cursor = 0; return checklist(props); }
function nodes(tree, predicate) { if (!tree || typeof tree !== 'object') return []; const result = predicate(tree) ? [tree] : []; for (const child of [tree.props?.children].flat(Infinity)) result.push(...nodes(child, predicate)); return result; }
function contentText(value) { if (value == null || typeof value === 'boolean') return ''; if (Array.isArray(value)) return value.map(contentText).join(''); if (typeof value === 'object') return contentText(value.props?.children); return String(value); }
test('all four tracks have six coherent stages in both languages; alternatives are not sequential', () => {
 for (const frontend of ['react', 'vue']) for (const backend of ['fastapi', 'hono']) for (const lang of ['ko', 'en']) {
  const choice = { frontend, backend }, path = tracks.getChallengePath(choice);
  assert.equal(path.length, 6);
  for (let i = 0; i < path.length; i++) {
   const result = nav.getNavigation(path[i], lang, choice);
   assert.equal(result.next?.path ?? null, path[i + 1] ?? null);
   assert.equal(result.prev?.path ?? null, path[i - 1] ?? null);
  }
  assert.equal(nav.getNavigation('/start/60min/frontend/react', lang, choice).next.path, `/start/60min/backend/${backend}`);
 }
});
test('reading empty Vue/Hono progress never selects tracks or writes storage', () => {
 reset(); store.set('checklist-60min-frontend-vue', '[]'); store.set('checklist-60min-backend-hono', '[]');
 assert.deepEqual(tracks.getChallengeTracks(), { frontend: 'react', backend: 'fastapi' });
 assert.equal(progress.calculateOverallProgress(), 0); assert.equal(writes, 0);
 tracks.selectChallengeTracks({ frontend: 'vue', backend: 'hono' });
 assert.deepEqual(tracks.getChallengeTracks(), { frontend: 'vue', backend: 'hono' }); assert.equal(writes, 1);
});
test('current step is first unfinished checklist, not a percentage bucket; completion requires selected track', () => {
 reset(); for (const key of tracks.getChallengeStepKeys(tracks.getChallengeTracks())) store.set(`checklist-${key}`, JSON.stringify(Array.from({ length: progress.CHALLENGE_STEPS[key].totalItems }, (_, i) => `item-${i}`)));
 assert.equal(progress.calculateCurrentStep(), 6); assert.equal(progress.calculateOverallProgress(), 100);
 store.set('checklist-60min-step1', '[]'); assert.equal(progress.calculateCurrentStep(), 1);
 tracks.selectChallengeTracks({ frontend: 'vue', backend: 'hono' }); assert.ok(progress.calculateOverallProgress() < 100);
 store.set('checklist-60min-frontend-vue', '{invalid'); assert.equal(progress.calculateCurrentStep(), 1);
});
test('checklist hydration preserves saved progress and performs no writes; click persists', () => {
 reset(); store.set('checklist-60min-frontend-vue', '["a"]');
 const props = { storageKey: '60min-frontend-vue', items: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }] };
 render(props); let tree = render(props); assert.equal(writes, 0); assert.equal(store.get('checklist-60min-frontend-vue'), '["a"]');
 const inputs = nodes(tree, (n) => n.type === 'input'); assert.equal(inputs[0].props.checked, true);
 inputs[1].props.onChange(); assert.deepEqual(JSON.parse(store.get('checklist-60min-frontend-vue')), ['a', 'b']); assert.equal(writes, 1);
});
test('CHECKLIST-QUOTA: a checked item stays visible and announces a failed browser save', () => {
 reset();
 const props = { storageKey: '60min-step1', items: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }] };
 render(props); let tree = render(props);
 denyWrite = true;
 nodes(tree, (n) => n.type === 'input')[0].props.onChange();
 tree = renderWithoutEffects(props);
 assert.equal(nodes(tree, (n) => n.type === 'input')[0].props.checked, true);
 const status = nodes(tree, (n) => n.props?.role === 'status');
 assert.equal(status.length, 1);
 assert.match(contentText(status[0]), /체크는 이 탭에 남아 있지만 브라우저에 저장하지 못했습니다/);
 assert.equal(store.has('checklist-60min-step1'), false);
});
test('KO/EN mission keys merge legacy progress on read and consolidate only after interaction', () => {
 reset(); store.set('checklist-mission-2week-v2', '["a"]'); store.set('checklist-mission-2week-v2-en', '["b"]');
 const props = { storageKey: 'mission-2week-v2', items: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }] };
 render(props); const tree = render(props); assert.equal(writes, 0);
 const inputs = nodes(tree, (n) => n.type === 'input'); assert.ok(inputs.every((input) => input.props.checked)); inputs[0].props.onChange();
 assert.deepEqual(JSON.parse(store.get('checklist-mission-2week-v2')), ['b']); assert.equal(store.has('checklist-mission-2week-v2-en'), false);
 for (const lang of ['', 'en/']) assert.match(readFileSync(`src/pages/${lang}path/mission.astro`, 'utf8'), /storageKey="mission-2week-v2"/);
});
test('static route position never claims earlier checklist steps are completed', () => {
 const pages = [
  'src/pages/start/60min/frontend/react.astro', 'src/pages/start/60min/frontend/vue.astro',
  'src/pages/start/60min/backend/fastapi.astro', 'src/pages/start/60min/backend/hono.astro',
  'src/pages/start/60min/connect/index.astro', 'src/pages/start/60min/deploy/index.astro',
  'src/pages/en/start/60min/frontend/react.astro', 'src/pages/en/start/60min/frontend/vue.astro',
  'src/pages/en/start/60min/backend/fastapi.astro', 'src/pages/en/start/60min/backend/hono.astro',
  'src/pages/en/start/60min/connect/index.astro', 'src/pages/en/start/60min/deploy/index.astro',
 ];
 for (const page of pages) {
  const source = readFileSync(page, 'utf8');
  assert.match(source, /status: 'previous' as const/, `${page} marks earlier path position`);
  assert.doesNotMatch(source, /status: 'completed' as const/, `${page} must not imply actual completion`);
 }
 const steps = [{ label: 'Preparation', status: 'previous' }, { label: 'Frontend', status: 'current' }, { label: 'Backend', status: 'upcoming' }];
 const staticView = stepper({ steps, locale: 'en' });
 assert.match(contentText(staticView), /Earlier in path: Preparation/);
 assert.match(contentText(staticView), /Current: Frontend/);
 assert.equal(nodes(staticView, (node) => node.type === 'svg' && node.props.className === 'w-4 h-4').length, 0, 'static prior route position has no completion checkmark');
 const evidenceView = stepper({ steps, currentStep: 1, locale: 'en' });
 assert.match(contentText(evidenceView), /Done: Preparation/);
 assert.equal(nodes(evidenceView, (node) => node.type === 'svg' && node.props.className === 'w-4 h-4').length, 1, 'evidence-backed completed step keeps its checkmark');
});
test('reset clears explicit selection and checklist progress', () => {
 reset(); tracks.selectChallengeTracks({ frontend: 'vue', backend: 'hono' }); store.set('checklist-60min-step1', '["a"]'); progress.resetProgress();
 assert.equal(store.size, 0);
});

test('track selection survives a failed save in this tab, emits an update, and reset clears it', () => {
 reset(); tracks.selectChallengeTracks({ frontend: 'react', backend: 'fastapi' });
 denyWrite = true;
 let notifications = 0; window.addEventListener('60min-progress-change', () => notifications++);
 assert.doesNotThrow(() => assert.equal(tracks.selectChallengeTracks({ frontend: 'vue', backend: 'hono' }), false));
 assert.equal(notifications, 1);
 assert.deepEqual(tracks.getChallengeTracks(), { frontend: 'vue', backend: 'hono' });
 assert.equal(nav.getNavigation('/path/60min', 'ko', tracks.getChallengeTracks()).next.path, '/start/60min/frontend/vue');
 assert.deepEqual(JSON.parse(store.get(tracks.TRACK_STORAGE_KEY)), { frontend: 'react', backend: 'fastapi' });
 progress.resetProgress();
 assert.deepEqual(tracks.getChallengeTracks(), { frontend: 'react', backend: 'fastapi' });
});

test('mounted checklist updates after reset and cannot restore stale checks on next click', () => {
 reset(); store.set('checklist-60min-step1', '["a"]');
 const props = { storageKey: '60min-step1', items: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }] };
 render(props); progress.resetProgress();
 const tree = render(props); const inputs = nodes(tree, (n) => n.type === 'input'); assert.ok(inputs.every((input) => !input.props.checked));
 inputs[1].props.onChange(); assert.deepEqual(JSON.parse(store.get('checklist-60min-step1')), ['b']);
});

test('Map guided prerequisites require actual preceding IDs; unrelated, duplicate or unknown completions cannot unlock', () => {
 reset(); const key = 'choorai-map-completed-nodes';
 for (const ids of [['git', 'auth'], ['dns', 'dns'], ['unknown-a', 'unknown-b'], ['dns', 'auth']]) {
  store.set(key, JSON.stringify(ids)); assert.equal(progress.getMapNodeStatus('backend', 3, 'guided'), 'locked');
 }
 store.set(key, JSON.stringify(['dns', 'frontend'])); assert.equal(progress.getMapNodeStatus('backend', 3, 'guided'), 'current');
 const core = load('src/data/mapNodes.ts').MAP_NODES;
 for (const node of core) {
  store.set(key, JSON.stringify(core.filter((n) => n.order < node.order).map((n) => n.id)));
  assert.equal(progress.getMapNodeStatus(node.id, node.order, 'guided'), 'current');
  if (node.order > 1) { store.set(key, JSON.stringify(core.filter((n) => n.order < node.order - 1).map((n) => n.id))); assert.equal(progress.getMapNodeStatus(node.id, node.order, 'guided'), 'locked'); }
 }
});
test('Map explore/completed states survive; malformed synthetic data is handled without writing learner records', () => {
 reset(); const key = 'choorai-map-completed-nodes';
 for (const saved of ['{bad', '{}', 'null', '42']) {
  store.set(key, saved); assert.equal(progress.getMapNodeStatus('backend', 3, 'guided'), 'locked'); assert.equal(progress.getMapNodeStatus('backend', 3, 'explore'), 'available');
 }
 store.set(key, JSON.stringify(['backend', 'backend', 42])); assert.equal(progress.getMapNodeStatus('backend', 3, 'guided'), 'completed'); assert.deepEqual(progress.getCompletedMapNodes(), ['backend']);
 assert.equal(store.get(key), '["backend","backend",42]'); assert.equal(writes, 0);
});

test('KO/EN React/Vue lesson commands pin the verified Tailwind v3 version for init -p', () => {
 for (const lang of ['', 'en/']) for (const framework of ['react', 'vue']) {
  const source = readFileSync(`src/pages/${lang}start/60min/frontend/${framework}.astro`, 'utf8');
  assert.match(source, /npm install -D tailwindcss@3\.4\.19 postcss autoprefixer/);
  assert.match(source, /npx tailwindcss init -p/);
 }
});

test('ROUTE-404: the corrected beginner links have real KO/EN source routes', () => {
 const links = [
  ['src/pages/map/tools.astro', '/map/', 'src/pages/map/index.astro'],
  ['src/pages/en/map/tools.astro', '/en/map/', 'src/pages/en/map/index.astro'],
  ['src/pages/map/auth.astro', '/baas/supabase', 'src/pages/baas/supabase.astro'],
  ['src/pages/en/map/auth.astro', '/en/baas/supabase', 'src/pages/en/baas/supabase.astro'],
  ['src/pages/path/mission.astro', '/path/60min', 'src/pages/path/60min.astro'],
  ['src/pages/en/path/mission.astro', '/en/path/60min', 'src/pages/en/path/60min.astro'],
  ['src/pages/en/map/env-basics.astro', '/en/fix/env', 'src/pages/en/fix/env.astro'],
 ];
 for (const [source, target, page] of links) {
  assert.ok(existsSync(page), `${target} must have a real Astro page`);
  assert.match(readFileSync(source, 'utf8'), new RegExp(`href(?:=|:\\s*)["']${target.replaceAll('/', '\\/')}["']`), `${source} links to ${target}`);
 }
});

function luminance(hex) {
 const rgb = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
 return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}
function contrastRatio(foreground, background) {
 const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
 return (values[0] + 0.05) / (values[1] + 0.05);
}
function blend(foreground, background, alpha) {
 const channels = [1, 3, 5].map((index) => Math.round(parseInt(foreground.slice(index, index + 2), 16) * alpha + parseInt(background.slice(index, index + 2), 16) * (1 - alpha)).toString(16).padStart(2, '0'));
 return `#${channels.join('')}`;
}
test('A11Y-01: the reported copy, runtime, error, and warning text colors meet 4.5:1', () => {
 const prompt = readFileSync('src/components/PromptBox.tsx', 'utf8');
 const error = readFileSync('src/components/ErrorCard.tsx', 'utf8');
 const callout = readFileSync('src/components/Callout.tsx', 'utf8');
 const tailwind = readFileSync('tailwind.config.mjs', 'utf8');
 assert.match(prompt, /bg-purple-700 hover:bg-purple-800[\s\S]*?text-white/);
 for (const file of ['src/pages/path/60min.astro', 'src/pages/en/path/60min.astro', 'src/pages/map/tools.astro', 'src/pages/en/map/tools.astro']) {
  assert.match(readFileSync(file, 'utf8'), /bg-green-700 hover:bg-green-800 text-white/);
 }
 assert.match(error, /<h3 className="text-error-light/);
 assert.match(error, /textClass: 'text-warning-light'/);
 assert.match(callout, /titleClass: 'text-warning-light'/);
 assert.match(tailwind, /light: '#E3B341'/);
 assert.match(tailwind, /light: '#F85149'/);
 assert.ok(contrastRatio('#ffffff', '#7e22ce') >= 4.5);
 assert.ok(contrastRatio('#ffffff', '#15803d') >= 4.5);
 assert.ok(contrastRatio('#F85149', '#161B22') >= 4.5);
 assert.ok(contrastRatio('#E3B341', blend('#9E6A03', '#161B22', 0.2)) >= 4.5);
});
