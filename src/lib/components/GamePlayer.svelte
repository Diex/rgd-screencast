<script lang="ts">
	import type { Game } from '$lib/types/game';
	import { PLATFORM_TO_CORE } from '$lib/types/game';
	import { ref, getDownloadURL } from 'firebase/storage';
	import { storage } from '$lib/firebase';

	let { game }: { game: Game } = $props();

	let loadError = $state<string | null>(null);

	const EJS_CDN = 'https://cdn.emulatorjs.org/stable/data/';

	function isAbsoluteUrl(url: string): boolean {
		return url.startsWith('http://') || url.startsWith('https://');
	}

	async function resolveRomUrl(romUrl: string): Promise<string> {
		if (isAbsoluteUrl(romUrl)) return romUrl;
		return getDownloadURL(ref(storage, romUrl));
	}

	$effect(() => {
		let cancelled = false;
		let scriptEl: HTMLScriptElement | null = null;
		loadError = null;

		resolveRomUrl(game.romUrl).then((url) => {
			if (cancelled) return;

			const w = window as any;
			w.EJS_player = '#emulator-container';
			w.EJS_core = PLATFORM_TO_CORE[game.platform];
			w.EJS_gameUrl = url;
			w.EJS_pathtodata = EJS_CDN;
			w.EJS_startOnLoaded = true;

			scriptEl = document.createElement('script');
			scriptEl.src = `${EJS_CDN}loader.js`;
			document.body.appendChild(scriptEl);
		}).catch((err) => {
			if (cancelled) return;
			console.error('Failed to load ROM:', err);
			loadError = 'Failed to load game ROM.';
		});

		return () => {
			cancelled = true;
			if (scriptEl) scriptEl.remove();
			const ejsKeys = Object.keys(window).filter((k) => k.startsWith('EJS_'));
			for (const key of ejsKeys) {
				delete (window as any)[key];
			}
			const container = document.getElementById('emulator-container');
			if (container) container.innerHTML = '';
		};
	});
</script>

{#if loadError}
	<div class="flex aspect-video w-full max-w-4xl items-center justify-center rounded-lg bg-surface-800">
		<p class="text-error-500">{loadError}</p>
	</div>
{:else}
	<div id="emulator-container" class="aspect-video w-full max-w-4xl overflow-hidden rounded-lg"></div>
{/if}
