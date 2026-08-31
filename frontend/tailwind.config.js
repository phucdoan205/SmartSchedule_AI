/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0B192C',
        accent: '#00A8E8',
        softBlue: '#F0F7FF',
        softBlueDark: '#F8FAFC',
        success: '#10B981',
        alertAmber: '#F59E0B',
        alertRed: '#EF4444',
      },
    },
  },
  plugins: [],
}
