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
let writes = 0;
let removals = 0;
const normalGet = (key) => storage.get(key) ?? null;
const normalSet = (key, value) => { writes++; storage.set(key, value); };
const normalRemove = (key) => { removals++; storage.delete(key); };
globalThis.window = { localStorage: { getItem: normalGet, setItem: normalSet, removeItem: normalRemove }, dispatchEvent: () => true };
globalThis.localStorage = globalThis.window.localStorage;
globalThis.Event = class { constructor(type) { this.type = type; } };

function load(file) {
  file = resolve(file);
  if (file.endsWith('.json')) return JSON.parse(readFileSync(file, 'utf8'));
  if (cache.has(file)) return cache.get(file).exports;
  const mod = { exports: {} }; cache.set(file, mod);
  const output = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  new Function('require', 'module', 'exports', output)((id) => id.startsWith('.') ? load(resolve(dirname(file), id.endsWith('.json') || /\.(tsx?|jsx?)$/.test(id) ? id : `${id}.ts`)) : nativeRequire(id), mod, mod.exports);
  return mod.exports;
}
const course = load('src/data/projects/memoPath.json');
const progress = load('src/lib/learning/projectProgress.ts');
const program = load('src/lib/learning/memoProgram.ts');
const completion = load('src/lib/learning/challengeCompletion.ts');
const otherPath = { id: 'other', version: 1, startingFile: { starterTitle: 'Other', contents: 'starter' }, steps: [{ id: 'one' }] };
const projectKey = `${course.id}@${course.version}`;
const legacyKeys = ['checklist-60min-step1', 'checklist-map-basic', 'choorai-map-completed-nodes', 'choorai-sql-practice-v1'];
const fixed = course.startingFile.contents.replace('note is not empty', 'note is empty');
const varied = `${fixed}\n\non input:\n  show remaining characters`;

beforeEach(() => {
  storage.clear(); writes = 0; removals = 0;
  window.localStorage.getItem = normalGet;
  window.localStorage.setItem = normalSet;
  window.localStorage.removeItem = normalRemove;
});

test('read is non-writing and creates a versioned starter program; user action persists only this course', () => {
  for (const key of legacyKeys) storage.set(key, 'preserve');
  const first = progress.readLearningProgress(course);
  assert.equal(writes, 0);
  assert.equal(first.run.workspace.program, course.startingFile.contents);
  assert.equal(first.run.evidence['run-starter'], undefined);
  const opened = progress.visitStep(first, 'fix-guard', course);
  assert.equal(writes, 1);
  assert.equal(opened.run.currentStepId, 'fix-guard');
  for (const key of legacyKeys) assert.equal(storage.get(key), 'preserve');
});

test('starter code has an observed bug; editing the condition and running both cases verifies behavior', () => {
  const starterObservation = program.executeMemoProgram(course.startingFile.contents, 'A note', []);
  assert.equal(starterObservation.action, 'show-message');
  assert.equal(program.checkMemoGuard(course.startingFile.contents).passed, false);
  let read = progress.readLearningProgress(course);
  read = progress.recordVerification(read, 'run-starter', true, course);
  read = progress.draftProgram(read, fixed, course);
  assert.equal(read.run.workspace.program, fixed);
  assert.equal(read.run.evidence['fix-guard'], undefined);
  const checks = program.checkMemoGuard(read.run.workspace.program);
  assert.deepEqual(checks.checks.map((item) => item.passed), [true, true]);
  read = progress.persistCurrentProgress(read);
  read = progress.recordVerification(read, 'fix-guard', checks.passed, course);
  assert.equal(read.run.evidence['fix-guard'].verifiedAt !== undefined, true);
});

