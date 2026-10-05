/**
 * A deliberately small, non-JavaScript language for the first memo exercise.
 * This parser/interpreter accepts only seven fixed lines and two condition
 * values. It never evaluates source as JavaScript or creates HTML from it.
 */
export const MAX_MEMO_PROGRAM_LENGTH = 2_000;
/** Fixed acceptance contract for this lesson's counter variation. */
export const MEMO_LESSON_NOTE_LIMIT = 160;
export const MAX_MEMO_NOTE_LENGTH = MEMO_LESSON_NOTE_LIMIT;
export const MAX_MEMO_NOTES = 100;

export interface MemoProgram {
  limit: number;
  showRemaining: boolean;
  emptyWhen: 'empty' | 'not empty';
  message: 'empty_note_error';
}

export type MemoProgramParse =
  | { ok: true; program: MemoProgram }
  | { ok: false; reason: 'too-long' | 'syntax'; line?: number };

export interface MemoExecution {
  ok: boolean;
  action: 'show-message' | 'add-note' | 'limit-error' | 'code-error';
  notes: string[];
  note?: string;
  message?: string;
  counter: null | { remaining: number; limit: number };
  inputCleared: boolean;
}

const CORE_LINES = 6;

export function parseMemoProgram(source: string): MemoProgramParse {
  if (typeof source !== 'string' || source.length > MAX_MEMO_PROGRAM_LENGTH) {
    return { ok: false, reason: 'too-long' };
  }
  const lines = source.replace(/\r\n?/g, '\n').replace(/\n+$/, '').split('\n');
  if (lines.length !== CORE_LINES && lines.length !== 9) return { ok: false, reason: 'syntax', line: Math.min(lines.length + 1, 9) };

  const limit = /^note_limit: ([1-9]\d{0,2})$/.exec(lines[0]);
  const guard = /^  if note is (empty|not empty):$/.exec(lines[2]);
  const message = lines[3] === '    show empty_note_error';
  if (!limit) return { ok: false, reason: 'syntax', line: 1 };
  if (lines[1] !== 'on add:') return { ok: false, reason: 'syntax', line: 2 };
  if (!guard) return { ok: false, reason: 'syntax', line: 3 };
  if (!message) return { ok: false, reason: 'syntax', line: 4 };
  if (lines[4] !== '  else:') return { ok: false, reason: 'syntax', line: 5 };
  if (lines[5] !== '    add note to list') return { ok: false, reason: 'syntax', line: 6 };
  const showRemaining = lines.length === 9;
  if (showRemaining && (lines[6] !== '' || lines[7] !== 'on input:' || lines[8] !== '  show remaining characters')) {
    return { ok: false, reason: 'syntax', line: lines[6] === '' ? 8 : 7 };
  }

  const parsedLimit = Number(limit[1]);
  if (parsedLimit < 1 || parsedLimit > MAX_MEMO_NOTE_LENGTH) return { ok: false, reason: 'syntax', line: 1 };
  return {
    ok: true,
    program: {
      limit: parsedLimit,
      showRemaining,
      emptyWhen: guard[1] as MemoProgram['emptyWhen'],
      message: 'empty_note_error',
    },
  };
}

export function executeMemoProgram(source: string, input: string, notes: readonly string[] = []): MemoExecution {
  const parsed = parseMemoProgram(source);
  const safeNotes = notes.slice(0, MAX_MEMO_NOTES);
  if (!parsed.ok) {
    return { ok: false, action: 'code-error', notes: [...safeNotes], message: parsed.reason === 'too-long' ? 'Program is too long (maximum 2,000 characters).' : `Check the supported syntax near line ${parsed.line || 1}.`, counter: null, inputCleared: false };
  }

  const { program } = parsed;
  const counter = program.showRemaining ? runMemoInputHandlerFromProgram(program, input) : null;
  const trimmed = input.trim();
  if (input.length > program.limit) {
    return { ok: false, action: 'limit-error', notes: [...safeNotes], message: `limit:${program.limit}`, counter, inputCleared: false };
  }

  const isEmpty = trimmed.length === 0;
  const conditionMatches = program.emptyWhen === 'empty' ? isEmpty : !isEmpty;
  if (conditionMatches) {
    return { ok: true, action: 'show-message', notes: [...safeNotes], message: program.message, counter, inputCleared: false };
  }
  return { ok: true, action: 'add-note', notes: [...safeNotes, trimmed], note: trimmed, counter, inputCleared: true };
}

