export const SQL_PROGRESS_KEY = 'choorai-sql-b01-b03-v1';
export type SQLStatus = 'draft' | 'pass' | 'mismatch' | 'error' | 'reviewed';
export interface PracticeAnswer { text: string; notes: string; status: SQLStatus; checks: boolean[]; verifiedAt?: string }
export interface PracticeProgress { version: 1; current: string; answers: Record<string, PracticeAnswer> }
export interface PracticeQuestion { id: string; type: string; checklist?: string[] }
export const blankAnswer = (): PracticeAnswer => ({ text: '', notes: '', status: 'draft', checks: [] });
export const freshPractice = (): PracticeProgress => ({ version: 1, current: 'B01-Q01', answers: {} });
export function selfChecklist(question: PracticeQuestion): string[] {
  return question.checklist?.length ? question.checklist : ['내 생각을 직접 적었다', '해설과 비교하고 차이를 확인했다'];
}
export function validatePractice(raw: unknown, questions: PracticeQuestion[]): PracticeProgress {
  if (!raw || typeof raw !== 'object') throw new Error('저장된 진도 형식을 읽지 못했습니다.');
  const input = raw as PracticeProgress;
  if (input.version !== 1 || !questions.some((q) => q.id === input.current) || !input.answers || typeof input.answers !== 'object' || Array.isArray(input.answers)) throw new Error('저장된 진도 형식을 읽지 못했습니다.');
  const out = freshPractice(); out.current = input.current;
  for (const [id, answer] of Object.entries(input.answers)) {
    const q = questions.find((question) => question.id === id);
    if (!q || !answer || typeof answer.text !== 'string' || answer.text.length > 12000 || typeof answer.notes !== 'string' || answer.notes.length > 4000 || !Array.isArray(answer.checks) || answer.checks.some((check) => typeof check !== 'boolean') || !['draft', 'pass', 'mismatch', 'error', 'reviewed'].includes(answer.status)) throw new Error('저장된 답안에 읽을 수 없는 항목이 있습니다.');
    if ((q.type === 'sql' && answer.status === 'reviewed') || (q.type !== 'sql' && ['pass','mismatch'].includes(answer.status)) || answer.checks.length > selfChecklist(q).length) throw new Error('문제 종류와 저장된 상태가 맞지 않습니다.');
    if (answer.status === 'reviewed' && (!answer.text.trim() || answer.checks.length !== selfChecklist(q).length || !answer.checks.every(Boolean))) throw new Error('자기 점검 기록이 부족합니다.');
    out.answers[id] = { text: answer.text, notes: answer.notes, status: answer.status, checks: [...answer.checks] };
    if (typeof answer.verifiedAt === 'string' && Number.isFinite(Date.parse(answer.verifiedAt))) out.answers[id].verifiedAt = answer.verifiedAt;
  }
  return out;
}
