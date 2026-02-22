<script lang="ts">
	import type { Game } from '$lib/types/game';
	import { getLabelForPlatform } from '$lib/types/game';

	let { game }: { game: Game } = $props();
</script>

<a href="/games/{game.slug}" class="card card-hover overflow-hidden">
	<div class="aspect-video w-full overflow-hidden bg-surface-800">
		{#if game.screenshotUrl}
			<img
				src={game.screenshotUrl}
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
		</div>
	</div>
</a>
