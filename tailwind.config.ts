import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/stores/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecf3ff',
          100: '#d9e6ff',
          200: '#a4c2ff',
          300: '#6e9dff',
          400: '#477fff',
          500: '#1f60ff',
          600: '#194ddb',
          700: '#1239a6',
          800: '#0b2670',
          900: '#05133b'
        }
      },
      boxShadow: {
        elevation: '0 10px 30px -10px rgba(31, 96, 255, 0.35)'
      }
    }
  },
  plugins: []
}

export default config
