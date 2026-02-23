<script lang="ts">
	import type { Game } from '$lib/types/game';
	import { getLabelForPlatform, getAverageRating, getRatingCount } from '$lib/types/game';
	import { ref, getDownloadURL } from 'firebase/storage';
	import { storage } from '$lib/firebase';

	let { game }: { game: Game } = $props();

	let average = $derived(getAverageRating(game));
	let count = $derived(getRatingCount(game));
	let thumbnailUrl = $state<string | null>(null);

	$effect(() => {
		const path = game.screenshots?.[0];
		if (!path) return;
		if (path.startsWith('http')) {
			thumbnailUrl = path;
		} else {
			getDownloadURL(ref(storage, path)).then((url) => (thumbnailUrl = url));
		}
	});
</script>

<a href="/games/{game.slug}" class="card card-hover overflow-hidden">
	<div class="aspect-video w-full overflow-hidden bg-surface-800">
		{#if thumbnailUrl}
			<img
				src={thumbnailUrl}
				alt={game.title}
				loading="lazy"
				class="h-full w-full object-cover"
			/>
		{:else}
			<div class="flex h-full items-center justify-center text-surface-500">
				No Image
			</div>
		{/if}
	</div>
	<div class="space-y-2 p-4">
		<h3 class="h4 font-bold">{game.title}</h3>
		<div class="flex flex-wrap gap-2">
			<span class="badge preset-filled-primary-500 text-xs">
				{getLabelForPlatform(game.platform)}
			</span>
			<span class="badge preset-filled-surface-500 text-xs">{game.year}</span>
			{#each game.tags as tag}
				<span class="badge preset-tonal-surface text-xs">{tag}</span>
			{/each}
			{#if count > 0}
				<span class="badge preset-tonal-warning text-xs">&#9733; {average.toFixed(1)}</span>
			{/if}
		</div>
	</div>
</a>
