// @ts-nocheck
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const nativeRequire = createRequire(import.meta.url);
const cache = new Map();
const storage = new Map();
let writeCount = 0;
let removeCount = 0;
let listeners = new Map();
let downloads = [];
let activeHooks;
const NativeURL = globalThis.URL;

function createHooks() {
  const slots = [], refs = [], effectSlots = [];
  let cursor = 0, pending = [], dirty = false;
  return {
    begin() { cursor = 0; pending = []; dirty = false; },
    useState(initial) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial;
      const owner = this;
      return [slots[i], (value) => { const next = typeof value === 'function' ? value(slots[i]) : value; if (!Object.is(slots[i], next)) { slots[i] = next; owner.dirty = true; } }];
    },
    useRef(initial) { const i = cursor++; if (!(i in refs)) refs[i] = { current: initial }; return refs[i]; },
    useEffect(fn, deps) {
      const i = cursor++;
      const old = effectSlots[i];
      const changed = !old || !deps || deps.length !== old.deps?.length || deps.some((value, index) => !Object.is(value, old.deps[index]));
      if (changed) pending.push({ i, fn, deps });
    },
    flush() { const list = pending; pending = []; for (const item of list) { item.fn(); effectSlots[item.i] = { deps: item.deps }; } },
    get hasPending() { return pending.length > 0; },
  };
}
const reactMock = { useState: (...args) => activeHooks.useState(...args), useRef: (...args) => activeHooks.useRef(...args), useEffect: (...args) => activeHooks.useEffect(...args) };
const jsxRuntime = { jsx: (type, props, key) => ({ type, props: { ...props, ...(key === undefined ? {} : { key }) } }), jsxs: (type, props, key) => ({ type, props: { ...props, ...(key === undefined ? {} : { key }) } }), Fragment: Symbol('Fragment') };
function load(file) {
  file = resolve(file);
  if (file.endsWith('.json')) return JSON.parse(readFileSync(file, 'utf8'));
  if (cache.has(file)) return cache.get(file).exports;
  const mod = { exports: {} }; cache.set(file, mod);
  const output = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, resolveJsonModule: true } }).outputText;
  new Function('require', 'module', 'exports', output)((id) => id === 'react' ? reactMock : id === 'react/jsx-runtime' ? jsxRuntime : id.startsWith('.') ? load(resolve(dirname(file), id.endsWith('.json') || /\.(tsx?|jsx?)$/.test(id) ? id : `${id}.ts`)) : nativeRequire(id), mod, mod.exports);
  return mod.exports;
}
const Studio = load('src/components/ProjectStudio.tsx').default;
const progress = load('src/lib/learning/projectProgress.ts');
const course = load('src/data/projects/memoPath.json');
const fixed = course.startingFile.contents.replace('note is not empty', 'note is empty');
const varied = `${fixed}\n\non input:\n  show remaining characters`;
function setupWindow({ denyGet = false, denySet = false, search = '' } = {}) {
  storage.clear(); writeCount = 0; removeCount = 0; listeners = new Map(); downloads = [];
  const localStorage = {
    getItem(key) { if (denyGet) throw new Error('synthetic storage denied'); return storage.get(key) ?? null; },
    setItem(key, value) { writeCount++; if (denySet) throw new Error('synthetic storage denied'); storage.set(key, value); },
    removeItem(key) { removeCount++; if (denyGet || denySet) throw new Error('synthetic storage denied'); storage.delete(key); },
  };
  globalThis.window = {
    localStorage, location: { search, pathname: '/project/memo/', href: `http://127.0.0.1/project/memo/${search}` },
    history: { state: null, pushState(state, _title, url) { this.state = state; const i = String(url).indexOf('?'); window.location.search = i >= 0 ? String(url).slice(i) : ''; }, replaceState(state, _title, url) { this.state = state; if (typeof url === 'string') { const i = url.indexOf('?'); window.location.search = i >= 0 ? url.slice(i) : ''; } } },
    addEventListener(name, fn) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); },
    removeEventListener(name, fn) { listeners.get(name)?.delete(fn); },
    dispatchEvent(event) { for (const fn of listeners.get(event.type) || []) fn(event); return true; },
    setTimeout(fn) { fn(); return 1; },
  };
  globalThis.document = { createElement() { return { click() { downloads.push(this); } }; } };
  globalThis.URL = NativeURL;
  globalThis.URL.createObjectURL = () => 'blob:test';
  globalThis.URL.revokeObjectURL = () => {};
  globalThis.Event = class { constructor(type) { this.type = type; } };
}
function text(tree) {
  if (typeof tree === 'string' || typeof tree === 'number') return String(tree);
  if (!tree || typeof tree !== 'object') return '';
  return [tree.props?.children].flat(Infinity).map(text).join(' ');
}
function nodes(tree, predicate) {
  if (!tree || typeof tree !== 'object') return [];
  const found = predicate(tree) ? [tree] : [];
  for (const child of [tree.props?.children].flat(Infinity)) found.push(...nodes(child, predicate));
  return found;
}
function render(locale = 'ko') {
  activeHooks ||= createHooks();
  let tree;
  for (let i = 0; i < 12; i++) {
    activeHooks.begin(); tree = Studio({ locale });
    const hadEffects = activeHooks.hasPending; activeHooks.flush();
    if (!hadEffects) return tree;
  }
  throw new Error(`React mock did not settle (pending=${activeHooks.hasPending}, dirty=${activeHooks.dirty})`);
}
function button(tree, label) {
  const matches = nodes(tree, (node) => node.type === 'button' && text(node).trim() === label);
  assert.equal(matches.length, 1, `expected one button labelled ${label}, got ${matches.length}`);
  return matches[0];
}
function buttonContaining(tree, includes) {
  const matches = nodes(tree, (node) => node.type === 'button' && text(node).trim().includes(includes));
  assert.equal(matches.length, 1, `expected one button containing ${includes}, got ${matches.length}`);
  return matches[0];
}
function click(tree, includes) {
  const target = button(tree, includes);
  assert.notEqual(target.props.disabled, true, `button unexpectedly disabled: ${includes}`);
  target.props.onClick(); return render();
}
function clickContaining(tree, includes) {
  const target = buttonContaining(tree, includes);
  assert.notEqual(target.props.disabled, true, `button unexpectedly disabled: ${includes}`);
  target.props.onClick(); return render();
}
function emitStorage(key) {
  for (const listener of listeners.get('storage') || []) listener({ type: 'storage', key });
  return render();
}
function editor(tree) { return nodes(tree, (node) => node.type === 'textarea' && node.props.id === 'memo-program-editor')[0]; }
function preview(tree) { return nodes(tree, (node) => typeof node.type === 'function' && node.type.name === 'Preview')[0]; }
function progressValue(tree) { return nodes(tree, (node) => node.props.role === 'progressbar')[0].props['aria-valuenow']; }
function withPreview(node, manager, callback) {
  const previous = activeHooks; activeHooks = manager; manager.begin();
  let tree = node.type(node.props);
  const hadEffects = manager.hasPending; manager.flush();
  if (hadEffects) { manager.begin(); tree = node.type(node.props); manager.flush(); }
  callback(tree); activeHooks = previous;
}
function mountedPreview(node, mounted) {
  if (mounted.key !== node.props.key) { mounted.key = node.props.key; mounted.hooks = createHooks(); }
  let tree;
  withPreview(node, mounted.hooks, (result) => { tree = result; });
  return tree;
}
function previewInput(tree) { return nodes(tree, (n) => n.type === 'input' && n.props.id === 'preview-note-input')[0]; }
function completeMemoRunWith100Notes() {
  let read = progress.readLearningProgress(course);
  read = progress.recordVerification(read, 'run-starter', true, course);
  read = progress.updateProgramDraft(read, varied, course);
  read = progress.recordVerification(read, 'fix-guard', true, course);
  read = progress.recordVerification(read, 'add-counter', true, course);
  read.run.workspace.notes = Array.from({ length: 100 }, (_, i) => `note-${i}`);
  storage.set(progress.LEARNING_PROGRESS_KEY, JSON.stringify({ schemaVersion: 1, paths: { [`${course.id}@${course.version}`]: read.run } }));
}
beforeEach(() => { setupWindow(); activeHooks = createHooks(); });

