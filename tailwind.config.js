/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0a1628',
          900: '#0f1f38',
          800: '#152b4d',
          700: '#1c3a63',
          600: '#254a7d',
        },
        brand: {
          50: '#effcf6',
          100: '#d7f7e8',
          200: '#b0eed3',
          300: '#7edfb9',
          400: '#46c99a',
          500: '#20ac7e',
          600: '#158a67',
          700: '#136e55',
          800: '#135846',
          900: '#12483b',
        },
        accent: {
          50: '#eef6ff',
          100: '#d9ecff',
          200: '#bcdfff',
          300: '#8ecaff',
          400: '#59adff',
          500: '#328aff',
          600: '#1b69f5',
          700: '#1552e0',
          800: '#1843b5',
          900: '#193b8f',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,31,56,0.06), 0 8px 24px -8px rgba(15,31,56,0.12)',
        lifted: '0 20px 45px -15px rgba(15,31,56,0.35)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
