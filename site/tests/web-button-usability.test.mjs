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
const reactMock = { useId: () => 'test-group-id', useState: (...args) => activeHooks.useState(...args), useRef: (...args) => activeHooks.useRef(...args), useMemo: (fn) => fn(), useEffect: (...args) => activeHooks.useEffect(...args) };
const jsxRuntime = { jsx: (type, props, key) => ({ type, props: { ...props, ...(key === undefined ? {} : { key }) } }), jsxs: (type, props, key) => ({ type, props: { ...props, ...(key === undefined ? {} : { key }) } }), Fragment: Symbol('Fragment') };
function load(file) {
  file = resolve(file);
  if (file.endsWith('.json')) return JSON.parse(readFileSync(file, 'utf8'));
  if (cache.has(file)) return cache.get(file).exports;
  const mod = { exports: {} }; cache.set(file, mod);
  const output = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, resolveJsonModule: true } }).outputText;
  new Function('require', 'module', 'exports', output)((id) => id === 'react' ? reactMock : id === 'react/jsx-runtime' ? jsxRuntime : id.startsWith('.') ? load(resolve(dirname(file), id.endsWith('.json') ? id : (/\.(tsx?|jsx?)$/.test(id) ? id : id + '.ts'))) : nativeRequire(id), mod, mod.exports);
  return mod.exports;
}
const Lesson = load('src/components/ButtonMessageLesson.tsx').default;
const lesson = load('src/lib/learning/buttonLessonSandbox.js');
function text(tree) {
  if (typeof tree === 'string' || typeof tree === 'number') return String(tree);
  if (!tree || typeof tree !== 'object') return '';
  return [tree.props?.children].flat(Infinity).map(text).join(' ');
}
function nodes(tree, predicate) {
  if (!tree || typeof tree !== 'object') return [];
  return [...(predicate(tree) ? [tree] : []), ...[tree.props?.children].flat(Infinity).flatMap(child => nodes(child, predicate))];
}
let locale = 'en';
function render() {
  for (let i = 0; i < 20; i++) {
    activeHooks.begin(); const tree = Lesson({ locale });
    const pending = activeHooks.hasPending; activeHooks.flush();
    if (!pending) return tree;
  }
  throw new Error('Component did not settle');
}
function button(tree, pattern) {
  const found = nodes(tree, n => n.type === 'button' && pattern.test(text(n).trim()));
  assert.equal(found.length, 1, `one button matching ${pattern}; got ${found.map(text)}`);
  return found[0];
}
function click(tree, pattern) {
  const target = button(tree, pattern);
  assert.notEqual(target.props.disabled, true);
  target.props.onClick(); return render();
}
function editor(tree, field) { return nodes(tree, n => n.type === 'textarea' && n.props.id === `button-lesson-${field}`)[0]; }
function edit(tree, field, value) { editor(tree, field).props.onChange({target:{value}}); return render(); }
function saved() { return JSON.parse(storage.get(lesson.BUTTON_LESSON_STORAGE_KEY)); }
function seed(stage = 4) {
  const state = {...lesson.BUTTON_LESSON_STARTER, javascript: lesson.BUTTON_LESSON_STARTER.javascript.replace('#show-memo', '#change-message').replace('The message changed.', 'My preserved custom sentence'), stage, check:'changed', revision:7, unchangedRevision:null, repairRevision:3};
  storage.set(lesson.BUTTON_LESSON_STORAGE_KEY, JSON.stringify(state));
  return state;
}
beforeEach(() => {
  storage.clear(); locale = 'en'; activeHooks = createHooks();
  const listeners = new Map();
  globalThis.window = { matchMedia: () => ({matches:true}),
    addEventListener(name, fn) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); },
    removeEventListener(name, fn) { listeners.get(name)?.delete(fn); },
    dispatchEvent(event) { for (const fn of listeners.get(event.type) || []) fn(event); return true; },
    localStorage: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key,value) => storage.set(key,value),
    removeItem: key => storage.delete(key),
  }, setTimeout: fn => { fn(); return 1; }, requestAnimationFrame: fn => { fn(); return 1; } };
  globalThis.document = {getElementById: () => null, querySelector: () => null};
});

