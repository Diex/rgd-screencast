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

	function buildJsSpeccy3IframeBlobUrl(romUrl: string): string {
		const jsspeccy = `${window.location.origin}/jsspeccy.js`;
		const html = `<!DOCTYPE html>
<html><head>
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;overflow:hidden;background:#000}#jsspeccy,#jsspeccy>div{width:100%!important;height:100%!important;display:flex!important;justify-content:center!important;align-items:center!important}#jsspeccy canvas{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important}</style>
</head><body>
<div id="jsspeccy"></div>
<script src="${jsspeccy}"><\/script>
<script>
  (async function() {
    const romData = await fetch('${romUrl}').then(function(r) { return r.arrayBuffer(); });
    const _fetch = window.fetch;
    window.fetch = function(url, opts) {
      if (url === 'rom://game.tap') return Promise.resolve(new Response(romData));
      return _fetch(url, opts);
    };
    JSSpeccy(document.getElementById('jsspeccy'), {
      zoom: 2,
      autoStart: true,
      autoLoadTapes: true,
      tapeAutoLoadMode: 'usr0',
      uiEnabled: false,
      openUrl: 'rom://game.tap'
    });
  })();
<\/script>
</body></html>`;
		return URL.createObjectURL(new Blob([html], { type: 'text/html' }));
	}

	function buildJsDosIframeBlobUrl(romUrl: string): string {
		const html = `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;overflow:hidden;background:#000}#dos{width:100%;height:100%}</style>
<link rel="stylesheet" href="https://v8.js-dos.com/latest/js-dos.css">
<script src="https://v8.js-dos.com/latest/js-dos.js"><\/script>
</head><body>
<div id="dos"></div>
<script>
  Dos(document.getElementById('dos'), { url: '${romUrl}', autoStart: true, kiosk: true });
<\/script>
</body></html>`;
		return URL.createObjectURL(new Blob([html], { type: 'text/html' }));
	}

	const BIOS_MAP: Partial<Record<string, string>> = {
		coleco: `${window.location.origin}/colecovision.rom`,
	};

	function buildIframeBlobUrl(romUrl: string, core: string): string {
		const biosUrl = BIOS_MAP[core];
		const biosLine = biosUrl ? `\n  var EJS_biosUrl = '${biosUrl}';` : '';
		const html = `<!DOCTYPE html>
<html><head>
<style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#000}</style>
</head><body>
<div id="game" style="width:100%;height:100%"></div>
<script>
  var EJS_player = '#game';
  var EJS_core = '${core}';
  var EJS_gameUrl = '${romUrl}';${biosLine}
  var EJS_pathtodata = '${EJS_CDN}';
  var EJS_startOnLoaded = true;
  var EJS_ready = function() {
    document.querySelector('canvas')?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    document.querySelector('#game')?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
  };
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
		const isZxSpectrum = game.platform === 'zxspectrum';
		const isDos = game.platform === 'dos';
		const isZx81 = game.platform === 'zx81';
		const core = (isMsx || isZxSpectrum || isDos || isZx81) ? game.platform : getCoreForPlatform(game.platform);
		if (!core) {
			loadError = `Unsupported platform: "${game.platform ?? 'unknown'}"`;
			return;
		}

		resolveRomUrl(game.rom).then((url) => {
			if (cancelled) return;
			if (isMsx) {
				iframeSrc = buildMsxIframeBlobUrl(url);
			} else if (isZxSpectrum) {
				iframeSrc = buildJsSpeccy3IframeBlobUrl(url);
			} else if (isDos) {
				iframeSrc = buildJsDosIframeBlobUrl(url);
			} else if (isZx81) {
				iframeSrc = `/zx81.html?tzx=${encodeURIComponent(url)}`;
			} else {
				iframeSrc = buildIframeBlobUrl(url, core);
			}
		}).catch((err) => {
			if (cancelled) return;
			console.error('Failed to load ROM:', err);
			loadError = 'Failed to load game ROM.';
		});

		return () => {
			cancelled = true;
			if (iframeSrc && iframeSrc.startsWith('blob:')) URL.revokeObjectURL(iframeSrc);
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