test('component requires running the buggy starter, editing its condition, and running both behavior cases', () => {
  let tree = render();
  assert.equal(progressValue(tree), 0);
  assert.equal(button(tree, '시작 코드 실행').props.disabled, false);
  tree = click(tree, '시작 코드 실행');
  assert.equal(progressValue(tree), 33);
  assert.match(text(tree), /시작 코드의 버그를 확인/);
  tree = clickContaining(tree, '빈 메모 조건 고치기');
  assert.ok(editor(tree)); assert.equal(editor(tree).props.disabled, false);
  editor(tree).props.onChange({ target: { value: fixed } });
  tree = render();
  assert.equal(progressValue(tree), 33);
  tree = click(tree, '동작 검사 실행');
  assert.equal(progressValue(tree), 67);
  assert.match(text(tree), /두 실제 실행 검사가 통과/);
});

test('feature variation adds an input handler and editing after a code change remains possible until rerun', () => {
  let tree = render();
  tree = click(tree, '시작 코드 실행'); tree = clickContaining(tree, '빈 메모 조건 고치기');
  editor(tree).props.onChange({ target: { value: fixed } });
  tree = render(); tree = click(tree, '동작 검사 실행');
  tree = clickContaining(tree, '입력 글자 수 기능 추가하기');
  assert.equal(editor(tree).props.disabled, false);
  editor(tree).props.onChange({ target: { value: varied } });
  tree = render();
  assert.equal(progressValue(tree), 33);
  assert.equal(editor(tree).props.disabled, false);
  tree = click(tree, '기능 검사 실행');
  assert.equal(progressValue(tree), 100);
  assert.match(text(tree), /세 가지 코드 실행 과제를 모두 통과/);
});

