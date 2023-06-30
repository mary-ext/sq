import { defineConfig, transformWithEsbuild } from 'vite';

import solid from 'vite-plugin-solid';

const mangleCache = {};

export default defineConfig({
	plugins: [
		solid(),
		{
			name: 'minify-bundle',
			async renderChunk(code, chunk) {
				const result = await transformWithEsbuild(code, 'bundle', {
					mangleProps: /^_/,
					mangleCache,
				});

				Object.assign(mangleCache, result.mangleCache);

				return { code: result.code, map: result.map };
			},
		},
	],
	build: {
		lib: {
			entry: './lib/index.ts',
			formats: ['es'],
		},
		rollupOptions: {
			external: ['solid-js', '@solid-primitives/event-listener'],
		},
		minify: false,
		sourcemap: true,
		target: 'esnext',
		modulePreload: {
			polyfill: false,
		},
	},
});
