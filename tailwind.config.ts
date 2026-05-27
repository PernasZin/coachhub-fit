import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: '#39FF7A',
        'bg-dark': '#080808',
        surface: {
          DEFAULT: '#101010',
          2: '#181818',
          3: '#222222',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.14)',
          neon: 'rgba(57, 255, 122, 0.3)',
        },
        text: {
          primary: '#F2F2F0',
          secondary: '#9A9A8E',
          muted: '#555550',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
        neon: '0 0 30px rgba(57, 255, 122, 0.25), 0 0 60px rgba(57, 255, 122, 0.1)',
        'neon-sm': '0 0 15px rgba(57, 255, 122, 0.3)',
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #39FF7A 0%, #00D4FF 100%)',
        'gradient-dark': 'linear-gradient(180deg, rgba(8,8,8,0) 0%, #080808 100%)',
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseNeon: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(57, 255, 122, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(57, 255, 122, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
