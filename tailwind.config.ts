import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors:{
      'white':'#ffffff',
      'black':'#000000',
      'vague':'#f7f7f7',
      'notblack':'#080808',

      'lightblue':'#e4e6eb',
      'pastelblue':'#8bb4c9',
      'blue':'#2c5edb',
      'bluegrey':'#b6c1d4',
      'steelgrey':'#5e6673',
      'darksteelgrey':'#202b3d',

      'red':'#e34653',
      'pink':'#ffc7d1',

      'mauve':'#54567d',
      'cerulean':'#22266b',
      'depths':'#090b24',

      'lightgrey':'#c9c9c9',
      'darkgrey':'#4f4f4f',

  'off-white': '#f7f7f7',

  'deep-black': '#080808',

  'sky-blue': '#e4e6eb',
  'cloud-blue': '#d5d7de',
  'pastel-blue': '#8bb4c9',
  'ocean-blue': '#2c5edb',
  'navy-blue': '#204ab0',
  'slate-grey': '#b6c1d4',
  'steel-grey': '#5e6673',
  'iron-grey': '#424853',
  'charcoal-grey': '#202b3d',

  'sunset-red': '#e34653',
  'crimson-red': '#cc3e47',
  'rose-pink': '#ffc7d1',
  'blush-pink': '#ffe0e5',

  'lavender-haze': '#54567d',
  'violet-haze': '#454668',
  'deep-cerulean': '#22266b',
  'midnight-blue': '#1a1d52',
  'abyss-blue': '#090b24',

  'light-grey': '#c9c9c9',
  'stone-grey': '#aeaeae',
  'dark-grey': '#4f4f4f',
  'shadow-grey': '#3b3b3b',

      royalBlue: {
        100: "#B3C8F5",
        300: "#5F86E6",
        default: "#2C5EDB",
        700: "#2048A8",
        800: "#162F75",
        900: "#0F1F4D",
      },

      emeraldGreen: {
        100: "#E6FAEE",
        300: "#87E9B4",
        default: "#4DDB83",
        700: "#2CA059",
        900: "#146130",
      },
      crimsonRed: {
        100: "#FCE8E7",
        300: "#E57D7A",
        default: "#DB544D",
        700: "#A2302B",
        900: "#5C1A17",
      },
      orchidPink: {
        100: "#FAE8FA",
        300: "#F3B5F4",
        default: "#ED8EEF",
        700: "#B95AB9",
        900: "#701B70",
      },
      mintGreen: {
        100: "#E6FCEA",
        300: "#A7F5AC",
        default: "#71EF80",
        700: "#3FBE4D",
        900: "#1E6825",
      },
      mintGreenDesaturated: {
  100: "#EDF2EE",
  300: "#BFDDC0",
  default: "#9EC99E",
  700: "#759B76",
  900: "#4D634E",
},
    },
    fontFamily:{
      'header':['Roboto', 'sans-serif'],
      'body':['Nonserif', 'sans-serif'],
    },
    extend: {},
  },
  plugins: [],
} satisfies Config;
