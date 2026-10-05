import { createMemoProjectExport, MAX_MEMO_NOTES, MAX_MEMO_NOTE_LENGTH, MAX_MEMO_PROGRAM_LENGTH, parseMemoProgram } from './memoProgram';
import { mergeThreeWayFields, mergeThreeWayMap } from './threeWayMerge';

export const LEARNING_PROGRESS_KEY = 'choorai-learning-progress-v1';
export const PROJECT_OUTPUT_KEY = 'choorai-project-memo-output-v2';

type StorageIssue = 'unavailable' | 'invalid' | null;
export interface StepEvidence {
  visitedAt?: string;
  selfCheckedAt?: string;
  verifiedAt?: string;
  attempts: number;
}
export interface WorkspaceDraft {
  program: string;
  notes: string[];
}
export interface PathRun {
  pathId: string;
  contentVersion: number;
  currentStepId: string;
  startedAt: string;
  updatedAt: string;
  workspace: WorkspaceDraft;
  evidence: Record<string, StepEvidence>;
}
export interface LearningProgress {
  schemaVersion: 1;
  paths: Record<string, PathRun>;
}
export interface LearningPathShape {
  id: string;
  version: number;
  startingFile: { starterTitle: string; contents: string };
  steps: Array<{ id: string; requires?: string[] }>;
}
export interface ProgressRead {
  progress: LearningProgress;
  /** Last acknowledged browser value; kept separate from an unsaved tab draft. */
  baselineProgress: LearningProgress;
  run: PathRun;
  path: LearningPathShape;
  conflicts: string[];
  /** True means progress is in-memory only. Editing and checks remain available. */
  blocked: boolean;
  storageIssue: StorageIssue;
  message: string;
}
export interface SavedMemoApp {
  schemaVersion: 2;
  pathVersion: number;
  program: string;
  notes: string[];
  savedAt: string;
}
export interface NoteAppendResult {
  state: ProgressRead;
  added: boolean;
  reason?: 'empty' | 'too-long' | 'limit';
}

const versionedPathKey = (path: LearningPathShape) => `${path.id}@${path.version}`;
const starterRun = (path: LearningPathShape): PathRun => {
  const now = new Date().toISOString();
  return { pathId: path.id, contentVersion: path.version, currentStepId: path.steps[0].id, startedAt: now, updatedAt: now, workspace: { program: path.startingFile.contents, notes: [] }, evidence: {} };
};
const freshProgress = (): LearningProgress => ({ schemaVersion: 1, paths: {} });
const validateRun = (raw: unknown, path: LearningPathShape): raw is PathRun => {
  if (!raw || typeof raw !== 'object') return false;
  const run = raw as PathRun;
  const stepIds = new Set(path.steps.map((step) => step.id));
  return run.pathId === path.id && run.contentVersion === path.version && stepIds.has(run.currentStepId)
    && typeof run.startedAt === 'string' && typeof run.updatedAt === 'string'
    && !!run.workspace && typeof run.workspace.program === 'string' && run.workspace.program.length <= MAX_MEMO_PROGRAM_LENGTH
    && Array.isArray(run.workspace.notes) && run.workspace.notes.length <= MAX_MEMO_NOTES
    && run.workspace.notes.every((note) => typeof note === 'string' && note.length <= MAX_MEMO_NOTE_LENGTH)
    && !!run.evidence && typeof run.evidence === 'object' && !Array.isArray(run.evidence)
    && Object.keys(run.evidence).every((id) => stepIds.has(id)
      && Number.isInteger(run.evidence[id].attempts) && run.evidence[id].attempts >= 0 && run.evidence[id].attempts <= 1000
      && (['visitedAt', 'selfCheckedAt', 'verifiedAt'] as const).every((key) => run.evidence[id][key] === undefined || typeof run.evidence[id][key] === 'string'));
};
function makeRead(progress: LearningProgress, path: LearningPathShape, blocked: boolean, message = '', storageIssue: StorageIssue = null): ProgressRead {
  const key = versionedPathKey(path);
  const stored = progress.paths[key];
  const run = validateRun(stored, path) ? stored : starterRun(path);
  if (!stored && !blocked) progress.paths[key] = run;
  if (!stored && blocked) progress.paths[key] = run;
  return { progress, baselineProgress: progress, run, path, conflicts: [], blocked, storageIssue, message };
}
function invalidStoredProgress(raw: string, path: LearningPathShape, message: string): ProgressRead {
  return makeRead(freshProgress(), path, true, message, 'invalid');
}
export function readLearningProgress(path: LearningPathShape): ProgressRead {
  if (typeof window === 'undefined') return makeRead(freshProgress(), path, true, 'Browser storage is unavailable in this rendering context.', 'unavailable');
  let raw: string | null;
  try { raw = window.localStorage.getItem(LEARNING_PROGRESS_KEY); }
  catch { return makeRead(freshProgress(), path, true, 'Browser storage could not be read. Work will stay in this page session.', 'unavailable'); }
  if (!raw) return makeRead(freshProgress(), path, false);
  if (raw.length > 500_000) return invalidStoredProgress(raw, path, 'Saved practice is too large to read. The saved value was left unchanged.');
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || (parsed as LearningProgress).schemaVersion !== 1 || !(parsed as LearningProgress).paths || typeof (parsed as LearningProgress).paths !== 'object' || Array.isArray((parsed as LearningProgress).paths)) {
      return invalidStoredProgress(raw, path, 'The saved practice format is not recognized. The saved value was left unchanged.');
    }
    const state = parsed as LearningProgress;
    const key = versionedPathKey(path);
    if (state.paths[key] && !validateRun(state.paths[key], path)) return invalidStoredProgress(raw, path, 'This version of the saved practice is not valid. The saved value was left unchanged.');
    return makeRead(state, path, false);
  } catch {
    return invalidStoredProgress(raw, path, 'The saved practice could not be read. The saved value was left unchanged.');
  }
}

