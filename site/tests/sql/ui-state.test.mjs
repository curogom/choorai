// @ts-nocheck
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {createRequire} from 'node:module';
import ts from 'typescript';
const nativeRequire=createRequire(import.meta.url),cache=new Map();
let slots=[],cursor=0,effectMounted=false,pendingEffects=[];
const react={useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return[slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v;}];},useRef(initial){const i=cursor++;return slots[i]??=( {current:initial});},useEffect(fn){if(!effectMounted)pendingEffects.push(fn);}};
class SQLPracticeError extends Error{constructor(message){super(message);this.kind='syntax';}}
let runQuery, abortCount;
class Engine{cancel(){} abortActive(){abortCount++;} run(){return runQuery();}}
function load(file){file=resolve(file);if(file.endsWith('.json'))return JSON.parse(readFileSync(file,'utf8'));if(cache.has(file))return cache.get(file).exports;const mod={exports:{}};cache.set(file,mod);const output=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;new Function('require','module','exports',output)(id=>id==='react'?react:id.endsWith('/client')?{SQLPracticeEngine:Engine,SQLPracticeError}:id.startsWith('.')?load(resolve(dirname(file),id.endsWith('.json')?id:id+'.ts')):nativeRequire(id),mod,mod.exports);return mod.exports;}
const component=load('src/components/SqlPractice.tsx').default;
function render(){cursor=0;const tree=component();for(const fn of pendingEffects.splice(0))fn();effectMounted=true;return tree;}
function nodes(tree,predicate){if(!tree||typeof tree!=='object')return[];return[...(predicate(tree)?[tree]:[]),...[tree.props?.children].flat(Infinity).flatMap(child=>nodes(child,predicate))];}
const button=(tree,label)=>nodes(tree,n=>n.type==='button'&&n.props.children===label)[0];
const text=tree=>typeof tree==='string'||typeof tree==='number'?String(tree):!tree||typeof tree!=='object'?'':[tree.props?.children].flat(Infinity).map(text).join(' ');
function setupBrowser(t) {
 slots=[]; cursor=0; effectMounted=false; pendingEffects=[]; abortCount=0;
 runQuery=async()=>{throw new SQLPracticeError('no such table: missing_table');};
 const previousWindow=globalThis.window,previousStorage=globalThis.localStorage;
 t.after(()=>{if(previousWindow===undefined)delete globalThis.window;else globalThis.window=previousWindow;if(previousStorage===undefined)delete globalThis.localStorage;else globalThis.localStorage=previousStorage;});
 const storage=new Map([['existing-b01-progress','preserve']]);globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 // This harness executes client effects, so supply the browser event contract too.
 const events=new EventTarget();globalThis.window={localStorage:globalThis.localStorage,addEventListener:events.addEventListener.bind(events),removeEventListener:events.removeEventListener.bind(events),dispatchEvent:events.dispatchEvent.bind(events)};
 return storage;
}
test('B03 missing-table error is cleared by reset, including feedback kind; other progress survives',async(t)=>{
 const storage=setupBrowser(t);
 render();let tree=render();nodes(tree,n=>n.type==='nav'&&n.props['aria-label']==='SQL 차시 선택')[0].props.children[2].props.onClick();tree=render();nodes(tree,n=>n.type==='select'&&n.props.id==='sql-question-picker')[0].props.onChange({target:{value:'B03-Q02'}});tree=render();nodes(tree,n=>n.type==='textarea'&&n.props.id==='sql-answer')[0].props.onChange({target:{value:'SELECT * FROM missing_table;'}});tree=render();await button(tree,'SQL 실행·검증').props.onClick();tree=render();assert.match(text(tree),/no such table: missing_table/);button(tree,'이 실습장 초기화').props.onClick();tree=render();button(tree,'기록 초기화').props.onClick();tree=render();assert.doesNotMatch(text(tree),/missing_table|실행 오류 원문/);assert.match(text(tree),/SQL 실행 통과\s+0\s*\/\s*25/);assert.equal(nodes(tree,n=>n.type==='textarea'&&n.props.id==='sql-answer')[0].props.value,'');assert.equal(nodes(tree,n=>n.props['data-testid']==='sql-feedback')[0].props['data-kind'],'');assert.equal(storage.get('existing-b01-progress'),'preserve');
});

