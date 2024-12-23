/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./resources/**/*.{vue,js,ts,blade.php}",
    "./resources/js/src/**/*.{vue,js,ts}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          200: '#3B82F6',  // Blue color
          300: '#2563EB',  // Darker blue
          400: '#1D4ED8'   // Even darker blue
        }
      }
    }
  },
  plugins: []
};
