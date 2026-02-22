<script lang="ts">
	import type { Game } from '$lib/types/game';
	import GameCard from './GameCard.svelte';

	let { title, games }: { title: string; games: Game[] } = $props();
</script>

<section class="space-y-6">
	{#if title}
		<h2 class="h2 font-bold">{title}</h2>
	{/if}
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each games as game (game.id)}
			<GameCard {game} />
		{/each}
	</div>
</section>
