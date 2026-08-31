import { For, createSignal } from 'solid-js';

// SUBJECT: a <For> with ORDINARY SIBLINGS AFTER IT, under SSR + hydrate.
//
// That is the whole ingredient list. No components, no JSX-valued props, no children() memos, no
// <Show>, no keyed, no TanStack, no solid-query. The server gives the two rows hydration ids 0 and
// 1 and the siblings 2 and 3; at 2.0.0-rc.4 the client asks for 0 and 1 for the SIBLINGS, misses,
// and builds them detached — so the button below is never interactive and `count` never advances.
export default function App() {
	const [count, setCount] = createSignal(0);
	return (
		<>
			<For each={[{ id: 1 }, { id: 2 }]}>{(row) => <div class="row">row {row.id}</div>}</For>
			<button id="bump" onClick={() => setCount(count() + 1)}>
				bump
			</button>
			<pre id="after">count: {String(count())}</pre>
		</>
	);
}
