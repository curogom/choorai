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
class Engine{cancel(){} async run(){throw new SQLPracticeError('no such table: missing_table');}}
function load(file){file=resolve(file);if(file.endsWith('.json'))return JSON.parse(readFileSync(file,'utf8'));if(cache.has(file))return cache.get(file).exports;const mod={exports:{}};cache.set(file,mod);const output=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;new Function('require','module','exports',output)(id=>id==='react'?react:id.endsWith('/client')?{SQLPracticeEngine:Engine,SQLPracticeError}:id.startsWith('.')?load(resolve(dirname(file),id.endsWith('.json')?id:id+'.ts')):nativeRequire(id),mod,mod.exports);return mod.exports;}
const component=load('src/components/SqlPractice.tsx').default;
function render(){cursor=0;const tree=component();for(const fn of pendingEffects.splice(0))fn();effectMounted=true;return tree;}
function nodes(tree,predicate){if(!tree||typeof tree!=='object')return[];return[...(predicate(tree)?[tree]:[]),...[tree.props?.children].flat(Infinity).flatMap(child=>nodes(child,predicate))];}
const button=(tree,label)=>nodes(tree,n=>n.type==='button'&&n.props.children===label)[0];
const text=tree=>typeof tree==='string'||typeof tree==='number'?String(tree):!tree||typeof tree!=='object'?'':[tree.props?.children].flat(Infinity).map(text).join(' ');
test('B03 missing-table error is cleared by reset, including feedback kind; other progress survives',async(t)=>{
 const previousWindow=globalThis.window,previousStorage=globalThis.localStorage;
 t.after(()=>{if(previousWindow===undefined)delete globalThis.window;else globalThis.window=previousWindow;if(previousStorage===undefined)delete globalThis.localStorage;else globalThis.localStorage=previousStorage;});
 const storage=new Map([['existing-b01-progress','preserve']]);globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 // This harness executes client effects, so supply the browser event contract too.
 const events=new EventTarget();globalThis.window={localStorage:globalThis.localStorage,addEventListener:events.addEventListener.bind(events),removeEventListener:events.removeEventListener.bind(events),dispatchEvent:events.dispatchEvent.bind(events)};
 render();let tree=render();nodes(tree,n=>n.type==='nav'&&n.props['aria-label']==='SQL 차시 선택')[0].props.children[2].props.onClick();tree=render();nodes(tree,n=>n.type==='select'&&n.props.id==='sql-question-picker')[0].props.onChange({target:{value:'B03-Q02'}});tree=render();nodes(tree,n=>n.type==='textarea'&&n.props.id==='sql-answer')[0].props.onChange({target:{value:'SELECT * FROM missing_table;'}});tree=render();await button(tree,'SQL 실행·검증').props.onClick();tree=render();assert.match(text(tree),/no such table: missing_table/);button(tree,'이 실습장 초기화').props.onClick();tree=render();button(tree,'기록 초기화').props.onClick();tree=render();assert.doesNotMatch(text(tree),/missing_table|실행 오류 원문/);assert.match(text(tree),/SQL 실행 통과\s+0\s*\/\s*25/);assert.equal(nodes(tree,n=>n.type==='textarea'&&n.props.id==='sql-answer')[0].props.value,'');assert.equal(nodes(tree,n=>n.props['data-testid']==='sql-feedback')[0].props['data-kind'],'');assert.equal(storage.get('existing-b01-progress'),'preserve');
});