function runMemoInputHandlerFromProgram(program: MemoProgram, input: string): { remaining: number; limit: number } {
  return { remaining: Math.max(0, program.limit - input.length), limit: program.limit };
}

export function runMemoInputHandler(source: string, input: string): { ok: boolean; remaining?: number; limit?: number; error?: string } {
  const parsed = parseMemoProgram(source);
  if (!parsed.ok) return { ok: false, error: parsed.reason === 'too-long' ? 'Program is too long (maximum 2,000 characters).' : `Check the supported syntax near line ${parsed.line || 1}.` };
  if (!parsed.program.showRemaining) return { ok: false, error: 'The on input handler is missing.' };
  const output = runMemoInputHandlerFromProgram(parsed.program, input);
  return { ok: true, ...output };
}

export interface ProgramCheck {
  id: string;
  passed: boolean;
  observed: string;
}

export function checkMemoGuard(source: string): { passed: boolean; checks: ProgramCheck[] } {
  const empty = executeMemoProgram(source, '', []);
  const valid = executeMemoProgram(source, '첫 메모', []);
  const checks: ProgramCheck[] = [
    { id: 'empty', passed: empty.ok && empty.action === 'show-message' && empty.notes.length === 0 && !empty.inputCleared, observed: empty.action === 'add-note' ? 'An empty note was added.' : empty.action === 'show-message' ? 'Empty input was rejected.' : empty.message || 'The program did not run.' },
    { id: 'valid', passed: valid.ok && valid.action === 'add-note' && valid.notes.length === 1 && valid.notes[0] === '첫 메모' && valid.inputCleared, observed: valid.action === 'add-note' ? 'A non-empty note was added and the input clears.' : valid.action === 'show-message' ? 'A non-empty note was rejected.' : valid.message || 'The program did not run.' },
  ];
  return { passed: checks.every((check) => check.passed), checks };
}

export function checkCounterVariation(source: string): { passed: boolean; checks: ProgramCheck[] } {
  const blank = runMemoInputHandler(source, '');
  const oneCharacter = runMemoInputHandler(source, 'a');
  const declared = parseMemoProgram(source);
  const matchesLessonContract = declared.ok && declared.program.limit === MEMO_LESSON_NOTE_LIMIT;
  const checks: ProgramCheck[] = [
    {
      id: 'visible',
      passed: matchesLessonContract && blank.ok && blank.limit === MEMO_LESSON_NOTE_LIMIT && blank.remaining === MEMO_LESSON_NOTE_LIMIT,
      observed: blank.ok ? `Counter visible: ${blank.remaining} remaining.` : 'Counter handler is missing or invalid.',
    },
    {
      id: 'updates',
      passed: matchesLessonContract && oneCharacter.ok && oneCharacter.limit === MEMO_LESSON_NOTE_LIMIT && oneCharacter.remaining === MEMO_LESSON_NOTE_LIMIT - 1,
      observed: oneCharacter.ok ? `After one character: ${oneCharacter.remaining} remaining.` : 'Counter handler is missing or invalid.',
    },
  ];
  return { passed: checks.every((check) => check.passed), checks };
}

export function createMemoProgramExport(source: string): { filename: string; content: string } {
  return { filename: 'memo.choorai', content: source.endsWith('\n') ? source : `${source}\n` };
}

export function createMemoProjectExport(source: string, notes: readonly string[]): { filename: string; content: string } {
  return {
    filename: 'memo-project.json',
    content: `${JSON.stringify({ format: 'choorai-memo-project', version: 2, program: source, notes: [...notes] }, null, 2)}\n`,
  };
}
