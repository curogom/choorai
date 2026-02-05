interface EditorCardProps {
  title: string;
  description: string;
  href: string;
  linkText: string;
  isRecommended?: boolean;
}

export default function EditorCard({
  title,
  description,
  href,
  linkText,
  isRecommended = false,
}: EditorCardProps) {
  const baseClass = isRecommended
    ? 'px-4 pt-2 pb-4 bg-surface border border-primary/50 rounded-xl hover:border-primary transition-colors no-underline relative overflow-visible'
    : 'p-4 bg-surface border border-border rounded-xl hover:border-primary/50 transition-colors no-underline';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={baseClass}
    >
      {isRecommended && (
        <span className="absolute -top-3 left-3 px-2 py-0.5 rounded bg-primary text-white text-xs font-bold z-10">
          추천
        </span>
      )}
      <h3 className={`text-white font-bold ${isRecommended ? 'mb-2' : 'mb-2'}`}>
        {title}
      </h3>
      <p className="text-text-secondary text-sm mb-2">{description}</p>
      <span className="text-primary text-sm">{linkText}</span>
    </a>
  );
}