function withRun(read: ProgressRead, run: PathRun): LearningProgress {
  const key = `${run.pathId}@${run.contentVersion}`;
  return { ...read.progress, paths: { ...read.progress.paths, [key]: run } };
}
function mergePathRun(base: PathRun, local: PathRun, remote: PathRun, path: LearningPathShape, acknowledgeLocal: boolean) {
  const workspace = mergeThreeWayFields(base.workspace, local.workspace, remote.workspace, ['program', 'notes'], acknowledgeLocal);
  const currentStepChangedRemotely = remote.currentStepId !== base.currentStepId;
  const currentStepId = currentStepChangedRemotely ? remote.currentStepId : local.currentStepId;
  const evidence = mergeThreeWayMap(base.evidence, local.evidence, remote.evidence, acknowledgeLocal);
  const common = {
    ...remote,
    currentStepId: path.steps.some((step) => step.id === currentStepId) ? currentStepId : remote.currentStepId,
    updatedAt: new Date().toISOString(),
  };
  const storedRun: PathRun = { ...common, workspace: workspace.value, evidence: evidence.value };
  const baselineRun: PathRun = { ...(acknowledgeLocal ? common : remote), workspace: workspace.baseline, evidence: evidence.baseline };
  const displayRun: PathRun = {
    ...storedRun,
    workspace: {
      ...storedRun.workspace,
      ...(workspace.conflicts.includes('program') ? { program: local.workspace.program } : {}),
      ...(workspace.conflicts.includes('notes') ? { notes: local.workspace.notes } : {}),
    },
  };
  const conflicts = workspace.conflicts.map((field) => `workspace.${field}`);
  return { storedRun, baselineRun, displayRun, conflicts };
}

/** Reconcile one tab's working tree against its last acknowledged value and latest storage. */
function reconcile(read: ProgressRead, localRun: PathRun, remote: ProgressRead, acknowledgeLocal = true) {
  const key = versionedPathKey(read.path);
  const baseRun = read.baselineProgress.paths[key] || starterRun(read.path);
  const merged = mergePathRun(baseRun, localRun, remote.run, read.path, acknowledgeLocal);
  const paths = { ...remote.progress.paths, [key]: merged.storedRun };
  const baselinePaths = { ...remote.progress.paths, [key]: merged.baselineRun };
  const displayPaths = { ...remote.progress.paths, [key]: merged.displayRun };
  return {
    storedProgress: { ...remote.progress, paths },
    baselineProgress: { ...remote.progress, paths: baselinePaths },
    progress: { ...remote.progress, paths: displayPaths },
    run: merged.displayRun,
    conflicts: merged.conflicts,
  };
}

export function reconcileLearningProgress(read: ProgressRead, remote: ProgressRead): ProgressRead {
  if (read.blocked || remote.blocked) return read;
  // Observing remote metadata cannot acknowledge an unsaved local draft.
  const merged = reconcile(read, read.run, remote, false);
  return {
    ...read,
    progress: merged.progress,
    baselineProgress: merged.baselineProgress,
    run: merged.run,
    conflicts: merged.conflicts,
    blocked: false,
    storageIssue: null,
    message: '',
  };
}