test('adding a new input handler changes executed output and source edits invalidate all dependent checks', () => {
  let read = progress.readLearningProgress(course);
  read = progress.recordVerification(read, 'run-starter', true, course);
  read = progress.updateProgramDraft(read, fixed, course);
  read = progress.recordVerification(read, 'fix-guard', true, course);
  const originalCounter = program.checkCounterVariation(fixed);
  assert.equal(originalCounter.passed, false);
  assert.equal(program.runMemoInputHandler(fixed, '').ok, false);
  const variation = progress.draftProgram(read, varied, course);
  assert.equal(variation.run.evidence['fix-guard'].verifiedAt, undefined);
  assert.equal(variation.run.evidence['add-counter'], undefined);
  const guard = program.checkMemoGuard(variation.run.workspace.program);
  const feature = program.checkCounterVariation(variation.run.workspace.program);
  assert.equal(guard.passed, true);
  assert.equal(feature.passed, true);
  assert.deepEqual(feature.checks.map((item) => item.passed), [true, true]);
  assert.deepEqual(program.runMemoInputHandler(varied, ''), { ok: true, remaining: 160, limit: 160 });
  assert.deepEqual(program.runMemoInputHandler(varied, 'a'), { ok: true, remaining: 159, limit: 160 });
  read = progress.recordVerification(variation, 'fix-guard', true, course);
  read = progress.recordVerification(read, 'add-counter', true, course);
  assert.equal(course.completion.required.every((id) => read.run.evidence[id]?.verifiedAt), true);
});

test('counter verification uses the lesson’s fixed 160/159 outputs, not the submitted note_limit', () => {
  const expected = course.steps.find((step) => step.id === 'add-counter').expected;
  assert.match(expected.ko, /160.*159/);
  assert.match(expected.en, /160.*159/);
  assert.equal(program.checkCounterVariation(varied).passed, true);
  for (const limit of [1, 5, 159]) {
    const changed = varied.replace('note_limit: 160', `note_limit: ${limit}`);
    assert.equal(program.parseMemoProgram(changed).ok, true, `${limit} remains valid DSL syntax`);
    const result = program.checkCounterVariation(changed);
    assert.equal(result.passed, false, `${limit} must not satisfy the 160/159 lesson contract`);
    assert.ok(result.checks.some((check) => !check.passed));
  }
  const aboveLimit = varied.replace('note_limit: 160', 'note_limit: 161');
  assert.equal(program.parseMemoProgram(aboveLimit).ok, false);
});

test('verification failures clear that step and all dependent passes', () => {
  let read = progress.readLearningProgress(course);
  read = progress.recordVerification(read, 'run-starter', true, course);
  read = progress.recordVerification(read, 'fix-guard', true, course);
  read = progress.recordVerification(read, 'add-counter', true, course);
  assert.ok(read.run.evidence['add-counter'].verifiedAt);
  read = progress.recordVerification(read, 'fix-guard', false, course);
  assert.equal(read.run.evidence['fix-guard'].verifiedAt, undefined);
  assert.equal(read.run.evidence['add-counter'].verifiedAt, undefined);
});