// These tests execute component handlers with mocked React state and storage.
// They do not model browser focus, iframe execution, accessibility trees, or layout.
test('restoring an edited completed draft preserves code and historical progress without accepting a stale observation', () => {
  const original = seed(); const tree = render();
  assert.equal(editor(tree,'javascript').props.value, original.javascript);
  assert.deepEqual(saved(), original);
  assert.equal(nodes(tree,n=>n.type==='iframe').length,0);
  assert.equal(button(tree,/^I clicked it; the message changed$/).props.disabled,true);
  assert.equal(button(tree,/^I repaired it/).props.disabled,true);
  assert.equal(button(tree,/^I saw my new sentence/).props.disabled,true);
});

test('an edited draft is saved exactly and a remount resumes it across locale', () => {
  seed(3); let tree = render();
  const changed = editor(tree,'javascript').props.value.replace('My preserved custom sentence','나의 새 문장');
  tree = edit(tree,'javascript',changed);
  const persisted = saved();
  assert.equal(persisted.javascript,changed); assert.equal(persisted.stage,3);
  activeHooks = createHooks(); locale='ko'; tree=render();
  assert.equal(editor(tree,'javascript').props.value,changed);
  assert.deepEqual(saved(),persisted);
});

test('PERSIST-05: cross-tab file edits merge by file and same-file conflicts require an explicit choice', () => {
  const original = seed(1);
  let tree = render();
  const localJavascript = original.javascript.replace('My preserved custom sentence', 'Local tab message');
  const remoteCss = original.css.replace('#4f46e5', '#075985');
  const remoteJavascript = original.javascript.replace('My preserved custom sentence', 'Remote tab message');
  storage.set(lesson.BUTTON_LESSON_STORAGE_KEY, JSON.stringify({ ...original, css: remoteCss, javascript: remoteJavascript }));
  editor(tree, 'javascript').props.onChange({ target: { value: localJavascript } });
  tree = render();

  assert.equal(editor(tree, 'javascript').props.value, localJavascript, 'local text stays visible during a same-file conflict');
  assert.equal(editor(tree, 'css').props.value, remoteCss, 'an unrelated remote file is adopted');
  assert.match(text(tree), /Another tab saved a different version of the same code file/);
  tree = click(tree, /^Save my file$/);
  assert.equal(saved().javascript, localJavascript);
  assert.equal(saved().css, remoteCss, 'choosing the local JavaScript does not erase the remote CSS');
});

function byId(tree, id) {
  const found = nodes(tree, n => n.props.id === id);
  assert.equal(found.length, 1, `expected ${id}`);
  return found[0];
}

for (const keepLocal of [true, false]) test(`conflict choice ${keepLocal ? 'local' : 'saved'} persists merged historical progress across remount`, () => {
  const original = seed(4);
  let tree = render();
  const localJavascript = original.javascript.replace('My preserved custom sentence', 'Local choice');
  const remote = { ...original, stage: 1, check: null, repairRevision: null, javascript: original.javascript.replace('My preserved custom sentence', 'Remote choice'), revision: original.revision + 2 };
  storage.set(lesson.BUTTON_LESSON_STORAGE_KEY, JSON.stringify(remote));
  tree = edit(tree, 'javascript', localJavascript);
  // A later remote write leaves lower saved progress while the open tab retains its historical stage.
  storage.set(lesson.BUTTON_LESSON_STORAGE_KEY, JSON.stringify(remote));
  window.dispatchEvent({ type: 'storage', key: lesson.BUTTON_LESSON_STORAGE_KEY });
  tree = render();
  assert.match(text(tree), /Earlier lesson progress: 4/);
  tree = click(tree, keepLocal ? /^Save my file$/ : /^Use saved file$/);
  const chosen = keepLocal ? localJavascript : remote.javascript;
  assert.equal(saved().javascript, chosen);
  assert.equal(saved().stage, 4, 'choosing a file must not discard merged historical progress');
  assert.equal(saved().revision, remote.revision);
  activeHooks = createHooks(); tree = render();
  assert.equal(editor(tree, 'javascript').props.value, chosen);
  assert.match(text(tree), /Earlier lesson progress: 4/);
});
function clickId(tree, id) { const target = byId(tree,id); assert.notEqual(target.props.disabled,true); target.props.onClick(); return render(); }