function persist(read: ProgressRead, run: PathRun): ProgressRead {
  const timestamped = { ...run, updatedAt: new Date().toISOString() };
  if (read.blocked || typeof window === 'undefined') {
    const progress = withRun(read, timestamped);
    return { ...read, progress, run: timestamped };
  }
  const remote = readLearningProgress(read.path);
  if (remote.blocked) {
    const progress = withRun(read, timestamped);
    return { ...read, progress, run: timestamped, blocked: true, storageIssue: remote.storageIssue, message: remote.message };
  }
  const merged = reconcile(read, timestamped, remote);
  try {
    window.localStorage.setItem(LEARNING_PROGRESS_KEY, JSON.stringify(merged.storedProgress));
    window.dispatchEvent(new Event('choorai-learning-progress-change'));
    return {
      ...read,
      progress: merged.progress,
      baselineProgress: merged.baselineProgress,
      run: merged.run,
      conflicts: merged.conflicts,
      blocked: false,
      storageIssue: null,
      message: '',
    };
  } catch {
    const localProgress = withRun(read, timestamped);
    return { ...read, progress: localProgress, run: timestamped, blocked: true, storageIssue: 'unavailable', message: 'Browser storage is unavailable. Work remains editable in this page session.' };
  }
}
export function persistCurrentProgress(read: ProgressRead): ProgressRead {
  const run = { ...read.run, updatedAt: new Date().toISOString() };
  return persist(read, run);
}
function edit(read: ProgressRead, transform: (run: PathRun) => PathRun): ProgressRead {
  const run = transform({ ...read.run, workspace: { ...read.run.workspace, notes: [...read.run.workspace.notes] }, evidence: { ...read.run.evidence } });
  run.updatedAt = new Date().toISOString();
  return persist(read, run);
}
function draft(read: ProgressRead, transform: (run: PathRun) => PathRun): ProgressRead {
  const run = transform({ ...read.run, workspace: { ...read.run.workspace, notes: [...read.run.workspace.notes] }, evidence: { ...read.run.evidence } });
  run.updatedAt = new Date().toISOString();
  return { ...read, progress: withRun(read, run), run };
}
function evidenceWith(run: PathRun, stepId: string, value: Partial<StepEvidence>): Record<string, StepEvidence> {
  const old = run.evidence[stepId] || { attempts: 0 };
  return { ...run.evidence, [stepId]: { ...old, ...value } };
}
export function visitStep(read: ProgressRead, stepId: string, path: LearningPathShape): ProgressRead {
  if (!path.steps.some((step) => step.id === stepId)) return read;
  return edit(read, (run) => { run.currentStepId = stepId; run.evidence = evidenceWith(run, stepId, { visitedAt: new Date().toISOString() }); return run; });
}
function replaceProgram(read: ProgressRead, program: string, path: LearningPathShape): PathRun {
  const run = { ...read.run, workspace: { ...read.run.workspace, program }, evidence: { ...read.run.evidence } };
  if (program !== read.run.workspace.program) {
    for (const step of path.steps.slice(1)) {
      if (run.evidence[step.id]) run.evidence[step.id] = { ...run.evidence[step.id], verifiedAt: undefined };
    }
  }
  return run;
}
export function draftProgram(read: ProgressRead, program: string, path: LearningPathShape): ProgressRead {
  if (program.length > MAX_MEMO_PROGRAM_LENGTH) return read;
  return draft(read, (run) => replaceProgram({ ...read, run }, program, path));
}
export function updateProgramDraft(read: ProgressRead, program: string, path: LearningPathShape): ProgressRead {
  if (program.length > MAX_MEMO_PROGRAM_LENGTH) return read;
  return persist(read, replaceProgram(read, program, path));
}
export function appendProgramNote(read: ProgressRead, note: string): NoteAppendResult {
  if (note.length > MAX_MEMO_NOTE_LENGTH) return { state: read, added: false, reason: 'too-long' };
  if (read.run.workspace.notes.length >= MAX_MEMO_NOTES) return { state: read, added: false, reason: 'limit' };
  const next = edit(read, (run) => { run.workspace.notes = [...run.workspace.notes, note]; return run; });
  return { state: next, added: true };
}
export function tryAddDraftNote(read: ProgressRead, note: string): NoteAppendResult {
  const trimmed = note.trim();
  if (!trimmed) return { state: read, added: false, reason: 'empty' };
  if (trimmed.length > MAX_MEMO_NOTE_LENGTH) return { state: read, added: false, reason: 'too-long' };
  if (read.run.workspace.notes.length >= MAX_MEMO_NOTES) return { state: read, added: false, reason: 'limit' };
  return appendProgramNote(read, trimmed);
}
export function addDraftNote(read: ProgressRead, note: string): ProgressRead {
  return tryAddDraftNote(read, note).state;
}
export function restoreWorkspace(read: ProgressRead, path: LearningPathShape): ProgressRead {
  return edit(read, (run) => {
    run.workspace = { program: path.startingFile.contents, notes: [] };
    run.evidence = Object.fromEntries(Object.entries(run.evidence).map(([id, value]) => [id, { ...value, verifiedAt: undefined }]));
    return run;
  });
}