test('the interpreter accepts only the fixed DSL, and user text remains data', () => {
  assert.equal(program.parseMemoProgram(fixed).ok, true);
  assert.equal(program.parseMemoProgram(`${fixed}\nrun: alert(1)`).ok, false);
  assert.equal(program.parseMemoProgram(fixed.replace('show empty_note_error', 'show <script>alert(1)</script>')).ok, false);
  assert.doesNotMatch(readFileSync('src/lib/learning/memoProgram.ts', 'utf8'), /\beval\s*\(|new Function\s*\(/);
  const markup = '</textarea><script>alert(1)</script>';
  const output = program.executeMemoProgram(fixed, markup, []);
  assert.equal(output.action, 'add-note');
  assert.equal(output.note, markup);
  const exported = JSON.parse(progress.createProgramExport(fixed, [markup]).content);
  assert.equal(exported.program, fixed);
  assert.equal(exported.notes[0], markup);
});

test('note cap reports rejection without changing notes or recording an action', () => {
  let read = progress.readLearningProgress(course);
  read = { ...read, run: { ...read.run, workspace: { ...read.run.workspace, notes: Array.from({ length: 100 }, (_, i) => `note-${i}`) } } };
  const before = read;
  const result = progress.appendProgramNote(read, '101st note');
  assert.equal(result.added, false);
  assert.equal(result.reason, 'limit');
  assert.equal(result.state, before);
  assert.equal(result.state.run.workspace.notes.length, 100);
  assert.equal(result.state.run.evidence['add-counter'], undefined);
  const userInputResult = progress.tryAddDraftNote(read, '101st note');
  assert.equal(userInputResult.reason, 'limit');
  assert.equal(userInputResult.state, before);
});

test('storage read denial falls back to editable in-memory state and leaves storage untouched', () => {
  window.localStorage.getItem = () => { throw new Error('denied'); };
  const blocked = progress.readLearningProgress(course);
  assert.equal(blocked.blocked, true);
  assert.equal(blocked.storageIssue, 'unavailable');
  let session = progress.visitStep(blocked, 'run-starter', course);
  session = progress.draftProgram(session, fixed, course);
  session = progress.recordVerification(session, 'run-starter', true, course);
  assert.equal(session.run.workspace.program, fixed);
  assert.equal(session.run.evidence['run-starter'].verifiedAt !== undefined, true);
  assert.equal(session.blocked, true);
  assert.equal(writes, 0);
  assert.equal(removals, 0);
  const reset = progress.resetLearningProgressInSession(session, course);
  assert.equal(reset.run.workspace.program, course.startingFile.contents);
  assert.deepEqual(reset.run.evidence, {});
  assert.equal(writes, 0);
  assert.equal(removals, 0);
});

test('storage write denial keeps the attempted edit and later checks in memory without retrying writes', () => {
  window.localStorage.setItem = () => { writes++; throw new Error('quota denied'); };
  let read = progress.readLearningProgress(course);
  read = progress.visitStep(read, 'run-starter', course);
  assert.equal(read.blocked, true);
  assert.equal(read.storageIssue, 'unavailable');
  read = progress.draftProgram(read, fixed, course);
  read = progress.recordVerification(read, 'run-starter', true, course);
  assert.equal(read.run.workspace.program, fixed);
  assert.equal(read.run.evidence['run-starter'].verifiedAt !== undefined, true);
  assert.equal(writes, 1);
});

test('malformed progress and output are preserved by read and reset', () => {
  storage.set(progress.LEARNING_PROGRESS_KEY, '{broken');
  storage.set(progress.PROJECT_OUTPUT_KEY, 'keep');
  const read = progress.readLearningProgress(course);
  assert.equal(read.blocked, true);
  assert.equal(read.storageIssue, 'invalid');
  assert.equal(writes, 0);
  assert.throws(() => progress.resetLearningProgress(course));
  assert.equal(storage.get(progress.LEARNING_PROGRESS_KEY), '{broken');
  assert.equal(storage.get(progress.PROJECT_OUTPUT_KEY), 'keep');
  assert.equal(removals, 0);
});

test('saved project output validates runnable code and bounded notes', () => {
  const run = progress.readLearningProgress(course).run;
  const fixedRun = { ...run, workspace: { program: fixed, notes: ['<img src=x onerror=alert(1)>'] } };
  const app = progress.saveMemoOutput(fixedRun, course.version);
  assert.equal(progress.validateMemoOutput(app, course), true);
  assert.equal(progress.validateMemoOutput({ ...app, pathVersion: 0 }, course), false);
  assert.equal(progress.validateMemoOutput({ ...app, program: `${fixed}\nrun: alert(1)` }, course), false);
  assert.equal(progress.validateMemoOutput({ ...app, notes: Array.from({ length: 101 }, () => 'note') }, course), false);
});

test('the lesson contract has unique steps and backward-only prerequisites', () => {
  const ids = course.steps.map((step) => step.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(course.completion.required).size, course.completion.required.length);
  assert.deepEqual(course.completion.required, ids);
  for (const [index, step] of course.steps.entries()) for (const required of step.requires || []) {
    assert.ok(ids.includes(required));
    assert.ok(ids.indexOf(required) < index, `${step.id} requires a step that does not come first`);
  }
});

test('reset removes only this path v2 and valid output while preserving earlier version and unrelated keys', () => {
  let read = progress.readLearningProgress(course);
  read = progress.recordVerification(read, 'run-starter', true, course);
  const another = progress.readLearningProgress(otherPath);
  progress.visitStep(another, 'one', otherPath);
  const validOutput = progress.saveMemoOutput(read.run, course.version);
  storage.set(progress.LEARNING_PROGRESS_KEY, JSON.stringify({ schemaVersion: 1, paths: { [`${course.id}@1`]: { old: true }, 'other@1': another.run, [projectKey]: read.run } }));
  storage.set(progress.PROJECT_OUTPUT_KEY, JSON.stringify(validOutput));
  for (const key of legacyKeys) storage.set(key, 'preserve');
  progress.resetLearningProgress(course);
  const saved = JSON.parse(storage.get(progress.LEARNING_PROGRESS_KEY));
  assert.equal(saved.paths[projectKey], undefined);
  assert.deepEqual(saved.paths[`${course.id}@1`], { old: true });
  assert.equal(saved.paths['other@1'].pathId, 'other');
  assert.equal(storage.has(progress.PROJECT_OUTPUT_KEY), false);
  for (const key of legacyKeys) assert.equal(storage.get(key), 'preserve');
});

test('60-minute completion summary derives counts and next path from the selected browser checklists', () => {
  const tracks = { frontend: 'vue', backend: 'hono' };
  const empty = completion.readCompletionSnapshot(tracks);
  assert.equal(empty.checkedItems, 0);
  assert.equal(empty.isComplete, false);
  assert.equal(empty.currentStep, 0);
  assert.equal(empty.nextPath, '/path/60min');
  assert.equal(completion.localizeChallengePath(empty.nextPath, 'en'), '/en/path/60min');
  storage.set('checklist-60min-step1', JSON.stringify(['a', 'a', 'b', 'c', 'extra']));
  storage.set('checklist-60min-frontend-vue', JSON.stringify(['v1', 'v2', 'v3', 'v4']));
  const partial = completion.readCompletionSnapshot(tracks);
  assert.equal(partial.checkedItems, 7);
  assert.equal(partial.progress, 37);
  assert.equal(partial.completeStages, 2);
  assert.equal(partial.currentStep, 2);
  assert.equal(partial.nextPath, '/start/60min/backend/hono');
  storage.set('checklist-60min-backend-hono', JSON.stringify(['h1', 'h2', 'h3', 'h4']));
  storage.set('checklist-60min-connect', JSON.stringify(['c1', 'c2', 'c3', 'c4']));
  storage.set('checklist-60min-deploy', JSON.stringify(['d1', 'd2', 'd3', 'd4']));
  const done = completion.readCompletionSnapshot(tracks);
  assert.equal(done.checkedItems, 19);
  assert.equal(done.progress, 100);
  assert.equal(done.completeStages, 5);
  assert.equal(done.isComplete, true);
  assert.equal(done.currentStep, 5);
  assert.equal(done.nextPath, '/map/');
  assert.equal(completion.localizeChallengePath(done.nextPath, 'en'), '/en/map/');
});

test('completion summary treats corrupt or denied browser storage as unverified', () => {
  storage.set('checklist-60min-step1', '{broken');
  assert.equal(completion.readCompletionSnapshot().blocked, true);
  const original = window.localStorage.getItem;
  window.localStorage.getItem = () => { throw new Error('denied'); };
  const blocked = completion.readCompletionSnapshot();
  window.localStorage.getItem = original;
  assert.equal(blocked.blocked, true);
  assert.equal(blocked.isComplete, false);
});

test('completion page has no static deployment achievements, hard-coded counts, or unverified example URL', () => {
  for (const lang of ['', 'en/']) {
    const source = readFileSync(`src/pages/${lang}start/60min/complete/index.astro`, 'utf8');
    assert.match(source, /ChallengeCompletionSummary/);
    assert.doesNotMatch(source, /href="https:\/\/github\.com\/choorai\/examples/);
    assert.doesNotMatch(source, /Steps Completed|완료한 단계|Deployed URL|배포한 URL|Published on Cloudflare Pages|Cloudflare Pages에 공개/);
  }
});
