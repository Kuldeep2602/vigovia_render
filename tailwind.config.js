/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/templates/**/*.html",
    "./src/templates/**/*.css"
  ],
  theme: {
    extend: {
      colors: {
        vigovia: {
          primary: '#5419C9',
          secondary: '#764ba2',
          accent: '#667eea',
          dark: '#321E5D',
          light: '#936FE0'
        },
        // Legacy color support for existing templates
        'vigovia-primary': '#5419C9',
        'vigovia-accent': '#667eea',
        'vigovia-secondary': '#321E5D',
        'gradient-blue': '#5419C9',
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-vigovia': 'linear-gradient(135deg, #4A90E2 0%, #936FE0 100%)',
        'gradient-vigovia-full': 'linear-gradient(135deg, #4A90E2 0%, #936FE0 50%, #680099 100%)',
      }
    },
  },
  plugins: [],
}

