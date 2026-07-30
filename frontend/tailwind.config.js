/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: 'var(--color-primary, #0f172a)', // Primary Dark Blue variable
          950: '#020617',
        },
        accent: {
          50: 'var(--color-accent-light, #f0f9ff)', // Accent light highlight
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: 'var(--color-accent, #0ea5e9)', // Accent Sky Blue variable
          600: 'var(--color-accent-dark, #0284c7)', // Accent hover state
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 10px -1px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  safelist: [
    'bg-slate-900',
    'bg-white',
    'bg-slate-50',
    'bg-slate-100',
    'bg-slate-950',
    'bg-sky-700',
    'bg-primary-900',
    'bg-primary-50',
    'bg-accent-50',
    'bg-accent-500',
    'py-12',
    'py-16',
    'py-20',
    'py-24',
    'py-32',
    'md:py-32',
    'text-white',
    'text-slate-900',
    'text-slate-600',
    'text-slate-500',
    'text-slate-400',
    'text-primary-900',
    'text-accent-500',
    'text-accent-400',
    'text-accent-300'
  ],
  plugins: [],
}
