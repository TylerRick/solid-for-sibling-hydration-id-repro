import http from 'node:http';
import { createServer as createViteServer } from 'vite';

const vite = await createViteServer({
	configFile: './vite.config.mjs',
	server: { middlewareMode: true },
	appType: 'custom',
});

const server = http.createServer((req, res) => {
	vite.middlewares(req, res, async () => {
		try {
			const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');
			const html = await render(req.url.includes('fix'));
			res.setHeader('content-type', 'text/html');
			res.end(html);
		} catch (e) {
			vite.ssrFixStacktrace(e);
			console.error(e);
			res.statusCode = 500;
			res.end(String(e && e.stack));
		}
	});
});
const port = Number(process.env.PORT) || 5851;
server.listen(port, () => console.log(`repro on http://localhost:${port}`));
