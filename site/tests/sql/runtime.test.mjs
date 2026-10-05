// @ts-nocheck
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Worker } from 'node:worker_threads';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { LIMITS, equal, scope } from '../../src/lib/sql/contracts.js';
const lessons = JSON.parse(readFileSync(new URL('../../src/data/sql/lessons.json', import.meta.url), 'utf8')).lessons;
const wasm = readFileSync(new URL('../../public/sql/sqlite.wasm', import.meta.url));
class BrowserWorker {
 constructor() {this.worker=new Worker(new URL('./worker-adapter.mjs',import.meta.url));this.worker.on('message',data=>this.onmessage?.({data}));this.worker.on('error',error=>this.onerror?.(error));}
 postMessage(data){this.worker.postMessage(data);} terminate(){this.worker.terminate();}
}
const temp=mkdtempSync(join(tmpdir(),'choorai-sql-tests-'));
for(const name of ['client','progress'])writeFileSync(join(temp,`${name}.mjs`),ts.transpileModule(readFileSync(new URL(`../../src/lib/sql/${name}.ts`,import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText);
const {SQLPracticeEngine,classifySQLError}=await import(pathToFileURL(join(temp,'client.mjs')));
const {SQL_PROGRESS_KEY,freshPractice,blankAnswer,validatePractice}=await import(pathToFileURL(join(temp,'progress.mjs')));
globalThis.Worker=BrowserWorker;globalThis.fetch=async()=>new Response(wasm,{status:200});
const find=id=>{const lesson=lessons.find(l=>l.questions.some(q=>q.id===id));return {lesson,question:lesson.questions.find(q=>q.id===id)};};
let executions=0;
async function run(id,sql){const {lesson,question}=find(id);const engine=new SQLPracticeEngine();try{const result=await engine.run(lesson.tables,sql||question.sql,question.sql);executions+=result.checks.length;return result;}finally{engine.cancel();}}
test('actual embedded SQLite Worker: all 25 reference questions on 99 basic and added fixture executions',async()=>{
 let count=0;for(const lesson of lessons)for(const question of lesson.questions.filter(q=>q.type==='sql')){assert.ok((await run(question.id)).pass,question.id);count++;}assert.equal(count,25);assert.equal(executions,99);
});
test('comparison preserves duplicates, NULL, types, columns and tolerance; accepts alias/order equivalence',()=>{
 const r=(values,columns=['a','b'])=>({columns,values});
 assert.ok(equal(r([[1,null],[2,'x']]),r([[2,'x'],[1,null]],['other','alias'])));
 for(const [a,b]of [[[[1,null],[1,null]],[[1,null],[2,null]]],[[[1,null]],[[1,0]]],[[[1,'2']],[['1',2]]],[[[1,2]],[[2,1]]]])assert.equal(equal(r(a),r(b)),false);
 assert.ok(equal(r([[1,2]]),r([[1+1e-9,2]])));
 assert.ok(equal({columns:['x'],values:[[1e-8],[0]]},{columns:['x'],values:[[0],[2e-8]]}));
});
test('equivalent DISTINCT/GROUP BY, COUNT NULL and denominator forms pass',async()=>{
 for(const [id,sql]of [
 ['B01-Q05','SELECT event_name FROM events GROUP BY event_name;'],
 ['B01-Q07',"SELECT COUNT(*) FROM (SELECT user_id FROM events WHERE event_name='click' GROUP BY user_id);"],
 ['B02-Q03','SELECT COUNT(*), SUM(CASE WHEN ready_ms IS NOT NULL THEN 1 ELSE 0 END), SUM(CASE WHEN ready_ms IS NULL THEN 1 ELSE 0 END) FROM play_attempts;'],
 ['B02-Q05',"SELECT platform, COUNT(*), COUNT(CASE WHEN status='success' THEN 1 END), ROUND(100.0*AVG(CASE WHEN status='success' THEN 1 ELSE 0 END),1) FROM play_attempts GROUP BY platform;"],
 ['B03-Q01','SELECT user_id FROM raw_events GROUP BY user_id;'],
 ['B03-Q02',"SELECT user_id, attempt_id FROM raw_events WHERE event_name='click' GROUP BY user_id, attempt_id;"]
 ])assert.ok((await run(id,sql)).pass,id);
});
test('counterexamples reject lost duplicates, NULL=0, changed denominator, constants and concatenated attempt keys',async()=>{
 for(const [id,sql]of [
 ['B01-Q05','SELECT event_name FROM events;'],
 ['B02-Q03','SELECT COUNT(*), COUNT(COALESCE(ready_ms,0)), 0 FROM play_attempts;'],
 ['B02-Q05',"SELECT platform, COUNT(*), COUNT(*), 100.0 FROM play_attempts WHERE status='success' GROUP BY platform;"],
 ['B01-Q06','SELECT 4;'],
 ['B03-Q06',"SELECT COUNT(*), COUNT(DISTINCT event_id), COUNT(DISTINCT user_id || ':' || attempt_id), COUNT(DISTINCT user_id) FROM raw_events;"]
 ]){const reply=await run(id,sql);assert.equal(reply.pass,false,id);if(id==='B01-Q06')assert.ok(reply.checks[0]);if(id==='B03-Q06'){assert.ok(reply.checks.slice(0,3).every(Boolean));assert.ok(reply.checks.slice(3).some(c=>!c));}}
});
test('13 small-step previews execute without claiming pass or producing progress writes',async()=>{
 const engine=new SQLPracticeEngine();let count=0;try{for(const lesson of lessons)for(const question of lesson.questions)for(const step of question.smallSteps){const reply=await engine.run(lesson.tables,step.sql,'',true);assert.equal(reply.pass,false);assert.deepEqual(reply.checks,[]);assert.ok(reply.result.columns.length);count++;}assert.equal(count,13);}finally{engine.cancel();}
});
test('query-only scope rejects mutation/multiple SQL/syntax and enforces input/row/cell/BLOB bounds',async()=>{
 const {lesson,question}=find('B01-Q01');const engine=new SQLPracticeEngine();try{
 for(const sql of ['DELETE FROM events;','PRAGMA query_only=OFF;','WITH x AS (SELECT 1) DELETE FROM events;','SELECT * FROM events; SELECT * FROM events;','SELECT platform COUNT(*) FROM events GROPU BY platform;','SELECT zeroblob(999);',"SELECT printf('%06000d',1);",'WITH RECURSIVE x(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM x WHERE n<301) SELECT n FROM x;'])await assert.rejects(engine.run(lesson.tables,sql,question.sql),undefined,sql);
 assert.ok((await engine.run(lesson.tables,question.sql,question.sql)).pass);assert.throws(()=>scope('SELECT 1;\0'));assert.throws(()=>scope('SELECT '+'x'.repeat(LIMITS.query)));
 assert.equal(classifySQLError('near "GROPU": syntax error'),'syntax');assert.equal(classifySQLError('결과가 300행을 넘었습니다.'),'limit');assert.equal(classifySQLError('attempt to write a readonly database'),'scope');
 }finally{engine.cancel();}
});
test('3-second timeout kills runaway Worker; restart and five repeat runs succeed',async()=>{
 const {lesson,question}=find('B01-Q01');const engine=new SQLPracticeEngine();try{await assert.rejects(engine.run(lesson.tables,'WITH RECURSIVE x(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM x) SELECT SUM(n) FROM x;',question.sql),/3초/);for(let i=0;i<5;i++)assert.ok((await engine.run(lesson.tables,question.sql,question.sql)).pass);}finally{engine.cancel();}
});
test('cancel rejects pending result; independent local progress validates pass/self-review and corrupted records',async()=>{
 const {lesson,question}=find('B01-Q01');const engine=new SQLPracticeEngine();const pending=engine.run(lesson.tables,'WITH RECURSIVE x(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM x) SELECT SUM(n) FROM x;',question.sql);setTimeout(()=>engine.cancel(),100);await assert.rejects(pending,/중단/);
 const qs=lessons.flatMap(l=>l.questions),state=freshPractice();state.answers['B01-Q01']={...blankAnswer(),text:'SELECT * FROM events;',status:'pass',verifiedAt:new Date().toISOString()};assert.deepEqual(validatePractice(JSON.parse(JSON.stringify(state)),qs),state);assert.notEqual(SQL_PROGRESS_KEY,'curo-data-beginner12-v3');assert.notEqual(SQL_PROGRESS_KEY,'curo-sql-b01-v1');
 const bad=structuredClone(state);bad.answers['B01-Q01'].status='reviewed';assert.throws(()=>validatePractice(bad,qs));
 const self=structuredClone(state);self.answers['B02-Q06']={...blankAnswer(),text:'분모와 실패를 함께 봅니다.',status:'reviewed',checks:find('B02-Q06').question.checklist.map(()=>true)};assert.equal(validatePractice(self,qs).answers['B02-Q06'].status,'reviewed');
 assert.throws(()=>validatePractice({version:1,current:'B01-Q01',answers:{'B01-Q01':{...blankAnswer(),text:'x'.repeat(12001)}}},qs));
});
test('SQLite engine version is actually measured; sql.js package version is not guessed',async()=>{
 const engine=new SQLPracticeEngine();try{const reply=await engine.run(find('B01-Q01').lesson.tables,'SELECT sqlite_version();','',true);console.log('Measured embedded SQLite:',reply.result.values[0][0]);assert.equal(reply.result.values[0][0],'3.49.1');}finally{engine.cancel();}
});
process.on('exit',()=>rmSync(temp,{recursive:true,force:true}));
test('review pack: 26 equivalent and 32 wrong SQL candidates, 99 frozen results and 25 independent checks',async()=>{
 const vectors=JSON.parse(readFileSync(new URL('./review-vectors.json',import.meta.url),'utf8'));
 for(const c of vectors.candidates)assert.equal((await run(c.question_id,c.sql)).pass,c.kind==='equivalent',c.id);
 assert.equal(vectors.candidates.filter(c=>c.kind==='equivalent').length,26);assert.equal(vectors.candidates.filter(c=>c.kind==='wrong').length,32);
 const fixtureIndex=id=>id.startsWith('source-')?Number(id.slice(7)):Number(id.slice(-1))+2;
 for(const v of [...vectors.frozen,...vectors.independent]){
  const {lesson,question}=find(v.question_id),index=fixtureIndex(v.fixture_id);
  const tables=Object.fromEntries(Object.entries(lesson.tables).map(([name,t])=>[name,{...t,rows:index===0?t.rows:t.fixtures[index-1],fixtures:[]}]));
  const engine=new SQLPracticeEngine();try{const reply=await engine.run(tables,question.sql,'',true);assert.ok(equal(reply.result,{columns:v.columns||reply.result.columns,values:v.rows||v.expected_rows}),v.id||`${v.question_id}/${v.fixture_id}`);}finally{engine.cancel();}
 }
});
