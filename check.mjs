// Post-hydration probe for both routes.
//   npx playwright install chromium   # once
//   node check.mjs                    # probes http://localhost:5851 (PORT overrides)
import { chromium } from 'playwright';

const port = process.env.PORT || 5851;
const browser = await chromium.launch();
for (const [label, path] of [
	['SUBJECT (For + siblings)', '/'],
	['CONTROL (no For)', '/?fix'],
]) {
	const page = await browser.newPage();
	const messages = [];
	page.on('console', (m) => {
		if (m.type() !== 'log') messages.push(`[${m.type()}] ${m.text()}`);
	});
	page.on('pageerror', (e) => messages.push(`[pageerror] ${String(e)}`));
	await page.goto(`http://localhost:${port}${path}`, { waitUntil: 'load' });
	await page.waitForTimeout(600);
	await page.click('#bump');
	await page.waitForTimeout(400);
	const after = await page.evaluate(() => document.getElementById('after')?.textContent);
	const hydration = messages.filter((m) => /ydration/.test(m));
	console.log(`--- ${label}`);
	console.log(`  after click: ${JSON.stringify(after)}  interactive: ${after === 'count: 1'}`);
	console.log(`  hydration messages: ${hydration.length}`);
	for (const m of hydration.slice(0, 3)) console.log(`    ${m.slice(0, 170)}`);
	await page.close();
}
await browser.close();
// At rc.4: SUBJECT reports 5 hydration messages and stays at "count: 0" (button detached);
// CONTROL is clean and interactive. At rc.3 BOTH are clean and interactive.
