interface MetaBadgeProps {
  icon?: 'clock' | 'level' | 'none';
  text: string;
  color?: 'primary' | 'purple' | 'green';
}

const colorStyles = {
  primary: 'bg-primary/10 text-primary',
  purple: 'bg-accent-purple/10 text-accent-purple',
  green: 'bg-green-500/10 text-green-400',
};

function ClockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function LevelIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
}

export default function MetaBadge({
  icon = 'none',
  text,
  color = 'primary',
}: MetaBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4 ${colorStyles[color]}`}
    >
      {icon === 'clock' && <ClockIcon />}
      {icon === 'level' && <LevelIcon />}
      {text}
    </div>
  );
}
