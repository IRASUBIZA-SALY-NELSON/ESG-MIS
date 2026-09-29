import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: 'class',
  content: [
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        primary: {
          DEFAULT: '#024F3A',
          50: '#E8F5EF',
          100: '#C9E8DA',
          200: '#97D1B7',
          300: '#62B893',
          400: '#37A075',
          500: '#1A8660',
          600: '#0A6B4F',
          700: '#024F3A',
          800: '#013F2E',
          900: '#012F22',
          950: '#001F16',
        },
        accent: {
          DEFAULT: '#FCB90A',
          light: '#FFF4D1',
          dark: '#C98F00',
        },
        info: {
          DEFAULT: '#0357BD',
          light: '#E6F0FB',
        },
        mainPurple: '#024F3A',
        mainPurpleLight: '#2F8A68',
        mainPurpleLightest: '#8CC5AD',
        lightPurple: '#E7F2EC',
        mainPurpleDark: '#01261C',
        mainPurpleDarkest: '#00140E',
        mainGray: '#D9D9D975',
        // Spread colors but omit deprecated names
        ...Object.fromEntries(
          Object.entries(colors).filter(([key]) => 
            !['lightBlue', 'warmGray', 'trueGray', 'coolGray', 'blueGray'].includes(key)
          )
        ),

        // light mode
        tremor: {
          brand: {
            faint: '#E8F5EF',
            muted: '#97D1B7',
            subtle: '#37A075',
            DEFAULT: '#0A6B4F',
            emphasis: '#024F3A',
            inverted: colors.white,
          },
          background: {
            muted: colors.gray[50],
            subtle: colors.gray[100],
            DEFAULT: colors.white,
            emphasis: colors.gray[700],
          },
          border: {
            DEFAULT: colors.gray[200],
          },
          ring: {
            DEFAULT: colors.gray[200],
          },
          content: {
            subtle: colors.gray[400],
            DEFAULT: colors.gray[500],
            emphasis: colors.gray[700],
            strong: colors.gray[900],
            inverted: colors.white,
          },
        },
        // dark mode
        'dark-tremor': {
          brand: {
            faint: '#00140E',
            muted: '#012F22',
            subtle: '#0A6B4F',
            DEFAULT: '#1A8660',
            emphasis: '#37A075',
            inverted: '#001F16',
          },
          background: {
            muted: '#131A2B',
            subtle: colors.gray[800],
            DEFAULT: colors.gray[900],
            emphasis: colors.gray[300],
          },
          border: {
            DEFAULT: colors.gray[700],
          },
          ring: {
            DEFAULT: colors.gray[800],
          },
          content: {
            subtle: colors.gray[600],
            DEFAULT: colors.gray[500],
            emphasis: colors.gray[200],
            strong: colors.gray[50],
            inverted: colors.gray[950],
          },
        },
      },
    },
    screens: {
      xs: '480px',
      '2sm': '512px',
      ...defaultTheme.screens,
    },
    boxShadow: {
      // light
      'tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      'tremor-card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      'tremor-dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      // dark
      'dark-tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      'dark-tremor-card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      'dark-tremor-dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    },
  },
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ['hover', 'ui-selected'],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ['hover', 'ui-selected'],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ['hover', 'ui-selected'],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
  ],
  plugins: [require('tailwindcss-animated'), require('@headlessui/tailwindcss')],
};
export default config;
