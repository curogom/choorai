/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 배경 색상
        background: {
          DEFAULT: '#0D1117',
          secondary: '#161B22',
          tertiary: '#21262D',
        },
        // 카드/표면
        surface: {
          DEFAULT: '#161B22',
          elevated: '#21262D',
        },
        // 테두리
        border: {
          DEFAULT: '#30363D',
          focus: '#57ABFF',
        },
        // 텍스트
        text: {
          primary: '#FFFFFF',
          secondary: '#8B949E',
          muted: '#6E7681',
        },
        // 액센트 색상
        primary: {
          DEFAULT: '#57ABFF',
          hover: '#79BDFF',
          dark: '#1F6FEB',
        },
        accent: {
          purple: '#A855F7',
          'purple-hover': '#C084FC',
        },
        success: {
          DEFAULT: '#238636',
          light: '#2EA043',
          bg: 'rgba(35, 134, 54, 0.15)',
        },
        warning: {
          DEFAULT: '#9E6A03',
          light: '#BB8009',
          bg: 'rgba(158, 106, 3, 0.15)',
        },
        error: {
          DEFAULT: '#DA3633',
          light: '#F85149',
          bg: 'rgba(218, 54, 51, 0.15)',
        },
      },
      fontFamily: {
        display: ['Inter', 'Noto Sans KR', 'sans-serif'],
        body: ['Inter', 'Noto Sans KR', 'sans-serif'],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        glow: '0 0 20px rgba(87, 171, 255, 0.4)',
        'glow-lg': '0 0 35px rgba(87, 171, 255, 0.6)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.4)',
      },
      animation: {
        'subtle-pulse': 'subtle-pulse 3s infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
      },
      keyframes: {
        'subtle-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(87, 171, 255, 0.4)' },
          '50%': { boxShadow: '0 0 35px rgba(87, 171, 255, 0.6)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
