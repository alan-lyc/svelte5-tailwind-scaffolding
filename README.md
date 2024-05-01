# svelte5-tailwind-scaffolding

This is just a simple package to bootstrap my personal projects with Svelte 5 and TailwindCSS. Nothing special.

## Setup
### 1. Install Everything
```bash
npm create svelte@latest   # select Svelte 5
npm i
npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p
npm i @alanlyc/svelte5-tailwind-scaffolding
```
### 2. `tailwind.config.js`
```js
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {},
	},
	plugins: [],
	darkMode: "class",
}
```
### 3. `src/app.html`
```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="%sveltekit.assets%/favicon.png" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		%sveltekit.head%
		<script>
			if (
				window.matchMedia('prefers-color-scheme: dark') ||
				localStorage.getItem('theme') === 'dark'
			)
				document.documentElement.classList.add('dark');
			if (localStorage.getItem('theme') === 'light')
				document.documentElement.classList.remove('dark');
		</script>
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
```
### 4. `src/routes/+layout.svelte`
```svelte
<script lang="ts">
	import { Scaffolding } from "@alanlyc/svelte5-tailwind-scaffolding"
</script>

<Scaffolding />

<slot />
```
### 5. `src/routes/+page.svelte`
```svelte
<script lang="ts">
	import { modal, Button } from "@alanlyc/svelte5-tailwind-scaffolding"
</script>

<Button class="block" onclick={async () => {
	// most part of the modal was designed by Tailwind UI
	// but dark mode was added by me
	await modal({
		type: "ok",
		title: "Congradulations!",
		md: "You have completed setting up the scaffolding!",
		actions: ["OK"],
	})
}}>
	OK Modal
</Button>
```
### 6. `npm run dev`
When you click the button, you may encounter a Vite optimization and see a hydration error. It should be fine to just wait for it to reload.

## Bonus: cloudflare
Since setting up Cloudflare + SvelteKit for development is a hassle, I will just add a section here on how to setup Cloudflare development environment (only partially tested as of right now).

### 1. Install Everything
```bash
npm i -D @cloudflare/workers-types @sveltejs/adapter-cloudflare miniflare
```
### 2. `src/hooks.server.ts`
```ts
import { dev } from "$app/environment";
import type { Miniflare } from "miniflare";

let mf: Miniflare;

export async function handle({ event, resolve }) {
	if (dev) {
		if (!mf) {
			const { Miniflare, Log, LogLevel } = await import("miniflare");
			mf = new Miniflare({
				log: new Log(LogLevel.INFO),
				kvPersist: ".wrangler/state/v3/kv",
				kvNamespaces: ["KV"],
				r2Persist: ".wrangler/state/v3/r2",
				r2Buckets: ["RV"],
				// ... and whatever bindings you have
				script: "",
				modules: true,
			});
		}
		event.platform = { env: await mf.getBindings() };
	}
	return resolve(event);
}
```
### 3. `src/app.d.ts`
```ts
import type { KVNamespace, R2Bucket } from "@cloudflare/workers-types";

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				KV: KVNamespace,
				R2: R2Bucket,
			}
		}
	}
}

export {};
```
### 4. `wrangler.toml`
You don't actually have to put any config here for development.
```toml
name = "<insert_app_name>"
compatibility_date = "<insert_today_YYYY-MM-DD>"
```
### 5. `npm run dev`
If vite is trying to optimize miniflare, configure `vite.config.ts` as follow:
```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	optimizeDeps: {
		exclude: ['miniflare']
	}
});
```
### 6. Interact with bindings with Wrangler
Interact with KV:
```bash
# notice that we use --namespace-id, not --bindings (which is used if we actually use wrangler.toml)
npx wrangler kv:key put abcxyz "https://google.com" --namespace-id KV --local
```