interface SectionHeaderProps {
  number: number;
  title: string;
  color?: 'primary' | 'green' | 'blue' | 'purple';
}

const colorStyles = {
  primary: 'bg-primary text-background',
  green: 'bg-green-500 text-background',
  blue: 'bg-blue-500 text-background',
  purple: 'bg-purple-500 text-background',
};

export default function SectionHeader({
  number,
  title,
  color = 'primary',
}: SectionHeaderProps) {
  return (
    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
      <span
        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${colorStyles[color]}`}
      >
        {number}
      </span>
      {title}
    </h2>
  );
}