const key = 'choorai-sql-b01-b03-v1';
const answer = text => ({ text, notes: '', status: 'draft', checks: [] });
const input = tree => nodes(tree, n => n.type === 'textarea' && n.props.id === 'sql-answer')[0];
const progress = answers => ({ version: 1, current: 'B01-Q01', answers });
function remoteWrite(storage, value) {
 storage.set(key, JSON.stringify(value));
 const event = new Event('storage'); Object.defineProperty(event, 'key', { value: key });
 window.dispatchEvent(event); return render();
}
function mounted(storage, value) { storage.set(key, JSON.stringify(value)); render(); return render(); }
function navigateTo(tree, id) {
 nodes(tree, n => n.type === 'select' && n.props.id === 'sql-question-picker')[0].props.onChange({ target: { value: id } });
 return render();
}
test('a failed SQL save survives unrelated remote edits and persists on the next save', t => {
 const storage = setupBrowser(t);
 const original = progress({ 'B01-Q01': answer('SELECT 1'), 'B01-Q02': answer('SELECT 2') });
 let tree = mounted(storage, original);
 const write = localStorage.setItem;
 localStorage.setItem = () => { throw new Error('quota'); };
 input(tree).props.onChange({ target: { value: 'SELECT 10' } }); tree = render();
 const remote = { ...original, answers: { ...original.answers, 'B01-Q02': answer('SELECT 20') } };
 tree = remoteWrite(storage, remote); assert.equal(input(tree).props.value, 'SELECT 10');
 localStorage.setItem = write; tree = navigateTo(tree, 'B01-Q02');
 const saved = JSON.parse(storage.get(key));
 assert.equal(saved.answers['B01-Q01'].text, 'SELECT 10');
 assert.equal(saved.answers['B01-Q02'].text, 'SELECT 20');
 tree = navigateTo(tree, 'B01-Q01'); assert.equal(input(tree).props.value, 'SELECT 10');
});
for (const outcome of ['pass', 'mismatch', 'error']) {
 for (const adoption of ['storage', 'conflict choice']) test(`remote answer adoption via ${adoption} invalidates a pending SQL ${outcome}`, async t => {
  const storage = setupBrowser(t);
  const original = progress({ 'B01-Q01': answer('SELECT 1') });
  let tree = mounted(storage, original);
  let complete, fail;
  runQuery = () => new Promise((resolve, reject) => { complete = resolve; fail = reject; });
  const pending = button(tree, 'SQL 실행·검증').props.onClick(); tree = render();
  const remote = progress({ 'B01-Q01': answer('SELECT 2') });
  if (adoption === 'conflict choice') {
   // A note edit diverges the whole answer; the explicit choice later adopts remote text.
   const notes = nodes(tree, n => n.type === 'textarea' && n.props.id !== 'sql-answer')[0];
   const write = localStorage.setItem;
   localStorage.setItem = () => { throw new Error('quota'); };
   notes.props.onChange({ target: { value: 'local note' } }); tree = render();
   localStorage.setItem = write;
  }
  tree = remoteWrite(storage, remote);
  if (adoption === 'conflict choice') {
   assert.equal(input(tree).props.value, 'SELECT 1');
   button(tree, '저장된 답안 사용').props.onClick(); tree = render();
  }
  assert.equal(input(tree).props.value, 'SELECT 2');
  assert.ok(button(tree, 'SQL 실행·검증'), 'replacement releases busy state immediately');
  assert.equal(button(tree, 'SQL 실행·검증').props.disabled, false);
  assert.ok(abortCount > 0, 'replacement aborts active worker');
  if (outcome === 'error') fail(new SQLPracticeError('stale error'));
  else complete({ result: { columns: ['n'], values: [[1]] }, checks: [outcome === 'pass'], pass: outcome === 'pass' });
  await pending; tree = render();
  assert.equal(input(tree).props.value, 'SELECT 2');
  assert.deepEqual(JSON.parse(storage.get(key)), remote);
  assert.equal(nodes(tree, n => n.props['data-testid'] === 'sql-feedback')[0].props['data-kind'], '');
 });
}
test('an unrelated remote answer does not cancel or discard a valid SQL completion', async t => {
 const storage = setupBrowser(t);
 const original = progress({ 'B01-Q01': answer('SELECT 1'), 'B01-Q02': answer('SELECT 2') });
 let tree = mounted(storage, original);
 let complete; runQuery = () => new Promise(resolve => { complete = resolve; });
 const pending = button(tree, 'SQL 실행·검증').props.onClick();
 tree = remoteWrite(storage, { ...original, answers: { ...original.answers, 'B01-Q02': answer('SELECT 20') } });
 assert.equal(abortCount, 0);
 complete({ result: { columns: ['n'], values: [[1]] }, checks: [true], pass: true });
 await pending; tree = render();
 const saved = JSON.parse(storage.get(key));
 assert.equal(saved.answers['B01-Q01'].status, 'pass');
 assert.equal(saved.answers['B01-Q02'].text, 'SELECT 20');
});
