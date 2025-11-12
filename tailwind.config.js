/** @type {import('tailwindcss').Config} */
module.exports = {
  // ... (darkMode, content, etc.) ...
  theme: {
    extend: {
      fontFamily: {
        // 1. เพิ่ม CSS Variables ของฟอนต์ที่นี่
        prompt: ['var(--font-prompt)', 'sans-serif'],
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      // ... (colors, keyframes, etc.) ...
    },
  },
  plugins: [],
}