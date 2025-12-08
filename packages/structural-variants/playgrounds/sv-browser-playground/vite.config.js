import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['@ensembl/ensembl-genome-browser']
  }
});