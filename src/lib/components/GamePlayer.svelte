<script lang="ts">
	import type { Game } from '$lib/types/game';
	import { PLATFORM_TO_CORE } from '$lib/types/game';
	import { ref, getDownloadURL } from 'firebase/storage';
	import { storage } from '$lib/firebase';

	let { game }: { game: Game } = $props();

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

<div id="emulator-container" class="aspect-video w-full max-w-4xl overflow-hidden rounded-lg"></div>
