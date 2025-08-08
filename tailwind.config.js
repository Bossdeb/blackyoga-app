/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        lineGreen: '#06C755'
      }
    },
  },
  plugins: [],
  server: {
    host: true, // ให้สามารถเข้าถึงได้จาก external IP เช่น ngrok
    allowedHosts: ['all'], // หรือเฉพาะโดเมนจาก ngrok ก็ได้
  }
}