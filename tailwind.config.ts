import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      colors: {
        petrik: {
          1: '#41988a',
          2: '#718935',
          3: '#99b18b',
        }
      }
    }
  },

  plugins: [typography, forms]
} satisfies Config;
