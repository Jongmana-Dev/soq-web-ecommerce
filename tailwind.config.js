/** @type {import('tailwindcss').Config} */
module.exports = {
  // ... (darkMode, content, etc.) ...
  theme: {
    extend: {
      fontFamily: {
        prompt: ['var(--font-prompt)', 'sans-serif'],
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: 'var(--brand)',
          500: 'var(--brand-500)',
          600: 'var(--brand-600)',
        },
        // เพิ่ม chrome-text สำหรับ dark mode
        'chrome-text': 'var(--chrome-text)',
      }
      // ... (keyframes, etc.) ...
    },
  },
  plugins: [],
}