test('changing the note limit to 5 fails the feature check and cannot mark the lesson complete', () => {
  let tree = render();
  tree = click(tree, '시작 코드 실행'); tree = clickContaining(tree, '빈 메모 조건 고치기');
  editor(tree).props.onChange({ target: { value: fixed } });
  tree = render(); tree = click(tree, '동작 검사 실행');
  tree = clickContaining(tree, '입력 글자 수 기능 추가하기');
  editor(tree).props.onChange({ target: { value: varied.replace('note_limit: 160', 'note_limit: 5') } });
  tree = render(); tree = click(tree, '기능 검사 실행');
  assert.equal(progressValue(tree), 67);
  assert.match(text(tree), /기능 검사에 실패/);
  assert.doesNotMatch(text(tree), /세 가지 코드 실행 과제를 모두 통과/);
  editor(tree).props.onChange({ target: { value: varied } });
  tree = render(); tree = click(tree, '기능 검사 실행');
  assert.equal(progressValue(tree), 100);
});

test('101st note is rejected without clearing input, showing success, writing, or changing verification', () => {
  completeMemoRunWith100Notes();
  let tree = render(); const view = preview(tree); assert.ok(view);
  const childHooks = createHooks(); let childTree;
  withPreview(view, childHooks, (result) => { childTree = result; });
  let input = nodes(childTree, (n) => n.type === 'input' && n.props.id === 'preview-note-input')[0];
  input.props.onChange({ target: { value: '101st note' } });
  withPreview(view, childHooks, (result) => { childTree = result; });
  const before = storage.get(progress.LEARNING_PROGRESS_KEY);
  withPreview(view, childHooks, (result) => { nodes(result, (n) => n.type === 'form')[0].props.onSubmit({ preventDefault() {} }); });
  tree = render();
  withPreview(preview(tree), childHooks, (result) => { childTree = result; });
  input = nodes(childTree, (n) => n.type === 'input' && n.props.id === 'preview-note-input')[0];
  const current = JSON.parse(storage.get(progress.LEARNING_PROGRESS_KEY)).paths[`${course.id}@${course.version}`];
  assert.equal(current.workspace.notes.length, 100);
  assert.equal(current.evidence['add-counter'].verifiedAt !== undefined, true);
  assert.equal(input.props.value, '101st note', 'rejected text remains available for recovery');
  assert.equal(storage.get(progress.LEARNING_PROGRESS_KEY), before, 'rejection performs no write');
  assert.match(text(tree), /메모는 100개까지 보관/);
  assert.doesNotMatch(text(tree), /실행 코드가 메모를 목록에 추가했습니다/);
});

