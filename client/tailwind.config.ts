import { type Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // لتفعيل الدارك مود باستخدام كلاس
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10B981', // الأخضر الرئيسي (emerald-500 تقريباً)
          dark: '#047857',    // الغامق
          light: '#6EE7B7',   // الفاتح
        },
        secondary: {
          DEFAULT: '#64748B', // رمادي مائل للأزرق (slate-500 تقريباً)
        },
        backgroundLight: '#ffffff',
        backgroundDark: '#111827',
        textLight: '#1f2937', // gray-800
        textDark: '#f9fafb',  // gray-50
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif','Poppins'],
      },
      fontSize: {
        base: '1rem',
        sm: '0.875rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0, 0, 0, 0.08)',
        hard: '0 4px 16px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
export default config;
