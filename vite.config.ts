import path from 'path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';


export default defineConfig({
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [tailwindcss()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
});
