<script lang="ts">
	import type { Game } from '$lib/types/game';
	import { getCoreForPlatform } from '$lib/types/game';
	import { ref, getDownloadURL } from 'firebase/storage';
	import { storage } from '$lib/firebase';

	let { game }: { game: Game } = $props();

	let loadError = $state<string | null>(null);
	let iframeSrc = $state<string | null>(null);

	const EJS_CDN = 'https://cdn.emulatorjs.org/stable/data/';

	function isAbsoluteUrl(url: string): boolean {
		return url.startsWith('http://') || url.startsWith('https://');
	}

	async function resolveRomUrl(romUrl: string): Promise<string> {
		if (isAbsoluteUrl(romUrl)) return romUrl;
		return getDownloadURL(ref(storage, romUrl));
	}

	function buildMsxIframeBlobUrl(romUrl: string): string {
		const wmsxUrl = `${window.location.origin}/wmsx.js`;
		const html = `<!DOCTYPE html>
<html><head>
<style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#000}</style>
</head><body>
<div id="wmsx-screen" style="width:100%;height:100%"></div>
<script src="${wmsxUrl}"><\/script>
<script>
  WMSX.CARTRIDGE1_URL = '${romUrl}';
  WMSX.SCREEN_ELEMENT_ID = 'wmsx-screen';
<\/script>
</body></html>`;
		return URL.createObjectURL(new Blob([html], { type: 'text/html' }));
	}

	function buildIframeBlobUrl(romUrl: string, core: string): string {
		const html = `<!DOCTYPE html>
<html><head>
<style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#000}</style>
</head><body>
<div id="game" style="width:100%;height:100%"></div>
<script>
  var EJS_player = '#game';
  var EJS_core = '${core}';
  var EJS_gameUrl = '${romUrl}';
  var EJS_pathtodata = '${EJS_CDN}';
  var EJS_startOnLoaded = true;
<\/script>
<script src="${EJS_CDN}loader.js"><\/script>
</body></html>`;
		return URL.createObjectURL(new Blob([html], { type: 'text/html' }));
	}

	$effect(() => {
		let cancelled = false;
		loadError = null;
		iframeSrc = null;

		const isMsx = game.platform === 'msx';
		const core = isMsx ? 'webmsx' : getCoreForPlatform(game.platform);
		if (!core) {
			loadError = `Unsupported platform: "${game.platform ?? 'unknown'}"`;
			return;
		}

		resolveRomUrl(game.rom).then((url) => {
			if (cancelled) return;
			iframeSrc = isMsx ? buildMsxIframeBlobUrl(url) : buildIframeBlobUrl(url, core);
		}).catch((err) => {
			if (cancelled) return;
			console.error('Failed to load ROM:', err);
			loadError = 'Failed to load game ROM.';
		});

		return () => {
			cancelled = true;
			if (iframeSrc) URL.revokeObjectURL(iframeSrc);
		};
	});
</script>

{#if loadError}
	<div class="flex aspect-video w-full max-w-4xl items-center justify-center rounded-lg bg-surface-800">
		<p class="text-error-500">{loadError}</p>
	</div>
{:else if iframeSrc}
	<iframe
		src={iframeSrc}
		class="aspect-video w-full max-w-4xl overflow-hidden rounded-lg border-0"
		title="{game.title} emulator"
		allow="autoplay; gamepad"
	></iframe>
{:else}
	<div class="flex aspect-video w-full max-w-4xl items-center justify-center rounded-lg bg-surface-800">
		<p class="text-surface-400">Loading emulator...</p>
	</div>
{/if}
