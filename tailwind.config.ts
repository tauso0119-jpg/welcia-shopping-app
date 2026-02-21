import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'
import forms from '@tailwindcss/forms'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        welcia: '#e60012',
        slate: colors.slate,
      },
    },
  },
  plugins: [
    forms,
  ],
}
export default config
