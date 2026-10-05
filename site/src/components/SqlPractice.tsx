import { useEffect, useRef, useState } from 'react';
import content from '../data/sql/lessons.json';
import { SQLPracticeEngine, SQLPracticeError, type SQLResult, type SQLTable } from '../lib/sql/client';
import { blankAnswer, freshPractice, selfChecklist, SQL_PROGRESS_KEY, validatePractice, type PracticeAnswer, type PracticeProgress } from '../lib/sql/progress';
import { mergeThreeWayMap, sameStoredValue } from '../lib/learning/threeWayMerge';

interface SmallStep { title: string; sql: string; expected_shape: string }
interface Question { id: string; title: string; task: string; type: string; sql?: string; solution?: string; hints: string[]; why: string; tables: string[]; checklist?: string[]; theory: string; theoryTitle: string; smallSteps: SmallStep[] }
interface Lesson { id: string; title: string; intro: string[]; tables: Record<string, SQLTable>; questions: Question[] }
const lessons = content.lessons as unknown as Lesson[];
const questions = lessons.flatMap((lesson) => lesson.questions);
const buttonClass = 'rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:bg-surface-elevated disabled:opacity-40';
const feedback = content.feedback;
function ResultTable({ result, label }: { result: SQLResult; label: string }) {
  return <div className="sql-table-scroll" tabIndex={0} role="region" aria-label={label}>
    <table><caption>{label} · {result.values.length}행</caption><thead><tr>{result.columns.map((column, index) => <th scope="col" key={index}>{column}</th>)}</tr></thead>
      <tbody>{result.values.map((row, index) => <tr key={index}>{row.map((value, col) => <td key={col} className={value === null ? 'sql-null' : ''}>{value === null ? 'NULL' : String(value)}</td>)}</tr>)}</tbody>
    </table>{result.values.length === 0 && <p className="p-3 text-sm text-text-secondary">조건에 맞는 행이 없습니다. 빈 결과도 하나의 결과입니다.</p>}
  </div>;
}
function Theory({ text }: { text: string }) {
  // Text nodes only. Markdown-looking source is never interpreted as HTML.
  return <div className="space-y-3 text-sm leading-relaxed text-text-secondary">{text.split(/(```[\s\S]*?```)/).map((part, index) => part.startsWith('```')
    ? <pre key={index} className="overflow-x-auto rounded-lg bg-background p-3 text-xs text-white"><code>{part.replace(/^```(?:sql)?\n?/, '').replace(/```$/, '').trim()}</code></pre>
    : part.split(/\n\n+/).filter(Boolean).map((paragraph, i) => <p className="whitespace-pre-wrap" key={`${index}-${i}`}>{paragraph}</p>))}</div>;
}
function readStoredPractice(): PracticeProgress {
  const raw = localStorage.getItem(SQL_PROGRESS_KEY);
  if (!raw) return freshPractice();
  if (raw.length > 500000) throw new Error('저장된 기록이 너무 큽니다.');
  return validatePractice(JSON.parse(raw), questions);
}
function mergePractice(base: PracticeProgress, local: PracticeProgress, remote: PracticeProgress) {
  const answers = mergeThreeWayMap(base.answers, local.answers, remote.answers);
  const stored: PracticeProgress = { ...remote, current: local.current, answers: answers.value };
  const baseline: PracticeProgress = { ...remote, answers: answers.baseline };
  const displayAnswers = { ...answers.value };
  for (const id of answers.conflicts) {
    if (Object.prototype.hasOwnProperty.call(local.answers, id)) displayAnswers[id] = local.answers[id];
  }
  return { stored, baseline, display: { ...stored, answers: displayAnswers }, conflicts: answers.conflicts };
}
export default function SqlPractice() {
  const [state, setState] = useState<PracticeProgress>(freshPractice);
  const stateRef = useRef(state);
  const baselineRef = useRef<PracticeProgress>(freshPractice());
  const conflictRemoteRef = useRef<Record<string, PracticeAnswer | null>>({});
  const [conflictedIds, setConflictedIds] = useState<string[]>([]);
  const engine = useRef<SQLPracticeEngine | null>(null);
  const generation = useRef(0);
  const blocked = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [saveLabel, setSaveLabel] = useState('이 브라우저에만 저장합니다.');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeKind, setNoticeKind] = useState('');
  const [result, setResult] = useState<SQLResult | null>(null);
  const [resultLabel, setResultLabel] = useState('실행 결과');
  const [fixture, setFixture] = useState(0);
  const [hints, setHints] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);
  const [engineDetail, setEngineDetail] = useState('');
  useEffect(() => {
    engine.current = new SQLPracticeEngine();
    try {
      const raw = localStorage.getItem(SQL_PROGRESS_KEY);
      if (raw) {
        if (raw.length > 500000) throw new Error('저장된 기록이 너무 큽니다.');
        const restored = validatePractice(JSON.parse(raw), questions);
        baselineRef.current = restored; stateRef.current = restored; setState(restored); setSaveLabel('저장된 답안과 진도를 복구했습니다. 통과 표시는 이전 실행 기록입니다.');
      }
    } catch (error) {
      blocked.current = true;
      setSaveLabel(`기존 기록을 읽지 못해 보존했습니다. 새 기록으로 덮어쓰지 않습니다. ${error instanceof Error ? error.message : ''} 아래 초기화는 이 실습장의 기록만 지웁니다.`);
    }
    setLoaded(true);
    const onStorage = (event: StorageEvent) => {
      if (event.key === null) {
        blocked.current = true;
        setSaveLabel('다른 탭에서 브라우저 저장 자료가 지워졌습니다. 현재 답안은 이 탭에 유지되며 새로고침하면 사라질 수 있습니다.');
        return;
      }
      if (event.key !== SQL_PROGRESS_KEY) return;
      try {
        const remote = readStoredPractice();
        const merged = mergePractice(baselineRef.current, stateRef.current, remote);
        baselineRef.current = merged.baseline;
        stateRef.current = merged.display; setState(merged.display);
        conflictRemoteRef.current = Object.fromEntries(merged.conflicts.map((id) => [id, remote.answers[id] || null]));
        setConflictedIds(merged.conflicts);
        setSaveLabel(merged.conflicts.length
          ? '같은 문제를 다른 탭에서 다르게 고쳤습니다. 이 탭의 답안을 유지했습니다. 저장할 값을 선택하세요.'
          : '다른 탭의 답안 변경을 불러왔습니다.');
      } catch {
        blocked.current = true;
        setSaveLabel('다른 탭의 저장 형식을 읽지 못해 기존 값을 보존했습니다. 이 탭의 답안은 유지됩니다.');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => { generation.current++; engine.current?.cancel(); window.removeEventListener('storage', onStorage); };
  }, []);
  const question = questions.find((q) => q.id === state.current) || questions[0];
  const lesson = lessons.find((l) => l.questions.some((q) => q.id === question.id))!;
  const answer = state.answers[question.id] || blankAnswer();
  const sqlCount = questions.filter((q) => q.type === 'sql').length;
  const passed = questions.filter((q) => q.type === 'sql' && state.answers[q.id]?.status === 'pass').length;
  const reviewed = questions.filter((q) => q.type !== 'sql' && state.answers[q.id]?.status === 'reviewed').length;
  const totalFixtures = 1 + Object.values(lesson.tables)[0].fixtures.length;
  const rubric = selfChecklist(question);
  const updateState = (next: PracticeProgress) => {
    stateRef.current = next; setState(next);
    if (blocked.current) return;
    try {
      const remote = readStoredPractice();
      const merged = mergePractice(baselineRef.current, next, remote);
      localStorage.setItem(SQL_PROGRESS_KEY, JSON.stringify(merged.stored));
      baselineRef.current = merged.baseline;
      stateRef.current = merged.display; setState(merged.display);
      conflictRemoteRef.current = Object.fromEntries(merged.conflicts.map((id) => [id, remote.answers[id] || null]));
      setConflictedIds(merged.conflicts);
      setSaveLabel(merged.conflicts.length
        ? '같은 문제를 다른 탭에서 다르게 고쳤습니다. 이 탭의 답안을 유지했습니다. 저장할 값을 선택하세요.'
        : '이 브라우저에 저장했습니다. 새로고침 후 이어갈 수 있습니다.');
    } catch { setSaveLabel('브라우저 저장이 막혀 있습니다. 이 화면을 닫으면 새 답안이 사라질 수 있습니다.'); }
  };
  const resolveQuestionConflict = (id: string, keepLocal: boolean) => {
    const current = stateRef.current;
    const localAnswer = current.answers[id];
    const priorBaseline = baselineRef.current;
    const unresolved = conflictedIds.filter((value) => value !== id);
    try {
      const remote = readStoredPractice();
      if (keepLocal) {
        const expected = conflictRemoteRef.current[id] || null;
        const latest = remote.answers[id] || null;
        if (!sameStoredValue(latest, expected)) {
          conflictRemoteRef.current[id] = latest;
          setSaveLabel('선택을 처리하는 동안 다른 탭에서 답이 바뀌었습니다. 최신 저장값을 다시 확인해 선택하세요.');
          return;
        }
        const answers = { ...remote.answers };
        if (localAnswer) answers[id] = localAnswer; else delete answers[id];
        const stored = { ...remote, current: current.current, answers };
        localStorage.setItem(SQL_PROGRESS_KEY, JSON.stringify(stored));
        const baselineAnswers = { ...stored.answers };
        const displayAnswers = { ...stored.answers };
        for (const unresolvedId of unresolved) {
          if (Object.prototype.hasOwnProperty.call(priorBaseline.answers, unresolvedId)) baselineAnswers[unresolvedId] = priorBaseline.answers[unresolvedId];
          else delete baselineAnswers[unresolvedId];
          if (Object.prototype.hasOwnProperty.call(current.answers, unresolvedId)) displayAnswers[unresolvedId] = current.answers[unresolvedId];
        }
        baselineRef.current = { ...stored, answers: baselineAnswers };
        stateRef.current = { ...stored, answers: displayAnswers }; setState(stateRef.current);
        setSaveLabel('내 답안을 저장했습니다.');
      } else {
        const displayAnswers = { ...remote.answers };
        const baselineAnswers = { ...remote.answers };
        for (const unresolvedId of unresolved) {
          if (Object.prototype.hasOwnProperty.call(priorBaseline.answers, unresolvedId)) baselineAnswers[unresolvedId] = priorBaseline.answers[unresolvedId];
          else delete baselineAnswers[unresolvedId];
          if (Object.prototype.hasOwnProperty.call(current.answers, unresolvedId)) displayAnswers[unresolvedId] = current.answers[unresolvedId];
        }
        baselineRef.current = { ...remote, answers: baselineAnswers };
        const adopted = { ...remote, current: current.current, answers: displayAnswers };
        stateRef.current = adopted; setState(adopted);
        setSaveLabel('저장된 답안을 사용했습니다.');
      }
      delete conflictRemoteRef.current[id];
      setConflictedIds((values) => values.filter((value) => value !== id));
    } catch {
      setSaveLabel('답안을 저장하지 못했습니다. 현재 답안은 이 탭에 유지됩니다. 새로고침하면 사라질 수 있습니다.');
    }
  };
  const saveAnswer = (id: string, value: PracticeAnswer) => updateState({ ...stateRef.current, answers: { ...stateRef.current.answers, [id]: value } });
  const stop = () => { generation.current++; engine.current?.cancel(); setBusy(false); };
  const navigate = (id: string) => {
    stop(); updateState({ ...stateRef.current, current: id });
    setFixture(0); setHints(0); setResult(null); setNotice(''); setEngineDetail('');
  };
  const changeAnswer = (text: string) => {
    stop(); setResult(null); setNotice('');
    saveAnswer(question.id, { ...answer, text, status: 'draft', verifiedAt: undefined });
  };
  const execute = async (query: string, preview = false) => {
    if (!loaded || busy) return;
    const token = ++generation.current;
    const id = question.id;
    setBusy(true); setResult(null); setEngineDetail(''); setNoticeKind('');
    setNotice(preview ? '기본 표에서 작은 SQL 조각을 실행합니다. 답안과 진도는 바꾸지 않습니다.' : `기본·추가 데이터 ${totalFixtures}묶음에서 결과를 확인합니다.`);
    try {
      const reply = await engine.current!.run(lesson.tables, query, question.sql || '', preview);
      if (token !== generation.current) return;
      setResult(reply.result); setResultLabel(preview ? '작은 단계 미리보기 · 진도에 반영하지 않음' : '내 SQL의 기본 데이터 결과');
      if (preview) { setNotice('미리보기 실행을 마쳤습니다. 아래 답안과 통과 기록은 그대로입니다.'); return; }
      saveAnswer(id, { ...(stateRef.current.answers[id] || blankAnswer()), text: query, status: reply.pass ? 'pass' : 'mismatch', verifiedAt: reply.pass ? new Date().toISOString() : undefined });
      setNoticeKind(reply.pass ? 'pass' : 'mismatch');
      setNotice(reply.pass ? `${feedback.correct} 기본·추가 ${reply.checks.length}묶음 모두 일치했습니다.`
        : `${feedback.result_mismatch} ${reply.checks.filter(Boolean).length}/${reply.checks.length}묶음 일치. ${reply.checks[0] ? '기본 표에서는 맞았지만 추가 표에서 달랐습니다. 상수 답안, 중복, NULL, 분모를 확인해 보세요.' : '요청한 열 순서와 각 행의 값·중복 수를 확인해 보세요.'}`);
    } catch (error) {
      if (token !== generation.current) return;
      const kind = error instanceof SQLPracticeError ? error.kind : 'environment';
      setNoticeKind(kind);
      setNotice(kind === 'syntax' ? feedback.syntax_error : kind === 'scope' ? '이 연습은 SELECT 또는 WITH 조회 한 문장만 실행합니다. 표를 바꾸는 명령은 사용할 수 없습니다.' : error instanceof Error ? error.message : '실행 환경을 확인해 주세요.');
      setEngineDetail(error instanceof Error ? error.message : String(error));
      if (!preview) saveAnswer(id, { ...(stateRef.current.answers[id] || blankAnswer()), text: query, status: 'error', verifiedAt: undefined });
    } finally { if (token === generation.current) setBusy(false); }
  };
  const reset = () => {
    stop(); const fresh = freshPractice();
    try { localStorage.removeItem(SQL_PROGRESS_KEY); blocked.current = false; baselineRef.current = fresh; conflictRemoteRef.current = {}; setConflictedIds([]); setSaveLabel('이 실습장의 새 기록만 초기화했습니다. 기존 B01/B02 진행표와 다른 저장 키는 그대로입니다.'); }
    catch { setSaveLabel('브라우저 저장 기록을 지우지 못했습니다. 화면의 임시 기록만 초기화했습니다.'); }
    stateRef.current = fresh; setState(fresh); setNotice(''); setNoticeKind(''); setEngineDetail(''); setResultLabel('실행 결과'); setResult(null); setHints(0); setFixture(0); setConfirmReset(false);
  };
  return <div className="sql-practice">
    <header className="mb-6 space-y-3">
      <p className="text-sm text-primary">직접 실행하며 배우는 SQL · B01~B03</p>
      <h1 className="text-3xl font-bold text-white">표를 보고, 작은 SQL부터</h1>
      <p className="text-text-secondary">무료 · 로그인과 API 키 없이 이 브라우저에서 실행합니다. 답안을 외부 채점 서버로 보내지 않습니다.</p>
      <p className="text-sm text-text-secondary">기존 B01/B02 학습 진행표와 별도의 연습 기록입니다. 힌트·예시 보기에는 감점이 없고, 원하는 곳에서 쉬었다 이어가도 됩니다.</p>
      <div className="flex flex-wrap items-center gap-3 text-sm" data-testid="sql-progress"><span>SQL 실행 통과 {passed}/{sqlCount}</span><span>서술 자기 점검 {reviewed}/4</span><button className={buttonClass} onClick={() => setConfirmReset(true)} disabled={!loaded}>이 실습장 초기화</button></div>
      <p className="text-xs text-text-secondary" role="status">{saveLabel}</p>
      {conflictedIds.map((id) => <div key={id} role="alert" aria-live="assertive" className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm"><p>{questions.find((item) => item.id === id)?.title || id}: 두 탭에서 서로 다른 답을 입력했습니다. 이 탭의 답안은 그대로 유지됩니다. 어느 값을 사용할지 선택하세요.</p><div className="mt-2 flex flex-wrap gap-2"><button type="button" className={buttonClass} onClick={() => resolveQuestionConflict(id, true)}>내 답안 저장</button><button type="button" className={buttonClass} onClick={() => resolveQuestionConflict(id, false)}>저장된 답안 사용</button></div></div>)}
      {confirmReset && <div className="rounded-lg border border-border p-3 text-sm"><p>이 실습장에서 쓴 답안·메모·통과 기록을 지울까요? 기존 학습 진행표와 다른 실습장의 기록은 지우지 않습니다.</p><div className="mt-2 flex gap-2"><button className={buttonClass} onClick={reset}>기록 초기화</button><button className={buttonClass} onClick={() => setConfirmReset(false)}>취소</button></div></div>}
    </header>
    <nav aria-label="SQL 차시 선택" className="mb-4 grid gap-2 sm:grid-cols-3">{lessons.map((l) => <button key={l.id} className={`${buttonClass} text-left ${l.id === lesson.id ? 'border-primary text-primary' : ''}`} aria-current={l.id === lesson.id ? 'step' : undefined} onClick={() => navigate(l.questions[0].id)} disabled={!loaded}><strong>{l.id}</strong><span className="block">{l.title}</span></button>)}</nav>
    <label className="mb-4 block text-sm" htmlFor="sql-question-picker">풀어 볼 문제<select id="sql-question-picker" className="mt-2 block w-full rounded-lg border border-border bg-surface p-3" value={question.id} onChange={(event) => navigate(event.target.value)} disabled={!loaded}>{lesson.questions.map((q) => <option value={q.id} key={q.id}>{q.id} · {q.title}{state.answers[q.id]?.status === 'pass' ? ' · SQL 통과 기록' : state.answers[q.id]?.status === 'reviewed' ? ' · 자기 점검 기록' : ''}</option>)}</select></label>
    <details className="mb-5 rounded-lg border border-border p-3"><summary className="cursor-pointer text-sm">{lesson.id}의 전체 목표와 데이터 약속</summary><div className="mt-3 space-y-2 text-sm text-text-secondary">{lesson.intro.map((text, index) => <p key={index}>{text}</p>)}</div></details>
    <div className="sql-workspace">
      <aside className="sql-data-panel" aria-label="문제 옆 데이터 표">
        <h2 className="mb-2 text-lg font-bold">문제 옆 데이터</h2>
        <label className="mb-3 block text-sm">표 데이터<select className="mt-2 block w-full rounded-lg border border-border bg-surface p-2" value={fixture} onChange={(event) => setFixture(Number(event.target.value))}><option value={0}>기본 데이터</option>{Array.from({ length: totalFixtures - 1 }, (_, i) => <option key={i} value={i + 1}>추가 검증 {i + 1}</option>)}</select></label>
        <p className="mb-4 text-xs text-text-secondary">모두 학습용 합성 데이터입니다. 표시할 표를 바꿔도 답안과 진도는 바뀌지 않으며 SQL 채점은 모든 묶음에서 합니다.</p>
        {Object.entries(lesson.tables).filter(([name]) => question.tables.includes(name)).map(([name, table]) => <section key={name} className="mb-5 min-w-0"><h3 className="mb-2 font-mono font-bold text-primary">{name}</h3><p className="mb-3 text-sm text-text-secondary">한 행 = {name === 'play_attempts' ? '시도 한 번' : name === 'raw_events' ? '수집기가 받은 수신 기록 한 건' : '수신된 활동·이벤트 기록 한 건'}</p>
          <details className="mb-3" open><summary className="cursor-pointer text-sm">컬럼 의미</summary><dl className="mt-2 grid gap-2 text-xs">{table.cols.map((column, i) => <div key={column}><dt className="font-mono text-white">{column}</dt><dd className="text-text-secondary">{table.desc[i]}</dd></div>)}</dl></details>
          <ResultTable result={{ columns: table.cols, values: fixture === 0 ? table.rows : table.fixtures[fixture - 1] }} label={`${name} · ${fixture === 0 ? '기본' : '추가 검증 '+fixture}`} />
        </section>)}
      </aside>
      <section className="min-w-0" aria-labelledby="sql-problem-title">
        <p className="mb-2 text-sm text-primary">{question.id} · {question.type === 'sql' ? 'SQL 실행 검증' : '서술형 자기 점검'}</p>
        <h2 id="sql-problem-title" className="mb-4 text-2xl font-bold">{question.title}</h2>
        <section className="mb-5 rounded-xl border border-primary/30 bg-primary/5 p-4" aria-label="문제 앞 짧은 이론"><h3 className="mb-3 font-bold">먼저 읽기 · {question.theoryTitle}</h3><Theory text={question.theory} />
          {question.smallSteps.map((step, i) => <details key={i} className="mt-3 rounded-lg border border-border p-3"><summary className="cursor-pointer text-sm">작은 단계 · {step.title}</summary><p className="my-2 text-xs text-text-secondary">{step.expected_shape}</p><pre className="overflow-x-auto text-xs"><code>{step.sql}</code></pre><button className={`${buttonClass} mt-3`} disabled={!loaded || busy} onClick={() => execute(step.sql, true)}>작은 SQL 미리보기 {i+1}</button><p className="mt-2 text-xs text-text-secondary">답안 입력과 통과 기록에 반영하지 않습니다.</p></details>)}
        </section>
        <div className="mb-4 rounded-lg bg-surface p-4"><h3 className="mb-2 font-bold">이번 문제</h3><p className="text-sm leading-relaxed text-text-secondary">{question.task}</p></div>
        {question.id === 'B03-Q08' && <ResultTable result={{ columns: ['ingest_id','event_id','user_id','attempt_id','event_name'], values: [[31,'conflict','uX','aX','ready'],[32,'conflict','uX','aX','fail']] }} label="Q08만의 충돌 가정 · 정상 SQL 채점과 별도" />}
        <label htmlFor="sql-answer" className="block text-sm font-bold">{question.type === 'sql' ? '직접 SQL을 써 보세요' : '내 생각을 문장으로 적어 보세요'}</label>
        <textarea id="sql-answer" spellCheck={false} className="my-2 w-full rounded-lg border border-border bg-background p-3 font-mono text-sm text-white" rows={9} maxLength={12000} value={answer.text} onChange={(event) => changeAnswer(event.target.value)} onKeyDown={(event) => { if (question.type === 'sql' && (event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); execute(answer.text); } }} disabled={!loaded} />
        <p className="mb-3 text-xs text-text-secondary">{question.type === 'sql' ? '조회 한 문장 · 3초 · 300행 · 입력 12,000자 · 셀 5,000자. 별칭·행 순서는 무시하고 열 위치·값·자료형·중복 수를 비교합니다. 정렬은 읽기 편하게 연습해 보세요.' : feedback.reflection}</p>
        {question.type === 'sql' ? <div className="mb-4 flex flex-wrap gap-2"><button className="rounded-lg bg-primary px-4 py-2 font-bold text-background disabled:opacity-40" onClick={() => execute(answer.text)} disabled={!loaded || busy || !answer.text.trim()}>{busy ? '실행 중…' : 'SQL 실행·검증'}</button>{busy && <button className={buttonClass} onClick={() => { stop(); setNotice('실행을 중단했습니다. 답안은 남아 있습니다.'); }}>실행 중단</button>}</div>
          : <div className="mb-4 space-y-2">{rubric.map((label, index) => <label key={index} className="flex items-start gap-2 text-sm"><input type="checkbox" checked={answer.checks[index] || false} onChange={(event) => { const checks = rubric.map((_, i) => i === index ? event.target.checked : answer.checks[i] || false); saveAnswer(question.id, { ...answer, checks, status: 'draft' }); }} />{label}</label>)}<button className={buttonClass} disabled={!loaded || !answer.text.trim() || !rubric.every((_, i) => answer.checks[i])} onClick={() => { saveAnswer(question.id, { ...answer, status: 'reviewed' }); setNotice('자기 점검을 기록했습니다. SQL 통과나 공식 학습 완료로 표시하지 않습니다.'); }}>자기 점검 기록</button></div>}
        {answer.status === 'pass' && <p className="mb-3 text-sm text-success">저장된 SQL 통과 기록 · {answer.verifiedAt ? new Date(answer.verifiedAt).toLocaleString('ko-KR') : '이전 실행'} · 답안을 바꾸면 다시 검증합니다.</p>}
        {answer.status === 'reviewed' && <p className="mb-3 text-sm text-primary">저장된 자기 점검 기록 · 자동 정답 판정은 아닙니다.</p>}
        <div aria-live="polite" role="status" className={`mb-4 rounded-lg p-3 text-sm ${notice ? 'border border-border bg-surface' : ''}`} data-testid="sql-feedback" data-kind={noticeKind}>{notice}</div>
        {engineDetail && <details className="mb-4 text-xs"><summary>실행 오류 원문</summary><pre className="mt-2 whitespace-pre-wrap break-words">{engineDetail}</pre></details>}
        {result && <div className="mb-5"><ResultTable result={result} label={resultLabel} /></div>}
        <div className="mb-4 rounded-lg border border-border p-3"><p className="mb-2 text-xs text-text-secondary">{feedback.hint}</p>{question.hints.slice(0,hints).map((hint,index) => <p className="my-2 text-sm" key={index}>힌트 {index+1} · {hint}</p>)}<button className={buttonClass} disabled={hints >= question.hints.length} onClick={() => setHints(hints+1)}>힌트 {Math.min(hints+1,question.hints.length)} 보기</button></div>
        <details className="mb-4 rounded-lg border border-border p-3"><summary className="cursor-pointer text-sm">예시 답과 해설 · 보고 연습해도 괜찮아요</summary><div className="mt-3 space-y-3 text-sm text-text-secondary"><pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs text-white">{question.sql || question.solution}</pre><p>{question.why}</p>{question.sql && <button className={buttonClass} onClick={() => changeAnswer(question.sql!)}>예시 SQL을 입력창에 넣기</button>}</div></details>
        <label className="mb-4 block text-sm">내 메모 · 자동 채점하지 않음<textarea className="mt-2 block w-full rounded-lg border border-border bg-background p-3 text-sm" rows={3} maxLength={4000} value={answer.notes} onChange={(event) => saveAnswer(question.id, { ...answer, notes: event.target.value })} /></label>
        <nav aria-label="SQL 문제 이동" className="flex justify-between gap-2"><button className={buttonClass} disabled={questions.indexOf(question)===0} onClick={() => navigate(questions[questions.indexOf(question)-1].id)}>이전 문제</button><button className={buttonClass} disabled={questions.indexOf(question)===questions.length-1} onClick={() => navigate(questions[questions.indexOf(question)+1].id)}>다음 문제</button></nav>
      </section>
    </div>
    <p className="mt-6 text-xs text-text-secondary">원본 v3의 B01~B03 문제를 유지하고 설명·추가 검증을 보완한 제안본입니다. SQL은 SQLite를 쓰며 기존 공식 학습 진행표를 수정하지 않습니다. <a href="/sql/SQL-JS-LICENSE.txt" className="text-primary underline">SQL.js 라이선스</a></p>
  </div>;
}