export function recordSelfCheck(read: ProgressRead, stepId: string, checked: boolean): ProgressRead {
  const now = new Date().toISOString();
  return edit(read, (run) => { run.evidence = evidenceWith(run, stepId, { selfCheckedAt: checked ? now : undefined }); return run; });
}
export function recordVerification(read: ProgressRead, stepId: string, passed: boolean, path: LearningPathShape): ProgressRead {
  const step = path.steps.find((item) => item.id === stepId);
  if (!step) return read;
  if (passed && (step.requires || []).some((required) => !read.run.evidence[required]?.verifiedAt)) return read;
  const now = new Date().toISOString();
  const stepIndex = path.steps.findIndex((item) => item.id === stepId);
  return edit(read, (run) => {
    const previous = run.evidence[stepId] || { attempts: 0 };
    run.evidence = evidenceWith(run, stepId, { attempts: previous.attempts + 1, verifiedAt: passed ? now : undefined });
    if (!passed) for (const downstream of path.steps.slice(stepIndex + 1)) {
      if (run.evidence[downstream.id]) run.evidence[downstream.id] = { ...run.evidence[downstream.id], verifiedAt: undefined };
    }
    return run;
  });
}
export function resetLearningProgressInSession(read: ProgressRead, path: LearningPathShape): ProgressRead {
  const progress = { ...read.progress, paths: { ...read.progress.paths } };
  delete progress.paths[versionedPathKey(path)];
  const run = starterRun(path);
  const next = withRun({ ...read, progress }, run);
  return { ...read, progress: next, run, conflicts: [], blocked: true };
}
export function markStorageUnavailable(read: ProgressRead, message = 'Browser storage is unavailable. Work remains editable in this page session.'): ProgressRead {
  return { ...read, blocked: true, storageIssue: 'unavailable', message };
}
export function resetLearningProgress(path: LearningPathShape): void {
  if (typeof window === 'undefined') return;
  const raw = window.localStorage.getItem(LEARNING_PROGRESS_KEY);
  const rawOutput = window.localStorage.getItem(PROJECT_OUTPUT_KEY);
  if (rawOutput) {
    if (rawOutput.length > 500_000) throw new Error('Saved project file is too large to confirm; it was preserved.');
    let parsedOutput: unknown;
    try { parsedOutput = JSON.parse(rawOutput); } catch { throw new Error('Saved project file format could not be confirmed; it was preserved.'); }
    if (!validateMemoOutput(parsedOutput, path)) throw new Error('Saved project file is not valid; it was preserved.');
  }
  if (raw) {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || (parsed as LearningProgress).schemaVersion !== 1 || !(parsed as LearningProgress).paths || typeof (parsed as LearningProgress).paths !== 'object' || Array.isArray((parsed as LearningProgress).paths)) {
      throw new Error('Saved format could not be confirmed; other learning records were preserved.');
    }
    const paths = { ...(parsed as LearningProgress).paths };
    const existing = paths[versionedPathKey(path)];
    if (existing && !validateRun(existing, path)) throw new Error('This practice record is not valid; it was preserved.');
    delete paths[versionedPathKey(path)];
    if (Object.keys(paths).length) window.localStorage.setItem(LEARNING_PROGRESS_KEY, JSON.stringify({ schemaVersion: 1, paths }));
    else window.localStorage.removeItem(LEARNING_PROGRESS_KEY);
  }
  window.localStorage.removeItem(PROJECT_OUTPUT_KEY);
  window.dispatchEvent(new Event('choorai-learning-progress-change'));
}
export function saveMemoOutput(run: PathRun, version: number): SavedMemoApp {
  return { schemaVersion: 2, pathVersion: version, program: run.workspace.program, notes: [...run.workspace.notes], savedAt: new Date().toISOString() };
}
export function validateMemoOutput(raw: unknown, path: LearningPathShape): raw is SavedMemoApp {
  if (!raw || typeof raw !== 'object') return false;
  const app = raw as SavedMemoApp;
  return app.schemaVersion === 2 && app.pathVersion === path.version && typeof app.savedAt === 'string'
    && typeof app.program === 'string' && app.program.length <= MAX_MEMO_PROGRAM_LENGTH && parseMemoProgram(app.program).ok
    && Array.isArray(app.notes) && app.notes.length <= MAX_MEMO_NOTES
    && app.notes.every((note) => typeof note === 'string' && note.trim().length > 0 && note.length <= MAX_MEMO_NOTE_LENGTH);
}
export function createProgramExport(source: string, notes: readonly string[]): { filename: string; content: string } {
  return createMemoProjectExport(source, notes);
}
