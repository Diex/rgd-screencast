<script lang="ts">
	import type { Game } from '$lib/types/game';
	import { getCoreForPlatform } from '$lib/types/game';
	import { resolveStorageUrl } from '$lib/utils/storage';

	let { game }: { game: Game } = $props();

	let loadError = $state<string | null>(null);
	let iframeSrc = $state<string | null>(null);
	let romUrl = $state<string | null>(null);
	let posterUrl = $state<string | null>(null);
	let loading = $state(true);

	const EJS_CDN = 'https://cdn.emulatorjs.org/stable/data/';

	function isCustomEmulator(platform: string): boolean {
		return platform === 'msx' || platform === 'zxspectrum' || platform === 'dos' || platform === 'zx81';
	}

	function buildMsxIframeBlobUrl(url: string): string {
		const wmsxUrl = `${window.location.origin}/wmsx.js`;
		const html = `<!DOCTYPE html>
<html><head>
<style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#000}</style>
</head><body>
<div id="wmsx-screen" style="width:100%;height:100%"></div>
<script src="${wmsxUrl}"><\/script>
<script>
  WMSX.CARTRIDGE1_URL = '${url}';
  WMSX.SCREEN_ELEMENT_ID = 'wmsx-screen';
<\/script>
</body></html>`;
		return URL.createObjectURL(new Blob([html], { type: 'text/html' }));
	}

	function buildJsSpeccy3IframeBlobUrl(url: string): string {
		const jsspeccy = `${window.location.origin}/jsspeccy.js`;
		const ext = new URL(url).pathname.split('.').pop()?.toLowerCase() ?? 'tap';
		const isTape = ext === 'tap' || ext === 'tzx';
		const html = `<!DOCTYPE html>
<html><head>
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;overflow:hidden;background:#000}#jsspeccy,#jsspeccy>div{width:100%!important;height:100%!important;display:flex!important;justify-content:center!important;align-items:center!important}#jsspeccy canvas{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important}</style>
</head><body>
<div id="jsspeccy"></div>
<script src="${jsspeccy}"><\/script>
<script>
  (async function() {
    const romData = await fetch('${url}').then(function(r) { return r.arrayBuffer(); });
    const _fetch = window.fetch;
    window.fetch = function(url, opts) {
      if (url === 'rom://game.${ext}') return Promise.resolve(new Response(romData));
      return _fetch(url, opts);
    };
    JSSpeccy(document.getElementById('jsspeccy'), {
      zoom: 2,
      autoStart: true,${isTape ? `\n      autoLoadTapes: true,\n      tapeAutoLoadMode: 'usr0',` : ''}
      uiEnabled: false,
      openUrl: 'rom://game.${ext}'
    });
  })();
<\/script>
</body></html>`;
		return URL.createObjectURL(new Blob([html], { type: 'text/html' }));
	}

	function buildJsDosIframeBlobUrl(url: string): string {
		const html = `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;overflow:hidden;background:#000}#dos{width:100%;height:100%}</style>
<link rel="stylesheet" href="https://v8.js-dos.com/latest/js-dos.css">
<script src="https://v8.js-dos.com/latest/js-dos.js"><\/script>
</head><body>
<div id="dos"></div>
<script>
  Dos(document.getElementById('dos'), { url: '${url}', autoStart: true, kiosk: true });
<\/script>
</body></html>`;
		return URL.createObjectURL(new Blob([html], { type: 'text/html' }));
	}

	const BIOS_MAP: Partial<Record<string, string>> = {
		coleco: `${window.location.origin}/colecovision.rom`,
	};

	function buildIframeBlobUrl(url: string, core: string): string {
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
  var EJS_gameUrl = '${url}';${biosLine}
  var EJS_pathtodata = '${EJS_CDN}';
  var EJS_threads = false;
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
		romUrl = null;
		posterUrl = null;
		loading = true;

		const isZx81 = game.platform === 'zx81';
		const core = isCustomEmulator(game.platform) ? game.platform : getCoreForPlatform(game.platform);
		if (!core) {
			loadError = `Unsupported platform: "${game.platform ?? 'unknown'}"`;
			loading = false;
			return;
		}

		const firstScreenshot = game.screenshots?.[0];
		if (firstScreenshot) {
			resolveStorageUrl(firstScreenshot).then((url) => { if (!cancelled) posterUrl = url; }).catch(() => {});
		}

		resolveStorageUrl(game.rom).then((url) => {
			if (cancelled) return;
			loading = false;
			if (isZx81) {
				iframeSrc = `/zx81.html?tzx=${encodeURIComponent(url)}`;
			} else {
				romUrl = url;
			}
		}).catch((err) => {
			if (cancelled) return;
			console.error('Failed to load ROM:', err);
			loadError = 'Failed to load game ROM.';
			loading = false;
		});

		return () => {
			cancelled = true;
			if (iframeSrc && iframeSrc.startsWith('blob:')) URL.revokeObjectURL(iframeSrc);
		};
	});

	$effect(() => {
		if (!iframeSrc) return;

		const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'PageUp', 'PageDown']);

		function onKeydown(e: KeyboardEvent) {
			if (SCROLL_KEYS.has(e.key)) e.preventDefault();
		}
		function onBlur() {
			document.documentElement.style.overflow = 'hidden';
		}
		function onFocus() {
			document.documentElement.style.overflow = '';
		}

		window.addEventListener('keydown', onKeydown, { passive: false });
		window.addEventListener('blur', onBlur);
		window.addEventListener('focus', onFocus);

		return () => {
			window.removeEventListener('keydown', onKeydown);
			window.removeEventListener('blur', onBlur);
			window.removeEventListener('focus', onFocus);
			document.documentElement.style.overflow = '';
		};
	});

	function launch() {
		if (!romUrl) return;
		if (iframeSrc?.startsWith('blob:')) URL.revokeObjectURL(iframeSrc);
		const core = isCustomEmulator(game.platform) ? game.platform : getCoreForPlatform(game.platform)!;

		if (game.platform === 'msx') iframeSrc = buildMsxIframeBlobUrl(romUrl);
		else if (game.platform === 'zxspectrum') iframeSrc = buildJsSpeccy3IframeBlobUrl(romUrl);
		else if (game.platform === 'dos') iframeSrc = buildJsDosIframeBlobUrl(romUrl);
		else iframeSrc = buildIframeBlobUrl(romUrl, core);
	}
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
{:else if loading}
	<div class="flex aspect-video w-full max-w-4xl items-center justify-center rounded-lg bg-surface-800">
		<p class="text-surface-400">Loading emulator...</p>
	</div>
{:else if romUrl}
	<button
		onclick={launch}
		class="relative flex aspect-video w-full max-w-4xl items-center justify-center overflow-hidden rounded-lg bg-surface-900"
		aria-label="Play {game.title}"
	>
		{#if posterUrl}
			<img src={posterUrl} alt="" class="absolute inset-0 h-full w-full object-cover opacity-40" />
		{/if}
		<div class="relative flex flex-col items-center gap-3">
			<div class="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-10 w-10 translate-x-0.5 text-white">
					<path d="M8 5v14l11-7z"/>
				</svg>
			</div>
			<span class="text-sm font-medium text-white/80">Click to play</span>
		</div>
	</button>
{/if}
