import { useMemo, useState } from 'react';

interface FeedbackBoxProps {
  currentPath?: string;
  lang?: 'ko' | 'en';
}

const TEXT = {
  ko: {
    title: '피드백 보내기',
    placeholder: '개선되면 좋을 점, 불편한 점, 오타 등을 적어주세요.',
    button: 'GitHub 이슈로 보내기',
    hint: '입력한 내용으로 새 이슈 페이지를 엽니다.',
  },
  en: {
    title: 'Send Feedback',
    placeholder: 'Share improvements, friction points, or typo reports.',
    button: 'Open GitHub Issue',
    hint: 'Opens a new issue page with your message.',
  },
} as const;

export default function FeedbackBox({ currentPath = '', lang = 'ko' }: FeedbackBoxProps) {
  const [message, setMessage] = useState('');
  const t = TEXT[lang];

  const issueUrl = useMemo(() => {
    const title = lang === 'ko' ? '[피드백] 문서 개선 제안' : '[Feedback] Docs improvement';
    const body = [
      `Path: ${currentPath || '(unknown)'}`,
      '',
      message || (lang === 'ko' ? '여기에 내용을 입력해 주세요.' : 'Please enter your feedback here.'),
    ].join('\n');

    const params = new URLSearchParams({
      title,
      labels: 'feedback',
      body,
    });

    return `https://github.com/curogom/choorai/issues/new?${params.toString()}`;
  }, [currentPath, lang, message]);

  return (
    <section className="mt-10 border border-border rounded-xl bg-surface/40 p-4">
      <h3 className="text-sm font-bold text-white mb-2">{t.title}</h3>
      <textarea
        className="w-full min-h-24 resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-white placeholder:text-text-secondary focus:outline-none focus:border-primary"
        placeholder={t.placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-text-secondary">{t.hint}</p>
        <a
          href={issueUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-primary text-background hover:bg-primary-hover transition-colors"
        >
          {t.button}
        </a>
      </div>
    </section>
  );
}
