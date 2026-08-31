# `<For>` followed by siblings desyncs hydration in solid-js 2.0.0-rc.4

A `<For>` with two rows, followed by two ordinary siblings — a `<button>` and a `<pre>` bound to a
signal. Under SSR + `hydrate`, the siblings after the list are built **detached** at `2.0.0-rc.4`, so
the button is never interactive. It is clean at `2.0.0-rc.3`, and the SSR markup is byte-identical
between the two — only the client changes.

That is the whole ingredient list: no custom components, no JSX-valued props, no `children()`, no
`<Show>`, no `keyed`, no metaframework.

## Run it

```sh
pnpm install
npx playwright install chromium # once, for the browser binary
node server.mjs                 # http://localhost:5851 (PORT overrides)
node check.mjs                  # probes both routes
```

- `/` — the SUBJECT (`src/App.tsx`): the `<For>` plus siblings.
- `/?fix` — the CONTROL (`src/AppFixed.tsx`): the identical siblings with the `<For>` removed and the
  two rows written out directly. This is what isolates `<For>` rather than the siblings or the
  signal.

## What happens

The server spends top-level hydration ids `0` and `1` on the two `<For>` rows (each row's element
gets a composed id, `000` and `010`) and gives the siblings `2` and `3`:

```
<div _hk=000 class="row">row <!--$-->1<!--/--></div>
<div _hk=010 class="row">row <!--$-->2<!--/--></div>
<button _hk=2 id="bump">bump</button>
<pre _hk=3 id="after">count: <!--$-->0<!--/--></pre>
```

At rc.4 the client arrives at the first sibling still holding `0`, so it asks for keys the server
never emitted:

```
Hydration key miss for "0": no server-rendered element carries this key (template: <button id=bump>bump).
  A detached element was created instead; its subtree will not appear in the document or become interactive.
Hydration key miss for "1": no server-rendered element carries this key (template: <pre id=after>count: <!$><!/>).
Hydration key miss for "300": no server-rendered element carries this key (template: <div class=row>row <!$><!/>).
```

The `<button>` in the document is the server's; the one carrying the click handler is not in the
document. So clicking does nothing and `count` stays at `0` forever.

`check.mjs` reports it directly:

```
--- SUBJECT (For + siblings)
  after click: "count: 0"  interactive: false
  hydration messages: 5
--- CONTROL (no For)
  after click: "count: 1"  interactive: true
  hydration messages: 0
```

| version | route            | hydration messages | interactive after click |
| ------- | ---------------- | ------------------ | ----------------------- |
| rc.4    | `/` (For)        | **5**              | **no** — `count: 0`     |
| rc.4    | `/?fix` (no For) | 0                  | yes — `count: 1`        |
| rc.3    | `/` (For)        | 0                  | yes — `count: 1`        |
| rc.3    | `/?fix` (no For) | 0                  | yes — `count: 1`        |

Because the shift is by the ROW COUNT, a list breaks everything that follows it rather than just
itself. In the real app this was found in, a single list cost the page 56 key misses and left 28
server-rendered nodes unclaimed, taking its buttons with it.

## Environment

Hydration depends on the compiler as well as the runtime, so the whole chain:

```
solid-js              2.0.0-rc.4
@solidjs/web          2.0.0-rc.4
@solidjs/vite-plugin  3.0.0-next.35   (via vite-plugin-solid 3.0.0-next.27)
@solidjs/compiler     2.0.0-rc.4
@solidjs/babel-plugin 2.0.0-rc.4
vite                  8.2.1
node                  24.19.0
```

No explicit `compiler` option is set — the plugin's default backend.

## Running the rc.3 control

Set `solid-js` and `@solidjs/web` to `2.0.0-rc.3` in `package.json`, and the three `pnpm.overrides`
to `3.0.0-next.34` / `2.0.0-rc.3` / `2.0.0-rc.3`. Then `pnpm install` and repeat. The SSR markup does
not change; only the client behaviour does.

## A guess at the mechanism, which may be wrong

It reads as the client not accounting for the ids the `<For>` scope consumed, so everything after the
list is off by the row count. rc.4 shipped the fix for
[#3033](https://github.com/solidjs/solid/issues/3033), which made hydration ids compose under a
scope rather than take flat sibling slots, and `<For>` rows are a composed-scope case — so the two
may be related. Neither claim is verified.
