import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
	plugins: [solid({ ssr: true })],
	server: { port: 5851, strictPort: true },
});
