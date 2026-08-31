import { createSignal } from 'solid-js';

// CONTROL (served at /?fix): the same siblings with the <For> REMOVED — the rows are written out
// directly. Hydrates clean at rc.4, which is what isolates <For> as the ingredient rather than the
// siblings or the signal.
export default function AppFixed() {
	const [count, setCount] = createSignal(0);
	return (
		<>
			<div class="row">row 1</div>
			<div class="row">row 2</div>
			<button id="bump" onClick={() => setCount(count() + 1)}>
				bump
			</button>
			<pre id="after">count: {String(count())}</pre>
		</>
	);
}
