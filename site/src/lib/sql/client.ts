export type SQLValue = string | number | bigint | null;
export interface SQLResult { columns: string[]; values: SQLValue[][] }
export interface SQLTable { cols: string[]; types: string[]; desc: string[]; rows: SQLValue[][]; fixtures: SQLValue[][][] }
export interface QueryReply { type: 'result'; result: SQLResult; checks: boolean[]; pass: boolean }
export class SQLPracticeError extends Error {
  constructor(public kind: 'syntax' | 'limit' | 'environment' | 'scope' | 'cancelled', message: string) { super(message); }
}
export function classifySQLError(message: string): SQLPracticeError['kind'] {
  if (/초|행을 넘|너무|5,000|12,000|BLOB/.test(message)) return 'limit';
  if (/조회만|한 번에 SELECT|readonly|read-only|NUL/.test(message)) return 'scope';
  return 'syntax';
}
export class SQLPracticeEngine {
  private worker: Worker | null = null;
  private loading: Promise<void> | null = null;
  private request = 0;
  private pending: { id: number; resolve: (reply: QueryReply) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> } | null = null;
  private rejectLoading: ((error: Error) => void) | null = null;
  private initTimer: ReturnType<typeof setTimeout> | null = null;
  private async ensure(): Promise<void> {
    if (this.loading) return this.loading;
    const worker = new Worker(new URL('./engine.worker.js', import.meta.url), { type: 'module' });
    this.worker = worker;
    this.loading = new Promise<void>((resolve, reject) => {
      this.rejectLoading = reject;
      const initialized = () => { if (this.initTimer) clearTimeout(this.initTimer); this.initTimer = null; this.rejectLoading = null; resolve(); };
      this.initTimer = setTimeout(() => this.cancel(new SQLPracticeError('environment', 'SQLite를 준비하지 못했습니다. 새로고침 후 다시 실행해 주세요.')), 10000);
      worker.onerror = () => this.cancel(new SQLPracticeError('environment', 'SQLite 실행 환경을 열지 못했습니다. 네트워크에서 사이트 파일을 읽을 수 있는지 확인해 주세요.'));
      worker.onmessage = ({ data }) => {
        if (worker !== this.worker) return;
        if (data.type === 'ready') { initialized(); return; }
        if (data.type === 'init-error') { this.cancel(new SQLPracticeError('environment', data.message)); return; }
        if (!this.pending || data.id !== this.pending.id) return;
        const pending = this.pending; this.pending = null; clearTimeout(pending.timer);
        if (data.type === 'error') pending.reject(new SQLPracticeError(classifySQLError(data.message), data.message));
        else pending.resolve(data);
      };
      fetch('/sql/sqlite.wasm').then((response) => {
        if (!response.ok) throw new Error('SQLite 파일을 읽지 못했습니다.');
        return response.arrayBuffer();
      }).then((bytes) => {
        if (worker === this.worker) worker.postMessage({ type: 'init', wasm: new Uint8Array(bytes) });
      }).catch(() => { if (worker === this.worker) this.cancel(new SQLPracticeError('environment', 'SQLite 파일을 읽지 못했습니다. 연결을 확인하고 다시 실행해 주세요.')); });
    });
    return this.loading;
  }
  async run(tables: Record<string, SQLTable>, query: string, answer: string, preview = false): Promise<QueryReply> {
    if (query.length > 12000) throw new SQLPracticeError('limit', 'SQL은 12,000자 이내로 입력하세요.');
    await this.ensure();
    if (this.pending) throw new SQLPracticeError('environment', '이미 실행 중입니다. 중단한 뒤 다시 실행해 주세요.');
    return new Promise((resolve, reject) => {
      const id = ++this.request;
      const timer = setTimeout(() => this.cancel(new SQLPracticeError('limit', '실행 제한 3초를 넘겨 Worker를 중단했습니다. SQL을 줄여 다시 실행해 주세요.')), 3000);
      this.pending = { id, resolve, reject, timer };
      this.worker!.postMessage({ id, tables, query, answer, preview });
    });
  }
  cancel(error = new SQLPracticeError('cancelled', '실행을 중단했습니다.')): void {
    this.worker?.terminate(); this.worker = null;
    if (this.initTimer) clearTimeout(this.initTimer); this.initTimer = null;
    this.rejectLoading?.(error); this.rejectLoading = null; this.loading = null;
    if (this.pending) { clearTimeout(this.pending.timer); this.pending.reject(error); this.pending = null; }
  }
}