test('reset request and cancel preserve exact draft and progress; confirmation resets and undo restores across remount', () => {
  const original = seed(); let tree = render();
  tree = click(tree,/^Start this lesson over$/);
  assert.deepEqual(saved(),original,'opening reset does not erase data');
  tree = clickId(tree,'button-lesson-reset-cancel');
  assert.deepEqual(saved(),original,'cancel does not erase data');
  assert.equal(editor(tree,'javascript').props.value,original.javascript);
  tree = click(tree,/^Start this lesson over$/);
  tree = clickId(tree,'button-lesson-reset-confirm');
  assert.equal(editor(tree,'javascript').props.value,lesson.BUTTON_LESSON_STARTER.javascript);
  assert.ok(storage.has(lesson.BUTTON_LESSON_UNDO_STORAGE_KEY),'undo backup persists across page exit');
  activeHooks = createHooks(); tree = render();
  tree = clickId(tree,'button-lesson-reset-undo');
  assert.equal(editor(tree,'javascript').props.value,original.javascript);
  assert.deepEqual(saved(),original,'undo restores every draft and progress field');
  assert.equal(nodes(tree,n=>n.type==='iframe').length,0,'undo never revives an old execution');
});

test('preview and behavior checks preserve exact stage-1 reset undo after reaching stage 2 and remounting', () => {
  const original = seed(1); let tree = render();
  tree = click(tree,/^Start this lesson over$/);
  tree = clickId(tree,'button-lesson-reset-confirm');
  assert.ok(storage.has(lesson.BUTTON_LESSON_UNDO_STORAGE_KEY));
  tree = click(tree,/^Run preview$/);
  assert.ok(storage.has(lesson.BUTTON_LESSON_UNDO_STORAGE_KEY),'preview does not consume undo');
  tree = click(tree,/^I clicked it; it did not change$/);
  assert.ok(storage.has(lesson.BUTTON_LESSON_UNDO_STORAGE_KEY),'manual behavior check does not consume undo');
  activeHooks = createHooks(); tree = render();
  assert.ok(nodes(tree,n=>n.props.id === 'button-lesson-reset-undo').length === 1,'undo remains available after reload');
  tree = clickId(tree,'button-lesson-reset-undo');
  assert.equal(editor(tree,'javascript').props.value,original.javascript);
  assert.deepEqual(saved(),original);
});

test('an explicit draft edit ends the one-time reset undo', () => {
  seed(); let tree = render();
  tree = click(tree,/^Start this lesson over$/);
  tree = clickId(tree,'button-lesson-reset-confirm');
  assert.ok(storage.has(lesson.BUTTON_LESSON_UNDO_STORAGE_KEY));
  tree = edit(tree,'html',editor(tree,'html').props.value.replace('One button','My button'));
  assert.equal(storage.has(lesson.BUTTON_LESSON_UNDO_STORAGE_KEY),false);
  assert.equal(nodes(tree,n=>n.props.id === 'button-lesson-reset-undo').length,0);
});

test('a second confirmed reset explicitly ends an older undo and the dialog explains its lifetime', () => {
  seed(); let tree = render();
  tree = click(tree,/^Start this lesson over$/);
  tree = clickId(tree,'button-lesson-reset-confirm');
  assert.ok(storage.has(lesson.BUTTON_LESSON_UNDO_STORAGE_KEY));
  tree = click(tree,/^Start this lesson over$/);
  assert.match(text(tree),/preview|Preview/);
  assert.match(text(tree),/another reset|초기화하면/);
  tree = clickId(tree,'button-lesson-reset-confirm');
  assert.equal(storage.has(lesson.BUTTON_LESSON_UNDO_STORAGE_KEY),false);
});

