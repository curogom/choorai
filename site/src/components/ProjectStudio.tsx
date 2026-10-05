import { useEffect, useRef, useState } from 'react';
import pathData from '../data/projects/memoPath.json';
import {
  checkCounterVariation, checkMemoGuard, executeMemoProgram, parseMemoProgram,
  runMemoInputHandler, type ProgramCheck,
} from '../lib/learning/memoProgram';
import {
  appendProgramNote, createProgramExport, draftProgram,
  markStorageUnavailable, persistCurrentProgress, PROJECT_OUTPUT_KEY, LEARNING_PROGRESS_KEY,
  reconcileLearningProgress,
  readLearningProgress, recordVerification, resetLearningProgress,
  resetLearningProgressInSession, restoreWorkspace, saveMemoOutput,
  validateMemoOutput, visitStep,
  type LearningPathShape, type ProgressRead, type SavedMemoApp,
} from '../lib/learning/projectProgress';

type Locale = 'ko' | 'en';
type Localized = { ko: string; en: string };
type Step = { id: string; time: string; requires?: string[]; title: Localized; goal: Localized; action: Localized; expected: Localized; hint: Localized; recovery: Localized };
type MemoPath = { id: string; version: number; title: Localized; goal: Localized; estimatedMinutes: number; environment: { requirements: Record<Locale, string[]>; cost: Localized; scope: Localized }; startingFile: { name: string; starterTitle: string; contents: string }; steps: Step[]; completion: { required: string[] }; next: Localized };
const course = pathData as unknown as MemoPath;
const shape = course as unknown as LearningPathShape;
const t = (value: Localized, locale: Locale) => value[locale];
const persistenceMessages = {
  ko: {
    clear: '다른 탭에서 브라우저 저장 자료가 지워졌습니다. 이 탭의 코드와 단계는 유지되지만 새로고침하면 작업이 사라질 수 있습니다.',
    outputInvalid: '다른 탭에서 저장한 메모 파일을 읽지 못했습니다. 현재 편집기와 단계는 유지했습니다.',
    conflict: '다른 탭에서 같은 프로젝트 항목을 다르게 저장했습니다. 이 탭의 초안은 유지했습니다. 저장할 값을 선택하세요.',
    saveMine: '내 초안 저장', useSaved: '저장된 값 사용', mineSaved: '내 초안을 저장했습니다.', savedChosen: '저장된 값을 사용했습니다.',
  },
  en: {
    clear: 'Browser data was cleared in another tab. This tab keeps its code and step, but refreshing may lose the work.',
    outputInvalid: 'A memo file saved in another tab could not be read. The current editor and step were kept.',
    conflict: 'Another tab saved a different value for this project item. This tab kept your draft. Choose which value to keep.',
    saveMine: 'Save my draft', useSaved: 'Use saved value', mineSaved: 'Your draft was saved.', savedChosen: 'The saved value is now in this tab.',
  },
} as const;
const button = 'rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-white transition hover:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50';
const primary = 'rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-background transition hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50';
const strings = {
  ko: {
    back: 'Choorai 홈', map: '학습 지도', prep: '준비와 범위', step: '단계', verified: '실행 확인', read: '열어 봄', no: '미완료', count: '코드 실행 확인', current: '현재 할 일', preview: '같은 코드로 실행한 미리보기', reset: '이 프로젝트 연습 초기화', resetPrompt: '이 프로젝트의 코드, 메모, 진도를 지울까요? 이전 버전 연습·다른 문서·60분/SQL 진도는 지우지 않습니다.', resetError: '저장 형식을 확인할 수 없어 저장된 데이터를 그대로 보존했습니다.', yesReset: '이 연습 초기화', cancel: '계속하기', codeHeading: '직접 고치는 시작 코드', codeLabel: 'Choorai Steps 교육용 미니 언어 코드', language: '교육용 규칙 문법 · JavaScript/HTML이 아닙니다', languageHelp: '허용된 조건문과 명령만 해석합니다. 임의 JavaScript 실행, DOM 접근, 네트워크 연결은 없습니다.', syntaxHelp: '문법: note_limit 숫자 · on add · if note is empty / not empty · show empty_note_error · else · add note to list · 선택 기능은 on input / show remaining characters', runStarter: '시작 코드 실행', runChecks: '동작 검사 실행', runFeature: '기능 검사 실행', fixLocked: '먼저 시작 코드를 실행하세요.', featureLocked: '먼저 조건 수정 검사를 통과하세요.', starterSeen: '실행 결과에서 시작 코드의 버그를 확인했습니다. 이제 조건을 고쳐 보세요.', starterMissed: '예상한 버그 결과를 관찰하지 못했습니다. 시작 코드를 다시 실행해 보세요.', emptyNoteError: '메모를 입력해 주세요.', guardPassed: '빈 입력 거절과 정상 메모 추가, 두 실제 실행 검사가 통과했습니다.', guardFailed: '동작 검사에 실패했습니다. 각 입력에서 실행된 명령을 확인하고 다시 고치세요.', featurePassed: '기능 검사가 통과했습니다. 입력 이벤트가 글자 수를 실제로 계산합니다.', featureFailed: '기능 검사에 실패했습니다. `on input` 처리와 다시 실행한 조건 검사를 확인하세요.', invalidCode: '지원 문법을 읽지 못했습니다. 안내된 줄 형식과 들여쓰기를 확인하세요.', expected: '예상 결과', hint: '힌트와 복구', add: '메모 추가', noteLabel: '미리보기에서 메모 입력', empty: '메모가 없습니다.', added: '실행 코드가 메모를 목록에 추가했습니다.', noteLimit: '메모는 100개까지 보관합니다. 추가하지 않았고 입력 내용도 지우지 않았습니다.', noteTooLong: '이 코드가 허용하는 글자 수보다 깁니다. 추가하지 않았습니다.', codeError: '현재 코드는 실행되지 않았습니다. 코드와 진도는 보존했습니다.', programLimit: '코드는 2,000자까지 편집할 수 있습니다.', storageTitle: '이 탭에서만 계속하기', storageUnavailable: '브라우저 저장을 사용할 수 없습니다. 이 탭을 열어 둔 동안 편집·실행·검사는 계속할 수 있지만, 새로고침하면 작업이 사라질 수 있습니다.', storageInvalid: '기존 저장 자료 형식이 올바르지 않아 수정하지 않았습니다. 이 탭의 임시 연습은 계속할 수 있고, 코드를 내려받을 수 있습니다.', export: '코드와 메모 내려받기', exportStarted: '내보내기를 시작했습니다. 브라우저 다운로드 목록에서 파일을 확인하세요.', exportFailed: '내보내기를 시작하지 못했습니다. 코드를 복사해 별도 파일에 보관하세요.', save: '이 브라우저에 저장', saved: '코드와 메모를 저장하고 다시 읽어 확인했습니다.', saveError: '브라우저 저장이 거부됐습니다. 이 탭의 작업은 유지되고 코드는 내려받을 수 있습니다.', saveUnavailable: '브라우저 저장 불가', savedLabel: '브라우저에 저장됨', notSaved: '아직 저장하지 않음', sessionReset: '현재 탭의 임시 연습만 초기화했습니다. 기존 저장 자료는 건드리지 않았습니다.', resetDone: '이 버전의 연습과 코드·메모 파일만 초기화했습니다.', source: '문법 안내', output: '메모 목록', nextButton: '다음 단계', prevButton: '이전 단계', done: '세 가지 코드 실행 과제를 모두 통과했습니다.', loading: '진도를 불러오는 중입니다…', requires: '앞 단계의 실행 검사를 먼저 통과하세요.', appTitle: '나의 메모 앱', appDescription: '실행한 규칙 코드가 이 미리보기의 메모 동작을 제어합니다.', noCode: '이 과제는 JavaScript/HTML 수업이 아닙니다. 짧은 교육용 문법을 실제 제한 인터프리터로 실행합니다.', restore: '시작 코드로 복원', restored: '시작 코드와 메모를 복원했습니다. 다시 실행 검사를 해야 합니다.', progressOnly: '완료 수치는 이 브라우저의 실제 코드 실행 검사 결과입니다. 저장이나 공개 배포를 뜻하지 않습니다.', selfCheck: '읽음/자가확인은 코드 실행 완료로 계산하지 않습니다.', runtimeEmpty: '빈 입력 → 안내 표시', runtimeValid: '일반 입력 → 목록에 추가', remaining: '자 남음', deleteNote: '이 메모 삭제', removeNote: '메모를 지웠습니다.', exportHelp: '저장할 수 없을 때도 코드와 메모를 파일로 내려받을 수 있습니다.',
  },
  en: {
    back: 'Choorai home', map: 'Learning map', prep: 'Setup and scope', step: 'Step', verified: 'Run checked', read: 'Opened', no: 'Not done', count: 'Code execution checks', current: 'Current task', preview: 'Preview run by the same code', reset: 'Reset this project practice', resetPrompt: 'Clear this project’s code, notes, and progress? Earlier lesson versions and other docs/60-min/SQL progress are kept.', resetError: 'The saved format could not be confirmed, so saved data was preserved.', yesReset: 'Reset this practice', cancel: 'Keep working', codeHeading: 'Starter code to edit', codeLabel: 'Choorai Steps educational mini-language code', language: 'Educational rule language · not JavaScript/HTML', languageHelp: 'Only allowed conditions and commands are interpreted. There is no arbitrary JavaScript, DOM access, or network connection.', syntaxHelp: 'Syntax: note_limit number · on add · if note is empty / not empty · show empty_note_error · else · add note to list · optional feature: on input / show remaining characters', runStarter: 'Run the starter', runChecks: 'Run behavior checks', runFeature: 'Run feature checks', fixLocked: 'Run the starter first.', featureLocked: 'Pass the condition checks first.', starterSeen: 'You observed the starter bug in the run. Now fix its condition.', starterMissed: 'The expected bug was not observed. Run the starter again.', emptyNoteError: 'Enter a note first.', guardPassed: 'Both real behavior checks passed: reject empty input and add a normal note.', guardFailed: 'A behavior check failed. Inspect which command ran and edit the code again.', featurePassed: 'The feature checks passed. The input event calculates remaining characters.', featureFailed: 'The feature check failed. Check the `on input` handler and rerun the condition checks.', invalidCode: 'The supported syntax could not be read. Check the line forms and indentation.', expected: 'Expected result', hint: 'Hint and recovery', add: 'Add note', noteLabel: 'Enter a note in the preview', empty: 'There are no notes.', added: 'The executed program added a note to the list.', noteLimit: 'The app keeps up to 100 notes. Nothing was added and your input was kept.', noteTooLong: 'This note exceeds the limit in your program. Nothing was added.', codeError: 'The current code did not run. Your code and progress were preserved.', programLimit: 'The program can be up to 2,000 characters.', storageTitle: 'Continue in this tab only', storageUnavailable: 'Browser storage is unavailable. You can keep editing, running, and checking while this tab stays open, but refreshing may discard your work.', storageInvalid: 'Existing saved data has an invalid format and was not changed. You can continue a temporary lesson in this tab and download your code.', export: 'Download code and notes', exportStarted: 'The download was started. Check your browser’s downloads list.', exportFailed: 'Could not start the download. Copy the code into a separate file to keep it.', save: 'Save in this browser', saved: 'Saved the code and notes, then read them back.', saveError: 'Browser storage denied the save. Work stays in this tab and code can be downloaded.', saveUnavailable: 'Browser save unavailable', savedLabel: 'Saved in this browser', notSaved: 'Not saved yet', sessionReset: 'Reset the temporary practice in this tab. Existing saved data was not touched.', resetDone: 'Reset this version of the practice and its code/notes only.', source: 'Syntax guide', output: 'Notes list', nextButton: 'Next step', prevButton: 'Previous step', done: 'All three code-running tasks passed.', loading: 'Loading progress…', requires: 'Pass the previous execution check first.', appTitle: 'My notes app', appDescription: 'The rules you run control the note behavior in this preview.', noCode: 'This is not a JavaScript/HTML lesson. A short educational language runs in a restricted interpreter.', restore: 'Restore starter code', restored: 'Restored the starter code and notes. Run the checks again.', progressOnly: 'Completion reflects real code-execution checks in this browser. It does not mean data was saved or deployed.', selfCheck: 'Opening the lesson or self-checking is not counted as code execution.', runtimeEmpty: 'Empty input → show a message', runtimeValid: 'Normal input → add to the list', remaining: 'characters left', deleteNote: 'Delete this note', removeNote: 'Removed the note.', exportHelp: 'You can download code and notes even when browser saving is unavailable.',
  },
};

