import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000, // Port untuk development server
    open: true  // Otomatis buka browser saat npm run dev
  },
  base: './' // Pastikan path relatif untuk file statis
});