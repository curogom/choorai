import { useEffect, useState } from 'react';
import Stepper from './Stepper';
import { localizeChallengePath, readCompletionSnapshot, type CompletionSnapshot } from '../lib/learning/challengeCompletion';

type Locale = 'ko' | 'en';

const labels = {
  ko: ['사전 준비', '프론트엔드', '백엔드', '연결', '배포', '진도 확인'],
  en: ['Preparation', 'Frontend', 'Backend', 'Connect', 'Deploy', 'Progress'],
};
const copy = {
  ko: { loading: '이 브라우저의 학습 진도를 읽는 중입니다.', error: '브라우저 저장 공간을 읽지 못했습니다. 완료 여부는 표시하지 않았습니다.', complete: '다섯 학습 체크리스트를 모두 완료로 표시했습니다.', incomplete: '아직 남은 학습 체크리스트가 있습니다.', checked: '직접 완료로 표시한 항목', stages: '완료 표시한 학습 묶음', evidence: '이 수치는 이 브라우저의 체크리스트만 집계합니다. 실제 빌드·서비스 수·공개 배포 URL은 여기서 확인하지 않았습니다.', next: '이어할 단계 열기', map: '학습 지도로 이동' },
  en: { loading: 'Reading learning progress in this browser.', error: 'Browser storage could not be read. Completion is not being claimed.', complete: 'All five lesson checklists are marked complete.', incomplete: 'There are lesson checklists left to mark complete.', checked: 'Items you marked complete', stages: 'Lesson groups marked complete', evidence: 'These numbers count this browser’s checklists only. This page has not verified a build, service count, or public deployment URL.', next: 'Open the next step', map: 'Go to the learning map' },
};

export default function ChallengeCompletionSummary({ locale = 'ko' }: { locale?: Locale }) {
  const [snapshot, setSnapshot] = useState<CompletionSnapshot | null>(null);
  const text = copy[locale];
  useEffect(() => {
    const update = () => setSnapshot(readCompletionSnapshot());
    update();
    window.addEventListener('60min-progress-change', update);
    window.addEventListener('storage', update);
    return () => { window.removeEventListener('60min-progress-change', update); window.removeEventListener('storage', update); };
  }, []);
  const stepLabels = labels[locale].map((label) => ({ label, status: 'upcoming' as const }));
  return <section aria-label={locale === 'ko' ? '실제 진도 상태' : 'Actual progress status'}>
    {snapshot && !snapshot.blocked && <div className="mb-5"><Stepper steps={stepLabels} currentStep={snapshot.currentStep} locale={locale} /></div>}
    {!snapshot && <p role="status" className="rounded-xl border border-border bg-surface p-4 text-sm text-text-secondary">{text.loading}</p>}
    {snapshot?.blocked && <p role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">{text.error}</p>}
    {snapshot && !snapshot.blocked && <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-surface to-background p-5 sm:p-8">
      <p className="text-sm font-bold text-primary">{locale === 'ko' ? '브라우저 저장 진도' : 'Browser-saved progress'}</p>
      <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">{snapshot.isComplete ? text.complete : text.incomplete}</h1>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-background/50 p-4"><p className="text-sm text-text-secondary">{text.checked}</p><p className="mt-1 text-2xl font-bold text-primary">{snapshot.checkedItems}/{snapshot.totalItems} · {snapshot.progress}%</p></div>
        <div className="rounded-xl border border-border bg-background/50 p-4"><p className="text-sm text-text-secondary">{text.stages}</p><p className="mt-1 text-2xl font-bold text-primary">{snapshot.completeStages}/{snapshot.totalStages}</p></div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-text-secondary">{text.evidence}</p>
      <a href={localizeChallengePath(snapshot.nextPath, locale)} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-background hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">{snapshot.isComplete ? text.map : text.next} <span aria-hidden="true">→</span></a>
    </div>}
  </section>;
}