function loadOutput(): { output: SavedMemoApp | null; issue: 'invalid' | null } {
  try {
    const raw = window.localStorage.getItem(PROJECT_OUTPUT_KEY);
    if (!raw) return { output: null, issue: null };
    const value: unknown = JSON.parse(raw);
    return validateMemoOutput(value, shape) ? { output: value, issue: null } : { output: null, issue: 'invalid' };
  } catch { return { output: null, issue: null }; }
}

function Preview({ program, notes, locale, canAdd, onAdd, onDelete }: { program: string; notes: string[]; locale: Locale; canAdd: boolean; onAdd: (note: string) => boolean; onDelete: (index: number) => void }) {
  const ui = strings[locale];
  const [note, setNote] = useState('');
  const inputResult = runMemoInputHandler(program, note);
  return <section aria-label={ui.preview} className="overflow-hidden rounded-2xl border border-border bg-[#fbfaf7] text-slate-900 shadow-xl">
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3"><span className="flex items-center gap-2 text-xs text-slate-600"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-red-400"/><span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-amber-400"/><span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-green-400"/>{course.startingFile.name}</span><span className="text-xs text-slate-600">{notes.length}/100</span></div>
    <div className="min-h-72 p-6 sm:p-8"><h2 className="break-words text-2xl font-bold sm:text-3xl">{ui.appTitle}</h2><p className="mt-2 text-sm text-slate-700">{ui.appDescription}</p>
      {inputResult.ok && inputResult.remaining !== undefined && <p className="mt-4 text-sm font-semibold text-indigo-800" aria-live="polite">{inputResult.remaining} {ui.remaining}</p>}
      <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); if (onAdd(note)) setNote(''); }}>
        <label className="sr-only" htmlFor="preview-note-input">{ui.noteLabel}</label><input id="preview-note-input" value={note} maxLength={500} onChange={(event) => setNote(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-400 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700" placeholder={ui.noteLabel}/><button type="submit" disabled={!canAdd} className="rounded-lg bg-indigo-700 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">{ui.add}</button>
      </form>
      <ul aria-label={ui.output} className="mt-5 space-y-2">{notes.length ? notes.map((entry, index) => <li key={`${index}-${entry}`} className="flex items-start justify-between gap-2 break-words rounded-lg border border-slate-300 bg-white p-3 text-sm"><span className="min-w-0 flex-1">{entry || <em className="text-slate-500">{locale === 'ko' ? '(빈 메모)' : '(empty note)'}</em>}</span><button type="button" className="rounded border border-slate-400 px-2 py-1 text-xs text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700" aria-label={`${ui.deleteNote} ${index + 1}`} onClick={() => onDelete(index)}>×</button></li>) : <li className="rounded-lg border border-dashed border-slate-400 p-4 text-sm text-slate-700">{ui.empty}</li>}</ul>
    </div>
  </section>;
}

export default function ProjectStudio({ locale = 'ko' }: { locale?: Locale }) {
  const ui = strings[locale];
  const localeRef = useRef(locale);
  localeRef.current = locale;
  const [state, setState] = useState<ProgressRead | null>(null);
  const stateRef = useRef<ProgressRead | null>(null);
  const [programDraft, setProgramDraft] = useState(course.startingFile.contents);
  const programDraftRef = useRef(programDraft);
  programDraftRef.current = programDraft;
  const [notice, setNotice] = useState('');
  const [checks, setChecks] = useState<ProgramCheck[]>([]);
  const [resetPrompt, setResetPrompt] = useState(false);
  const [previewResetKey, setPreviewResetKey] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [outputReadError, setOutputReadError] = useState('');
  const [savedApp, setSavedApp] = useState<SavedMemoApp | null>(null);
  const run = state?.run;
  const verifiedCount = run ? course.completion.required.filter((id) => Boolean(run.evidence[id]?.verifiedAt)).length : 0;
  const selected = course.steps.find((step) => step.id === run?.currentStepId) || course.steps[0];
  const selectedEvidence = run?.evidence[selected.id];
  const allVerified = verifiedCount === course.completion.required.length;
  const currentIndex = course.steps.findIndex((step) => step.id === selected.id);
  const prerequisitesPass = (step: Step) => (step.requires || []).every((id) => Boolean(run?.evidence[id]?.verifiedAt));
  const featureEditWasUnlocked = Boolean(run?.evidence['fix-guard']?.attempts);
  const canEditCode = loaded && Boolean(state) && selected.id !== 'run-starter'
    && (prerequisitesPass(selected) || (selected.id === 'add-counter' && featureEditWasUnlocked));
  const codeNeedsRun = selected.id === 'fix-guard' ? !run?.evidence['fix-guard']?.verifiedAt
    : selected.id === 'add-counter' ? !run?.evidence['add-counter']?.verifiedAt : false;
  const canUsePreview = loaded && Boolean(state) && Boolean(run?.evidence['fix-guard']?.verifiedAt) && parseMemoProgram(programDraft).ok;
  const matchesSaved = Boolean(savedApp && savedApp.program === run?.workspace.program && JSON.stringify(savedApp.notes) === JSON.stringify(run?.workspace.notes));
  const draftConflicts = (state?.conflicts || []).filter((field) => field === 'workspace.program' || field === 'workspace.notes');

  const apply = (next: ProgressRead) => { stateRef.current = next; setState(next); };
  const mutate = (operation: (current: ProgressRead) => ProgressRead) => {
    const current = stateRef.current;
    if (!current) return null;
    const next = operation(current);
    apply(next);
    return next;
  };
  const setStepUrl = (id: string, addHistory: boolean) => {
    const url = new URL(window.location.href);
    url.searchParams.set('step', id);
    const target = `${url.pathname}${url.search}${url.hash}`;
    const historyState = { ...(window.history.state || {}), projectStep: id };
    if (addHistory) window.history.pushState(historyState, '', target);
    else window.history.replaceState(historyState, '', target);
  };
  const goToStep = (id: string, addHistory = true) => {
    if (!course.steps.some((step) => step.id === id)) return;
    setStepUrl(id, addHistory);
    const next = mutate((current) => visitStep(current, id, shape));
    if (next) { programDraftRef.current = next.run.workspace.program; setProgramDraft(next.run.workspace.program); }
    setChecks([]); setNotice('');
  };
  const commitProgram = () => {
    const current = stateRef.current;
    if (!current) return null;
    if (draftConflicts.length) { setNotice(persistenceMessages[locale].conflict); return null; }
    const next = mutate((snapshot) => persistCurrentProgress(draftProgram(snapshot, programDraft, shape)));
    if (next?.conflicts.some((field) => field === 'workspace.program' || field === 'workspace.notes')) {
      setNotice(persistenceMessages[locale].conflict);
      return null;
    }
    return next;
  };
  const updateEditor = (value: string) => {
    if (value.length > 2_000) { setNotice(ui.programLimit); return; }
    programDraftRef.current = value;
    setProgramDraft(value);
    mutate((current) => draftProgram(current, value, shape));
    setChecks([]); setNotice(''); setSavedApp(null);
  };

  useEffect(() => {
    const current = readLearningProgress(shape);
    const requested = new URLSearchParams(window.location.search).get('step');
    const nextIncomplete = course.steps.find((step) => course.completion.required.includes(step.id) && !current.run.evidence[step.id]?.verifiedAt);
    const initial = requested && course.steps.some((step) => step.id === requested) ? requested : current.run.currentStepId || nextIncomplete?.id || course.steps[0].id;
    const initialUrl = new URL(window.location.href);
    initialUrl.searchParams.set('step', initial);
    window.history.replaceState({ ...(window.history.state || {}), projectStep: initial }, '', `${initialUrl.pathname}${initialUrl.search}${initialUrl.hash}`);
    const opened = visitStep(current, initial, shape);
    stateRef.current = opened; setState(opened); programDraftRef.current = opened.run.workspace.program; setProgramDraft(opened.run.workspace.program);
    const output = loadOutput(); setSavedApp(output.output);
    if (output.issue) setOutputReadError(locale === 'ko' ? '저장된 프로젝트 파일 형식이 올바르지 않아 수정하지 않았습니다.' : 'The saved project file has an invalid format and was not changed.');
    setLoaded(true);
    const onPopState = () => {
      const id = new URLSearchParams(window.location.search).get('step') || window.history.state?.projectStep;
      if (id && course.steps.some((step) => step.id === id) && stateRef.current) {
        goToStep(id, false);
      }
    };
    const syncProgress = () => {
      const previous = stateRef.current;
      if (previous?.blocked) return;
      const refreshed = readLearningProgress(shape);
      if (refreshed.blocked) return;
      const baseKey = `${course.id}@${course.version}`;
      const baselineProgram = previous?.baselineProgress.paths[baseKey]?.workspace.program;
      const hasLocalCodeDraft = Boolean(previous && programDraftRef.current !== baselineProgram);
      const next = previous ? reconcileLearningProgress(previous, refreshed) : refreshed;
      stateRef.current = next; setState(next);
      if (!hasLocalCodeDraft && !next.conflicts.includes('workspace.program')) {
        programDraftRef.current = next.run.workspace.program;
        setProgramDraft(next.run.workspace.program);
      }
      setStepUrl(next.run.currentStepId, false);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === null) {
        const current = stateRef.current;
        if (current) apply(markStorageUnavailable(current, persistenceMessages[localeRef.current].clear));
        setSavedApp(null); setOutputReadError(persistenceMessages[localeRef.current].clear);
        return;
      }
      if (event.key === PROJECT_OUTPUT_KEY) {
        const output = loadOutput();
        setSavedApp(output.output);
        setOutputReadError(output.issue ? persistenceMessages[localeRef.current].outputInvalid : '');
        return;
      }
      if (event.key === LEARNING_PROGRESS_KEY) syncProgress();
    };
    window.addEventListener('choorai-learning-progress-change', syncProgress);
    window.addEventListener('storage', onStorage);
    window.addEventListener('popstate', onPopState);
    return () => { window.removeEventListener('choorai-learning-progress-change', syncProgress); window.removeEventListener('storage', onStorage); window.removeEventListener('popstate', onPopState); };
  }, []);

  const resolveDraftConflict = (keepLocal: boolean) => {
    const current = stateRef.current;
    if (!current || !draftConflicts.length) return;
    const remote = readLearningProgress(shape);
    if (remote.blocked) {
      apply(markStorageUnavailable(current, remote.message));
      setNotice(persistenceMessages[locale].conflict);
      return;
    }
    const key = `${course.id}@${course.version}`;
    const hadProgramConflict = draftConflicts.includes('workspace.program');
    const hadNotesConflict = draftConflicts.includes('workspace.notes');
    const workspace = {
      ...remote.run.workspace,
      program: hadProgramConflict ? (keepLocal ? programDraftRef.current : remote.run.workspace.program) : current.run.workspace.program,
      notes: hadNotesConflict ? (keepLocal ? current.run.workspace.notes : remote.run.workspace.notes) : current.run.workspace.notes,
    };
    const resolvedRun = { ...remote.run, workspace };
    const resolved = { ...remote, run: resolvedRun, progress: { ...remote.progress, paths: { ...remote.progress.paths, [key]: resolvedRun } } };
    if (keepLocal) {
      const saved = persistCurrentProgress(resolved);
      apply(saved);
      programDraftRef.current = saved.run.workspace.program;
      setProgramDraft(saved.run.workspace.program);
      setStepUrl(saved.run.currentStepId, false);
      setNotice(saved.conflicts.some((field) => field === 'workspace.program' || field === 'workspace.notes')
        ? persistenceMessages[locale].conflict : persistenceMessages[locale].mineSaved);
    } else {
      apply(resolved);
      programDraftRef.current = resolved.run.workspace.program;
      setProgramDraft(resolved.run.workspace.program);
      setStepUrl(resolved.run.currentStepId, false);
      setNotice(persistenceMessages[locale].savedChosen);
    }
  };

  const runStarter = () => {
    const result = executeMemoProgram(course.startingFile.contents, 'A note', []);
    const passed = result.ok && result.action === 'show-message' && result.notes.length === 0;
    const next = mutate((current) => recordVerification(current, 'run-starter', passed, shape));
    setChecks([{ id: 'starter-bug', passed, observed: result.action === 'show-message' ? 'A normal note is rejected by the starter.' : result.action === 'add-note' ? 'A normal note is added.' : result.message || 'The starter did not run.' }]);
    setNotice(passed ? ui.starterSeen : ui.starterMissed);
    if (next) { programDraftRef.current = next.run.workspace.program; setProgramDraft(next.run.workspace.program); }
  };
  const runGuardChecks = () => {
    const updated = commitProgram();
    if (!updated) return;
    const result = checkMemoGuard(programDraft);
    const next = mutate((current) => recordVerification(current, 'fix-guard', result.passed, shape));
    setChecks(result.checks); setNotice(result.passed ? ui.guardPassed : ui.guardFailed);
    if (next) { programDraftRef.current = next.run.workspace.program; setProgramDraft(next.run.workspace.program); }
  };
  const runFeatureChecks = () => {
    const updated = commitProgram();
    if (!updated) return;
    const guard = checkMemoGuard(programDraft);
    const feature = checkCounterVariation(programDraft);
    const checkedGuard = mutate((current) => recordVerification(current, 'fix-guard', guard.passed, shape));
    const checkedFeature = checkedGuard ? mutate((current) => recordVerification(current, 'add-counter', guard.passed && feature.passed, shape)) : null;
    setChecks([...guard.checks, ...feature.checks]);
    setNotice(guard.passed && feature.passed ? ui.featurePassed : ui.featureFailed);
    if (checkedFeature) { programDraftRef.current = checkedFeature.run.workspace.program; setProgramDraft(checkedFeature.run.workspace.program); }
  };
  const addNoteFromPreview = (value: string) => {
    const current = stateRef.current;
    if (!current || !canUsePreview) { setNotice(ui.requires); return false; }
    const result = executeMemoProgram(programDraft, value, current.run.workspace.notes);
    if (!result.ok) {
      const parsed = parseMemoProgram(programDraft);
      setNotice(result.action === 'limit-error' ? `${ui.noteTooLong} (${parsed.ok ? parsed.program.limit : 0})` : ui.invalidCode);
      return false;
    }
    if (result.action === 'show-message') { setNotice(ui.emptyNoteError); return false; }
    const appended = appendProgramNote(current, result.note || '');
    if (!appended.added) {
      setNotice(appended.reason === 'limit' ? ui.noteLimit : ui.noteTooLong);
      return false;
    }
    apply(appended.state); setNotice(ui.added); return true;
  };
  const deleteNote = (index: number) => {
    const current = stateRef.current;
    if (!current || index < 0 || index >= current.run.workspace.notes.length) return;
    const next = { ...current, run: { ...current.run, workspace: { ...current.run.workspace, notes: current.run.workspace.notes.filter((_, item) => item !== index) } } };
    apply(persistCurrentProgress(next)); setNotice(ui.removeNote); setSavedApp(null);
  };
  const saveInBrowser = () => {
    const updated = commitProgram();
    if (!updated) return;
    if (updated.blocked) { setNotice(ui.saveUnavailable); return; }
      const output = saveMemoOutput(updated.run, course.version);
      if (!validateMemoOutput(output, shape)) { setNotice(ui.invalidCode); return; }
    try {
      window.localStorage.setItem(PROJECT_OUTPUT_KEY, JSON.stringify(output));
      const raw = window.localStorage.getItem(PROJECT_OUTPUT_KEY);
      const readback: unknown = raw ? JSON.parse(raw) : null;
      const valid = validateMemoOutput(readback, shape) && JSON.stringify(readback) === JSON.stringify(output);
      if (!valid) { setNotice(ui.saveError); return; }
      setSavedApp(readback); setNotice(ui.saved);
    } catch {
      const current = stateRef.current;
      if (current) apply(markStorageUnavailable(current));
      setSavedApp(null);
      setNotice(ui.saveError);
    }
  };
  const exportProject = () => {
    const current = stateRef.current;
    if (!current) return;
    try {
      const exported = createProgramExport(programDraft, current.run.workspace.notes);
      const blob = new Blob([exported.content], { type: 'application/json;charset=utf-8' });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = href; link.download = exported.filename; link.click();
      window.setTimeout(() => URL.revokeObjectURL(href), 0);
      setNotice(ui.exportStarted);
    } catch { setNotice(ui.exportFailed); }
  };
  const restore = () => {
    const next = mutate((current) => restoreWorkspace(current, shape));
    if (next) { programDraftRef.current = next.run.workspace.program; setProgramDraft(next.run.workspace.program); setChecks([]); setSavedApp(null); }
    setNotice(ui.restored);
  };
  const reset = () => {
    const current = stateRef.current;
    if (!current) return;
    try {
      if (current.blocked) throw new Error('session-only');
      resetLearningProgress(shape);
      const fresh = visitStep(readLearningProgress(shape), course.steps[0].id, shape);
      apply(fresh); programDraftRef.current = fresh.run.workspace.program; setProgramDraft(fresh.run.workspace.program); setSavedApp(null); setOutputReadError(''); setChecks([]); setResetPrompt(false); setStepUrl(course.steps[0].id, false); setNotice(ui.resetDone);
    } catch {
      const fresh = resetLearningProgressInSession(markStorageUnavailable(current), shape);
      apply(fresh); programDraftRef.current = fresh.run.workspace.program; setProgramDraft(fresh.run.workspace.program); setSavedApp(null); setChecks([]); setResetPrompt(false); setNotice(ui.sessionReset);
    }
    setPreviewResetKey((key) => key + 1);
  };
  const progressPct = course.completion.required.length ? Math.round(verifiedCount / course.completion.required.length * 100) : 0;

  return <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
    <nav aria-label={locale === 'ko' ? '현재 위치' : 'Breadcrumb'} className="mb-5 flex flex-wrap items-center gap-2 text-sm text-text-secondary"><a className="underline hover:text-white" href={locale === 'ko' ? '/' : '/en/'}>{ui.back}</a><span aria-hidden="true">/</span><a className="underline hover:text-white" href={locale === 'ko' ? '/map/' : '/en/map/'}>{ui.map}</a><span aria-hidden="true">/</span><span aria-current="page">{t(course.title, locale)}</span></nav>
    <header className="mb-6 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-surface to-background p-5 sm:p-8"><p className="text-sm font-bold text-primary">{locale === 'ko' ? '초보자 코드 실습 · 로컬 실행' : 'Beginner coding · local execution'}</p><h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">{t(course.title, locale)}</h1><p className="mt-3 max-w-3xl text-base leading-relaxed text-text-secondary">{t(course.goal, locale)}</p><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm"><span>{locale === 'ko' ? '예상' : 'About'} {course.estimatedMinutes} {locale === 'ko' ? '분' : 'minutes'}</span><span>{locale === 'ko' ? '브라우저에서만' : 'Browser only'}</span><span>{locale === 'ko' ? 'API 비용 없음' : 'No API cost'}</span></div></header>
    <section aria-label={locale === 'ko' ? '진도와 실행 증거' : 'Progress and run evidence'} className="mb-5 rounded-xl border border-border bg-surface p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{ui.count} {verifiedCount}/{course.completion.required.length}</p><p className="mt-1 text-sm text-text-secondary">{ui.progressOnly}</p></div><div className="flex items-center gap-3"><div className="h-2 w-32 overflow-hidden rounded-full bg-border" role="progressbar" aria-label={ui.count} aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}><div className="h-full bg-primary transition-all" style={{ width: `${progressPct}%` }}/></div><strong className="text-primary">{progressPct}%</strong></div></div>{state?.blocked && <div role="status" className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm"><strong>{ui.storageTitle}: </strong>{state.storageIssue === 'invalid' ? ui.storageInvalid : ui.storageUnavailable}</div>}{draftConflicts.length > 0 && <div role="alert" aria-live="assertive" className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm"><p>{persistenceMessages[locale].conflict}</p><div className="mt-2 flex flex-wrap gap-2"><button type="button" className={button} onClick={() => resolveDraftConflict(true)}>{persistenceMessages[locale].saveMine}</button><button type="button" className={button} onClick={() => resolveDraftConflict(false)}>{persistenceMessages[locale].useSaved}</button></div></div>}{notice && <p role="status" aria-live="polite" className="mt-3 rounded-lg border border-border bg-background p-3 text-sm">{notice}</p>}{outputReadError && <p role="status" className="mt-3 rounded-lg border border-amber-500/40 p-3 text-sm">{outputReadError}</p>}</section>
    {resetPrompt && <section role="group" aria-label={ui.reset} className="mb-5 rounded-xl border border-amber-500/50 bg-amber-500/10 p-4"><p className="text-sm">{ui.resetPrompt}</p><div className="mt-3 flex gap-2"><button className={primary} onClick={reset}>{ui.yesReset}</button><button className={button} onClick={() => setResetPrompt(false)}>{ui.cancel}</button></div></section>}
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(17rem,0.75fr)_minmax(0,1.25fr)]">
      <aside className="min-w-0 space-y-4" aria-label={ui.prep}>
        <section className="rounded-xl border border-border bg-surface p-4"><h2 className="text-lg font-bold">{ui.prep}</h2><ul className="mt-3 list-inside list-disc space-y-2 text-sm text-text-secondary">{course.environment.requirements[locale].map((line) => <li key={line}>{line}</li>)}</ul><p className="mt-3 text-sm font-semibold text-green-300">{t(course.environment.cost, locale)}</p><p className="mt-2 text-sm text-text-secondary">{t(course.environment.scope, locale)}</p></section>
        <section className="rounded-xl border border-border p-4"><h2 className="font-bold">{ui.step} {currentIndex + 1}/{course.steps.length}</h2><ol className="mt-3 space-y-2">{course.steps.map((step, index) => { const evidence = run?.evidence[step.id]; const status = evidence?.verifiedAt ? ui.verified : evidence?.visitedAt ? ui.read : ui.no; return <li key={step.id}><button className={`w-full rounded-lg border p-3 text-left transition ${step.id === selected.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`} aria-current={step.id === selected.id ? 'step' : undefined} onClick={() => goToStep(step.id)}><span className="flex items-center justify-between gap-2"><span className="text-xs text-text-secondary">{ui.step} {index + 1} · {step.time}</span><span className={`text-xs ${evidence?.verifiedAt ? 'text-green-300' : 'text-text-secondary'}`}>{status}</span></span><span className="mt-1 block text-sm font-semibold">{t(step.title, locale)}</span></button></li>; })}</ol></section>
        <details className="rounded-xl border border-border p-4"><summary className="cursor-pointer font-semibold">{ui.source} · {course.startingFile.name}</summary><p className="mt-2 text-xs text-text-secondary">{ui.languageHelp}</p><pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-background p-3 text-xs text-text-secondary"><code>{course.startingFile.contents}</code></pre></details>
        <button className={`${button} w-full`} disabled={!loaded} onClick={() => setResetPrompt(true)}>{ui.reset}</button>
      </aside>
      <section className="min-w-0 space-y-4" aria-label={ui.current}>
        <section className="space-y-5">
          <div><p className="text-sm font-semibold text-primary">{ui.current} · {selected.id}</p><h2 className="mt-1 text-2xl font-bold text-white">{t(selected.title, locale)}</h2><p className="mt-2 text-sm leading-relaxed text-text-secondary">{t(selected.goal, locale)}</p></div>
          <section className="rounded-xl border border-border bg-surface p-4"><h3 className="font-bold text-white">{ui.expected}</h3><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-text-secondary">{t(selected.action, locale)}</p><p className="mt-3 whitespace-pre-line text-sm text-text-secondary">{t(selected.expected, locale)}</p></section>
          {selected.id !== 'run-starter' && <section className="space-y-3 rounded-xl border border-border bg-surface p-4"><div><label className="block text-sm font-bold" htmlFor="memo-program-editor">{ui.codeHeading}</label><p className="mt-1 text-xs font-semibold text-primary">{ui.language}</p><p id="memo-program-help" className="mt-1 text-xs text-text-secondary">{ui.languageHelp}</p></div><textarea id="memo-program-editor" aria-label={ui.codeLabel} aria-describedby="memo-program-help memo-program-syntax" disabled={!canEditCode} maxLength={2_000} spellCheck={false} autoCapitalize="off" autoCorrect="off" wrap="off" value={programDraft} onChange={(event) => updateEditor(event.target.value)} onBlur={() => { const current = stateRef.current; if (current) { const saved = persistCurrentProgress(current); apply(saved); if (saved.conflicts.some((field) => field === 'workspace.program' || field === 'workspace.notes')) setNotice(persistenceMessages[locale].conflict); } }} className="min-h-56 w-full resize-y rounded-lg border border-border bg-background p-4 font-mono text-sm leading-6 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"/><p id="memo-program-syntax" className="rounded-lg bg-background p-3 text-xs leading-relaxed text-text-secondary">{ui.syntaxHelp}</p>{codeNeedsRun && <p className="text-sm text-amber-200" role="status">{locale === 'ko' ? '이 단계 코드는 아직 실행 검사를 통과하지 않았습니다.' : 'This stage’s code has not passed its run checks yet.'}</p>}</section>}
          {selected.id === 'run-starter' && <button disabled={!loaded} className={primary} onClick={runStarter}>{ui.runStarter}</button>}
          {selected.id === 'fix-guard' && <div className="flex flex-wrap gap-2"><button disabled={!canEditCode} className={primary} onClick={runGuardChecks}>{ui.runChecks}</button>{!prerequisitesPass(selected) && <p role="status" className="self-center text-sm text-amber-200">{ui.fixLocked}</p>}</div>}
          {selected.id === 'add-counter' && <div className="flex flex-wrap gap-2"><button disabled={!canEditCode} className={primary} onClick={runFeatureChecks}>{ui.runFeature}</button>{!prerequisitesPass(selected) && !featureEditWasUnlocked && <p role="status" className="self-center text-sm text-amber-200">{ui.featureLocked}</p>}</div>}
          {checks.length > 0 && <ul aria-label={locale === 'ko' ? '실행 검사 결과' : 'Run check results'} className="space-y-2 rounded-xl border border-border p-4">{checks.map((check) => <li key={check.id} className="flex gap-2 text-sm"><span aria-hidden="true" className={check.passed ? 'text-green-300' : 'text-red-300'}>{check.passed ? '✓' : '×'}</span><span>{check.observed}</span></li>)}</ul>}
          <section className="rounded-xl border border-border p-4"><h3 className="font-semibold">{ui.hint}</h3><details className="mt-2"><summary className="cursor-pointer text-sm text-primary">{locale === 'ko' ? '힌트 보기' : 'Show hint'}</summary><p className="mt-2 text-sm text-text-secondary">{t(selected.hint, locale)}</p></details><p className="mt-3 text-sm text-text-secondary">{t(selected.recovery, locale)}</p></section>
          <div className="flex justify-between gap-2"><button className={button} disabled={currentIndex <= 0} onClick={() => goToStep(course.steps[Math.max(0, currentIndex - 1)].id)}>{ui.prevButton}</button><button className={button} disabled={currentIndex >= course.steps.length - 1} onClick={() => goToStep(course.steps[Math.min(course.steps.length - 1, currentIndex + 1)].id)}>{ui.nextButton}</button></div>
        </section>
        <section className="min-w-0 space-y-3" aria-label={ui.preview}><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold text-white">{ui.preview}</h2><span className="text-xs text-text-secondary">{matchesSaved ? ui.savedLabel : ui.notSaved}</span></div><Preview key={previewResetKey} program={programDraft} notes={run?.workspace.notes || []} locale={locale} canAdd={canUsePreview} onAdd={addNoteFromPreview} onDelete={deleteNote}/>{!canUsePreview && <p className="text-xs text-text-secondary">{ui.requires}</p>}</section>
        <section className="flex flex-wrap gap-2 rounded-xl border border-border p-4"><button className={button} disabled={!loaded || Boolean(state?.blocked) || Boolean(outputReadError)} onClick={saveInBrowser}>{state?.blocked ? ui.saveUnavailable : ui.save}</button><button className={button} disabled={!loaded} onClick={exportProject}>{ui.export}</button><button className={button} disabled={!loaded} onClick={restore}>{ui.restore}</button><p className="basis-full text-xs text-text-secondary">{ui.exportHelp}</p></section>
        {allVerified && <section role="status" className="rounded-xl border border-green-500/40 bg-green-500/10 p-4"><h2 className="font-bold text-green-200">{ui.done}</h2><p className="mt-2 text-sm text-text-secondary">{t(course.next, locale)}</p></section>}
        <p className="text-xs text-text-secondary">{ui.noCode} {ui.selfCheck}</p>
        {!loaded && <p className="text-sm text-text-secondary" role="status">{ui.loading}</p>}
      </section>
    </div>
  </main>;
}