test('when storage is blocked, reset undo remains tab-local and the UI warns refresh may lose it', () => {
  seed(); let tree = render();
  window.localStorage.setItem = () => { throw new Error('storage blocked'); };
  tree = click(tree,/^Start this lesson over$/);
  tree = clickId(tree,'button-lesson-reset-confirm');
  assert.match(text(tree),/only in this tab/);
  assert.ok(nodes(tree,n=>n.props.id === 'button-lesson-reset-undo').length === 1);
  tree = click(tree,/^Run preview$/);
  assert.ok(nodes(tree,n=>n.props.id === 'button-lesson-reset-undo').length === 1,'preview keeps the in-tab recovery copy');
  assert.match(text(tree),/refreshing may restore the prior draft and lose the undo/);
});

test('undo snapshot helper bounds and exactly preserves all valid draft and progress fields', () => {
  const original = seed();
  const snapshot = lesson.createButtonLessonUndoSnapshot(original);
  assert.deepEqual(lesson.readButtonLessonUndoSnapshot(JSON.parse(JSON.stringify(snapshot))),original);
  const invalid = {...original, javascript:'x'.repeat(12001)};
  assert.equal(lesson.readButtonLessonUndoSnapshot({version:1,state:invalid}),null);
  assert.equal(lesson.readButtonLessonUndoSnapshot({version:2,state:original}),null);
});

for (const [file, code, mutate, expectedLine] of [
  ['javascript','javascript-missing-string-quote', s => s.replace('changed.";', 'changed.;'),5],
  ['html','html-missing-main-close', s => s.replace('</main>',''),4],
  ['css','css-unsupported-calc', s => s.replace('margin: 0;', 'margin: calc(1px + 1px);'),2],
]) {
  test(`${file} controlled mistake reports an actionable position and recovers after the indicated repair`, () => {
    const draft = {...lesson.BUTTON_LESSON_STARTER, javascript:lesson.BUTTON_LESSON_STARTER.javascript.replace('#show-memo','#change-message')};
    const broken = {...draft,[file]:mutate(draft[file])};
    const result = lesson.prepareButtonLessonPreview(broken.html,broken.css,broken.javascript);
    assert.equal(result.ok,false); assert.equal(result.document,undefined);
    assert.equal(result.diagnostic.file,file);
    assert.equal(result.diagnostic.code,code);
    assert.equal(result.diagnostic.line,expectedLine);
    assert.ok(Number.isInteger(result.diagnostic.column) && result.diagnostic.column >= 1);
    assert.equal(lesson.prepareButtonLessonPreview(draft.html,draft.css,draft.javascript).ok,true);
  });
}

