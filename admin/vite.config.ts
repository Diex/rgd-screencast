import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	esbuild: {
		logOverride: { 'this-is-undefined-in-esm': 'silent' }
	},
	build: {
		outDir: './dist',
		target: 'ESNEXT',
		sourcemap: true
	},
	base: '/admin/',
	optimizeDeps: { include: ['react/jsx-runtime'] },
	plugins: [react(), tailwindcss()]
});
