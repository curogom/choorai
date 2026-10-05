export const BUTTON_LESSON_STARTER: {
  readonly html: string;
  readonly css: string;
  readonly javascript: string;
};

export const BUTTON_LESSON_STORAGE_KEY: string;
export const BUTTON_LESSON_UNDO_STORAGE_KEY: string;
export const BUTTON_LESSON_MAX_FIELD_LENGTH: number;
export const BUTTON_LESSON_LAST_STAGE: number;

export function prepareButtonLessonPreview(html: string, css: string, javascript: string):
  | { ok: true; document: string; mismatch: null | { selector: string; expected: string; element: 'button' | 'message' }; expectedMessage: string }
  | { ok: false; error: 'html' | 'css' | 'javascript' | 'unsupported-feature'; feature?: string; diagnostic: { file: 'html' | 'css' | 'javascript'; line: number; column: number; code: string; feature?: string } };
export function readButtonLessonState(value: unknown): {
  html: string;
  css: string;
  javascript: string;
  stage: number;
  check: 'changed' | 'unchanged' | null;
  revision: number;
  unchangedRevision: number | null;
  repairRevision: number | null;
} | null;

export function createButtonLessonUndoSnapshot(value: unknown): { version: 1; state: NonNullable<ReturnType<typeof readButtonLessonState>> } | null;
export function readButtonLessonUndoSnapshot(value: unknown): ReturnType<typeof readButtonLessonState>;