test('no parent message listener can turn an iframe success claim into progress', () => {
  seed(2); let tree = render();
  const prior = saved();
  assert.equal(typeof window.onmessage,'undefined');
  const source = readFileSync('src/components/ButtonMessageLesson.tsx','utf8');
  assert.doesNotMatch(source,/addEventListener\(\s*['"]message['"]/);
  assert.equal(nodes(tree,n=>n.type==='iframe').length,0);
  assert.deepEqual(saved(),prior);
});

test('repair and variation still require fresh supported previews and explicit manual observations', () => {
  let tree = render();
  tree = click(tree,/^Run preview$/);
  const frame = nodes(tree,n=>n.type==='iframe')[0];
  assert.equal(frame.props.sandbox,'allow-scripts');
  assert.equal(frame.props.referrerPolicy,'no-referrer');
  tree = click(tree,/^I clicked it; it did not change$/);
  assert.equal(button(tree,/^I repaired it/).props.disabled,true);
  tree = edit(tree,'javascript',lesson.BUTTON_LESSON_STARTER.javascript.replace('#show-memo','#change-message'));
  assert.equal(button(tree,/^I clicked it; the message changed$/).props.disabled,true);
  tree = click(tree,/^Run preview$/);
  assert.equal(button(tree,/^I repaired it/).props.disabled,true);
  tree = click(tree,/^I clicked it; the message changed$/);
  console.log('DEBUG repair', button(tree,/^I repaired it/).props.disabled, saved(), text(tree));
  tree = click(tree,/^I repaired it/);
  assert.equal(button(tree,/^I saw my new sentence/).props.disabled,true);
  tree = edit(tree,'javascript',editor(tree,'javascript').props.value.replace('The message changed.','My variation'));
  tree = click(tree,/^Run preview$/);
  tree = click(tree,/^I saw my new sentence/);
  assert.equal(saved().stage,4);
  tree = edit(tree,'javascript',editor(tree,'javascript').props.value.replace('My variation"','My variation'));
  tree = click(tree,/^Run preview$/);
  assert.equal(saved().stage,4,'historical record remains stored');
  assert.equal(nodes(tree,n=>n.type==='iframe').length,0,'broken current draft has no preview');
  assert.equal(button(tree,/^I clicked it; the message changed$/).props.disabled,true);
});

test('collapsed navigation links are hidden from interaction and current-page link is identified', () => {
  const NavGroup = load('src/components/NavGroup.tsx').default;
  const props = {title:'Basics',items:[{label:'Lesson',href:'/learn/web-button'}],currentPath:'/learn/web-button',storageKey:'test-only'};
  globalThis.localStorage = window.localStorage;
  function nav() { activeHooks.begin(); return NavGroup(props); }
  let tree = nav();
  assert.equal(button(tree,/^Basics$/).props['aria-expanded'],true);
  const link = nodes(tree,n=>n.type==='a')[0];
  assert.equal(link.props['aria-current'],'page');
  const controlled = button(tree,/^Basics$/).props['aria-controls'];
  assert.ok(controlled);
  button(tree,/^Basics$/).props.onClick(); tree=nav();
  assert.equal(button(tree,/^Basics$/).props['aria-expanded'],false);
  const content = byId(tree,controlled);
  const React = nativeRequire('react');
  const {renderToStaticMarkup} = nativeRequire('react-dom/server');
  const markup = renderToStaticMarkup(React.createElement('div',{hidden:content.props.hidden,inert:content.props.inert},'link group'));
  assert.match(markup,/\s(?:hidden|inert)=/, 'installed React must emit a real hidden or inert attribute, not only opacity');
  assert.equal(content.props['aria-hidden'],true);
});

test('static source: home in each locale links directly to the real-code button lesson', () => {
  for (const path of ['src/pages/index.astro','src/pages/en/index.astro']) {
    const source=readFileSync(path,'utf8');
    assert.match(source,/learn\/web-button/);
    assert.match(source,/HTML/); assert.match(source,/CSS/); assert.match(source,/JavaScript|JS/);
  }
});

test('static source: introductory button lesson appears before React in frontend navigation', () => {
  const source=readFileSync('src/i18n/navigation.ts','utf8');
  const entry=source.indexOf("lp('/learn/web-button')");
  const react=source.indexOf("lp('/map/frontend/react')");
  assert.ok(entry>=0 && react>=0 && entry<react);
});

for (const lang of ['ko','en']) {
  for (const [field,mutate,example] of [
    ['javascript',s=>s.replace('custom sentence"','custom sentence'),'message.textContent ='],
    ['html',s=>s.replace('</main>',''),'</main>'],
    ['css',s=>s.replace('margin: 0;','margin: calc(1px + 1px);'),'margin: 1rem;'],
  ]) test(`${lang} ${field} error UI provides an editor association, example, expandable steps and preserves history`,()=>{
    locale=lang; seed(); let tree=render();
    tree=edit(tree,field,mutate(editor(tree,field).props.value));
    tree=click(tree,lang==='en'?/^Run preview$/:/^미리보기 실행$/);
    const summary=byId(tree,'button-lesson-error-summary');
    assert.equal(summary.props.role,'alert');
    assert.ok(text(summary).includes(example));
    assert.equal(editor(tree,field).props['aria-invalid'],true);
    assert.equal(editor(tree,field).props['aria-describedby'],'button-lesson-error-summary');
    assert.match(text(tree),lang==='en'?/Earlier (?:self-reported |lesson )progress: 4/:/이전[^.]*4/);
    assert.match(text(tree),lang==='en'?/current draft did not run/:/현재 초안을 실행하지 못했습니다/);
    tree=click(tree,lang==='en'?/^Show a step-by-step hint$/:/^단계별 힌트 보기$/);
    assert.match(text(byId(tree,'button-lesson-error-summary')),lang==='en'?/Step 1:/:/1단계:/);
    assert.equal(saved().stage,4);
    assert.equal(nodes(tree,n=>n.type==='iframe').length,0);
  });
}

test('static source: preview jump has a focusable destination, mobile compact styles and a back-to-code link', () => {
  const source=readFileSync('src/components/ButtonMessageLesson.tsx','utf8');
  assert.match(source,/href="#button-lesson-preview-result"/);
  assert.match(source,/id="button-lesson-preview-result"[^>]*role="region"[^>]*aria-labelledby="preview-title"[^>]*tabIndex=\{-1\}/);
  assert.match(source,/previewResultRef\.current\?\.focus/);
  assert.match(source,/previewResultRef\.current\?\.scrollIntoView/);
  assert.match(source,/href="#button-lesson-starter"/);
  assert.match(source,/h-\[min\(36rem,80vh\)\]/);
  const preview=lesson.prepareButtonLessonPreview(lesson.BUTTON_LESSON_STARTER.html,lesson.BUTTON_LESSON_STARTER.css,lesson.BUTTON_LESSON_STARTER.javascript);
  assert.match(preview.document,/@media/);
});

test('preview jump scrolls to and visibly focuses the result region, not the starter editor', () => {
  let tree=render(); tree=click(tree,/^Run preview$/);
  const target=byId(tree,'button-lesson-preview-result');
  const calls=[];
  target.props.ref.current={scrollIntoView:options=>calls.push(['scroll',options]),focus:options=>calls.push(['focus',options])};
  const link=nodes(tree,n=>n.type==='a' && n.props.href==='#button-lesson-preview-result')[0];
  assert.ok(link);
  let prevented=false;
  link.props.onClick({preventDefault(){prevented=true;}});
  assert.equal(prevented,true);
  assert.deepEqual(calls,[
    ['scroll',{block:'start',behavior:'auto'}],
    ['focus',{preventScroll:true}],
  ]);
});

test('static source: docs modals declare controls, constrain keyboard focus and restore an opener on Escape', () => {
  const source=readFileSync('src/layouts/DocsLayout.astro','utf8');
  for (const [trigger,target] of [['mobile-menu-trigger','mobile-sidebar'],['search-trigger','search-modal']]) {
    const tag=source.match(new RegExp(`<button[^>]*id="${trigger}"[^>]*>`))?.[0];
    assert.ok(tag); assert.ok(tag.includes(`aria-controls="${target}"`)); assert.ok(tag.includes('aria-expanded="false"'));
  }
  assert.match(source,/shell\.inert = true/); assert.match(source,/shell\.inert = false/);
  assert.match(source,/mobileClose\?\.focus\(\)/);
  assert.match(source,/modal\?\.focus\(\)/);
  assert.match(source,/event\.key !== 'Tab'/);
  assert.match(source,/event\.shiftKey/);
  assert.match(source,/last\.focus\(\)/); assert.match(source,/first\.focus\(\)/);
  assert.match(source,/if \(event\.key === 'Escape'\)/);
  assert.match(source,/if \(restoreFocus\) mobileTrigger\?\.focus\(\)/);
  assert.match(source,/fallback\?\.focus\(\)/);
  assert.match(source,/setAttribute\('aria-expanded', 'true'\)/);
  assert.match(source,/setAttribute\('aria-expanded', 'false'\)/);
  assert.match(source,/href="#docs-main"/);
  const skipTag=source.match(/<a[^>]*href="#docs-main"[^>]*>/)?.[0];
  assert.ok(skipTag); assert.doesNotMatch(skipTag,/tabindex="-1"/);
  assert.match(source,/<main id="docs-main"[^>]*tabindex="-1"/);
});

for (const lang of ['ko','en']) test(`${lang} restored valid draft asks for a rerun without demanding another edit`,()=>{
  locale=lang; seed(3); const tree=render();
  const copy=text(tree);
  assert.doesNotMatch(copy,lang==='en'?/Edit and run the preview again before recording this check/:/확인 기록 전에 코드를 고치고/);
  assert.match(copy,lang==='en'?/Fix any code error shown above, then run the current code/:/위에 코드 오류가 있으면 먼저 고친 뒤 미리보기를 실행/);
  assert.doesNotMatch(copy,lang==='en'?/Edited since the last preview/:/마지막 실행 뒤 코드를 수정/);
});
