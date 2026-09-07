/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Locked Design 7 Palette
        d7: {
          espresso: '#1B1208',
          walnut: '#2A1A0D',
          richWalnut: '#4A2C16',
          bronzeGold: '#C58A3A',
          antiqueGold: '#E0B15A',
          warmCream: '#F4E8D0',
          softSand: '#D8C5A8',
        },
        // Locked Design 11 Palette
        d11: {
          warmIvory: '#FAF7F0',
          softCream: '#F1E8D8',
          lightSand: '#E4D4BC',
          darkBrown: '#2A1A0D',
          richBrown: '#4A2C16',
          warmBronze: '#B8792F',
          deepText: '#241A12',
          mutedBrown: '#746556',
        },
        // Dynamic semantic theme tokens
        theme: {
          bg: 'var(--theme-bg)',
          'bg-card': 'var(--theme-bg-card)',
          'bg-surface': 'var(--theme-bg-surface)',
          'bg-alt': 'var(--theme-bg-alt)',
          border: 'var(--theme-border)',
          'border-light': 'var(--theme-border-light)',
          primary: 'var(--theme-primary)',
          'primary-hover': 'var(--theme-primary-hover)',
          secondary: 'var(--theme-secondary)',
          accent: 'var(--theme-accent)',
          'text-main': 'var(--theme-text-main)',
          'text-muted': 'var(--theme-text-muted)',
          'text-inv': 'var(--theme-text-inv)',
        }
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'rustic': '0 2px 8px -1px rgba(0, 0, 0, 0.25), 0 1px 3px -1px rgba(0, 0, 0, 0.15)',
        'premium': '0 2px 8px -1px rgba(42, 26, 13, 0.06), 0 1px 3px -1px rgba(42, 26, 13, 0.03)',
      }
    },
  },
  plugins: [],
}