test('cancel keeps rejected preview input and state; confirmed reset clears them all', () => {
  completeMemoRunWith100Notes();
  let tree = render();
  assert.equal(progressValue(tree), 100);
  const mounted = { key: Symbol('unmounted'), hooks: createHooks() };
  let childTree = mountedPreview(preview(tree), mounted);
  previewInput(childTree).props.onChange({ target: { value: '101st note' } });
  childTree = mountedPreview(preview(tree), mounted);
  nodes(childTree, (n) => n.type === 'form')[0].props.onSubmit({ preventDefault() {} });
  tree = render(); childTree = mountedPreview(preview(tree), mounted);
  assert.equal(previewInput(childTree).props.value, '101st note');
  assert.match(text(tree), /메모는 100개까지 보관/);
  const before = storage.get(progress.LEARNING_PROGRESS_KEY);

  tree = click(tree, '이 프로젝트 연습 초기화');
  tree = click(tree, '계속하기');
  childTree = mountedPreview(preview(tree), mounted);
  assert.equal(previewInput(childTree).props.value, '101st note');
  assert.equal(progressValue(tree), 100);
  assert.equal(storage.get(progress.LEARNING_PROGRESS_KEY), before);

  tree = click(tree, '이 프로젝트 연습 초기화');
  tree = click(tree, '이 연습 초기화');
  childTree = mountedPreview(preview(tree), mounted);
  assert.equal(previewInput(childTree).props.value, '');
  assert.equal(progressValue(tree), 0);
  assert.equal(editor(tree), undefined);
  assert.equal(storage.has(progress.LEARNING_PROGRESS_KEY), true);
  const resetRun = JSON.parse(storage.get(progress.LEARNING_PROGRESS_KEY)).paths[`${course.id}@${course.version}`];
  assert.equal(resetRun.workspace.program, course.startingFile.contents);
  assert.deepEqual(resetRun.workspace.notes, []);
});

test('action code example visibly preserves its line break and two-space indentation in both languages', () => {
  for (const locale of ['ko', 'en']) {
    setupWindow({ search: '?step=add-counter' }); activeHooks = createHooks();
    const tree = render(locale);
    const example = nodes(tree, (node) => {
      if (!['p', 'pre', 'code'].includes(node.type)) return false;
      return text(node).includes('on input:\n  show remaining characters');
    });
    assert.ok(example.length, `${locale}: expected the actual two-line code example`);
    assert.ok(example.some((node) => node.type === 'pre' || /whitespace-(pre-wrap|break-spaces)/.test(node.props.className || '') || ['pre', 'pre-wrap', 'break-spaces'].includes(node.props.style?.whiteSpace)), `${locale}: rendered element must preserve spaces and line breaks`);
  }
});

test('storage denial keeps editing, running, checks, and export available while browser save is disabled', () => {
  setupWindow({ denyGet: true }); activeHooks = createHooks();
  let tree = render();
  assert.match(text(tree), /이 탭을 열어 둔 동안 편집·실행·검사는 계속/);
  tree = click(tree, '시작 코드 실행'); assert.equal(progressValue(tree), 33);
  tree = clickContaining(tree, '빈 메모 조건 고치기');
  assert.ok(editor(tree)); assert.equal(editor(tree).props.disabled, false);
  editor(tree).props.onChange({ target: { value: fixed } });
  tree = render(); tree = click(tree, '동작 검사 실행'); assert.equal(progressValue(tree), 67);
  assert.equal(button(tree, '브라우저 저장 불가').props.disabled, true);
  assert.equal(button(tree, '코드와 메모 내려받기').props.disabled, false);
  tree = click(tree, '코드와 메모 내려받기');
  assert.equal(downloads.length, 1);
  assert.equal(downloads[0].download, 'memo-project.json');
  assert.equal(writeCount, 0); assert.equal(removeCount, 0);
});

test('direct entry to a later step does not bypass its required execution checks', () => {
  setupWindow({ search: '?step=add-counter' }); activeHooks = createHooks();
  const tree = render();
  assert.ok(editor(tree), 'the requested feature step is shown on direct entry');
  assert.equal(progressValue(tree), 0);
  assert.equal(editor(tree).props.disabled, true);
  assert.match(text(tree), /먼저 조건 수정 검사를 통과하세요/);
  assert.equal(button(tree, '기능 검사 실행').props.disabled, true);
  const saved = JSON.parse(storage.get(progress.LEARNING_PROGRESS_KEY));
  const run = saved.paths[`${course.id}@${course.version}`];
  assert.equal(run.evidence['add-counter'].verifiedAt, undefined);
  assert.equal(run.evidence['fix-guard'], undefined);
  assert.equal(run.evidence['run-starter'], undefined);
});

