import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';
type IconType = 'play' | 'book' | 'copy' | 'check' | 'arrow-right' | 'arrow-left' | 'none';

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconType;
  iconPosition?: 'left' | 'right';
  glow?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: never;
  };

type ButtonAsLink = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-primary hover:bg-primary-hover text-background
    font-bold transition-all transform hover:scale-105
  `,
  secondary: `
    bg-transparent hover:bg-white/5
    border border-white/20 text-white
    font-bold transition-colors
  `,
  ghost: `
    bg-transparent hover:bg-surface
    text-text-secondary hover:text-white
    font-medium transition-colors
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm rounded-md gap-1.5 whitespace-nowrap',
  md: 'h-11 px-6 text-base rounded-lg gap-2 whitespace-nowrap',
  lg: 'h-14 px-8 text-lg rounded-lg gap-2 whitespace-nowrap',
};

function Icon({ type }: { type: IconType }) {
  switch (type) {
    case 'play':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      );
    case 'book':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      );
    case 'copy':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      );
    case 'check':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'arrow-right':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      );
    case 'arrow-left':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 17l-5-5m0 0l5-5m-5 5h12"
          />
        </svg>
      );
    default:
      return null;
  }
}

export default function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    icon = 'none',
    iconPosition = 'left',
    glow = false,
    fullWidth = false,
    children,
    className = '',
    ...rest
  } = props;

  const baseStyles = `
    inline-flex items-center justify-center
    focus:outline-none focus-visible:ring-2
    focus-visible:ring-primary focus-visible:ring-offset-2
    focus-visible:ring-offset-background
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const glowStyles = glow && variant === 'primary' ? 'animate-glow' : '';
  const widthStyles = fullWidth ? 'w-full' : '';

  const combinedClassName = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${glowStyles}
    ${widthStyles}
    ${className}
  `;

  const content = (
    <>
      {icon !== 'none' && iconPosition === 'left' && (
        <span className="flex-shrink-0">
          <Icon type={icon} />
        </span>
      )}
      <span>{children}</span>
      {icon !== 'none' && iconPosition === 'right' && (
        <span className="flex-shrink-0">
          <Icon type={icon} />
        </span>
      )}
    </>
  );

  if ('href' in props && props.href) {
    const { href, ...linkProps } = rest as Omit<ButtonAsLink, keyof BaseProps>;
    return (
      <a href={href} className={combinedClassName} {...linkProps}>
        {content}
      </a>
    );
  }

  const buttonProps = rest as Omit<ButtonAsButton, keyof BaseProps>;
  return (
    <button className={combinedClassName} {...buttonProps}>
      {content}
    </button>
  );
}
