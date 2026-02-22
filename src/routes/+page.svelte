<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import GameGrid from '$lib/components/GameGrid.svelte';
	import { featuredGames, fetchGames, loading, error } from '$lib/stores/games';

	$effect(() => {
		fetchGames();
	});
</script>

<div class="space-y-12">
	<Hero />

	{#if $loading}
		<div class="py-12 text-center">
			<p class="text-surface-400">Loading games...</p>
		</div>
	{:else if $error}
		<div class="py-12 text-center">
			<p class="text-error-500">Error: {$error}</p>
			<button class="btn preset-filled-primary-500 mt-4" onclick={() => fetchGames()}>Retry</button>
		</div>
	{:else if $featuredGames.length > 0}
		<GameGrid title="Featured Games" games={$featuredGames} />
	{/if}
</div>
