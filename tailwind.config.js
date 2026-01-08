/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'oms-brown': '#8B4513',
        'oms-beige': '#F5F5DC',
        'oms-orange': '#FF6B35',
      },
    },
  },
  plugins: [],
}