test('PERSIST-01: a saved-output event cannot replace this tab’s unsaved editor draft', () => {
  let tree = render();
  tree = click(tree, '시작 코드 실행');
  tree = clickContaining(tree, '빈 메모 조건 고치기');
  const localDraft = `${course.startingFile.contents}\n# this edit remains in the open tab`;
  editor(tree).props.onChange({ target: { value: localDraft } });
  tree = render();
  assert.equal(editor(tree).props.value, localDraft);

  storage.set(progress.PROJECT_OUTPUT_KEY, '{}');
  tree = emitStorage(progress.PROJECT_OUTPUT_KEY);
  assert.equal(editor(tree).props.value, localDraft);
  assert.match(text(tree), /다른 탭에서 저장한 메모 파일을 읽지 못했습니다/);
});

test('PERSIST-02: a remote current-step change updates the URL and step while preserving a local draft', () => {
  let tree = render();
  tree = click(tree, '시작 코드 실행');
  tree = clickContaining(tree, '빈 메모 조건 고치기');
  const localDraft = fixed.replace('note is empty', 'note is empty\n# local tab draft');
  editor(tree).props.onChange({ target: { value: localDraft } });
  tree = render();

  const remoteProgress = JSON.parse(storage.get(progress.LEARNING_PROGRESS_KEY));
  const pathKey = `${course.id}@${course.version}`;
  remoteProgress.paths[pathKey] = {
    ...remoteProgress.paths[pathKey],
    currentStepId: 'add-counter',
    evidence: { ...remoteProgress.paths[pathKey].evidence, 'add-counter': { attempts: 0, visitedAt: '2026-10-05T00:00:00.000Z' } },
  };
  storage.set(progress.LEARNING_PROGRESS_KEY, JSON.stringify(remoteProgress));
  tree = emitStorage(progress.LEARNING_PROGRESS_KEY);

  assert.equal(window.location.search, '?step=add-counter');
  assert.equal(nodes(tree, (node) => node.props?.['aria-current'] === 'step').length, 1);
  assert.equal(text(nodes(tree, (node) => node.props?.['aria-current'] === 'step')[0]).includes(course.steps[2].title.ko), true);
  assert.equal(editor(tree).props.value, localDraft, 'the local code draft survives remote navigation');
  const stored = JSON.parse(storage.get(progress.LEARNING_PROGRESS_KEY)).paths[`${course.id}@${course.version}`];
  assert.equal(stored.currentStepId, 'add-counter');
});


test('VISIT-DRAFT: two remote step visits preserve an unsaved code draft until explicit persistence', () => {
  let tree = render();
  tree = click(tree, '시작 코드 실행');
  tree = clickContaining(tree, '빈 메모 조건 고치기');
  editor(tree).props.onChange({ target: { value: fixed } });
  tree = render();
  const key = `${course.id}@${course.version}`;
  for (const step of ['add-counter', 'fix-guard']) {
    const remote = JSON.parse(storage.get(progress.LEARNING_PROGRESS_KEY));
    remote.paths[key].currentStepId = step;
    storage.set(progress.LEARNING_PROGRESS_KEY, JSON.stringify(remote));
    tree = emitStorage(progress.LEARNING_PROGRESS_KEY);
    assert.equal(editor(tree).props.value, fixed, `draft remains after ${step}`);
    assert.equal(window.location.search, `?step=${step}`);
    assert.equal(JSON.parse(storage.get(progress.LEARNING_PROGRESS_KEY)).paths[key].workspace.program, course.startingFile.contents, 'reading metadata does not save the draft');
  }
  editor(tree).props.onBlur();
  tree = render();
  assert.equal(editor(tree).props.value, fixed);
  assert.equal(JSON.parse(storage.get(progress.LEARNING_PROGRESS_KEY)).paths[key].workspace.program, fixed, 'explicit persistence acknowledges the draft');
});
