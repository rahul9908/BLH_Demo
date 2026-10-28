/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      // Design tokens read from the public site's :root CSS variables (see SOURCES.md).
      colors: {
        ink: '#0e1014',
        muted: '#6b6259',
        cream: '#fbfaf7',
        sand: '#f2eee7',
        shell: '#faf5f2',
        navy: '#031025',
        leaf: { 50: '#eaf8ef', 100: '#cdeedb', 500: '#00af4c', 600: '#00af4c', 700: '#0b7c38', bright: '#52c122' },
        gold: { 100: '#fdf3d0', 400: '#ffc629', 500: '#e2a737' },
      },
      backgroundImage: { brand: 'linear-gradient(100deg, #e2a737, #00af4c)' },
      boxShadow: { soft: '0 24px 70px rgba(14, 16, 20, .12)' },
    },
  },
  plugins: [],
}
