import { generateHydrationScript, renderToStream } from '@solidjs/web';
import App from './App';
import AppFixed from './AppFixed';

export async function render(fixed: boolean): Promise<string> {
	const Root = fixed ? AppFixed : App;
	const stream = renderToStream(() => <Root />);
	const chunks: string[] = [];
	const decoder = new TextDecoder();
	await stream.pipeTo(
		new WritableStream({
			write(chunk) {
				chunks.push(typeof chunk === 'string' ? chunk : decoder.decode(chunk));
			},
		}),
	);
	return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>solid2 jsx-prop getter repro${fixed ? ' (control)' : ''}</title>
${generateHydrationScript()}
</head>
<body>
<div id="root">${chunks.join('')}</div>
<script type="module" src="/src/entry-client.tsx"></script>
</body>
</html>`;
}
