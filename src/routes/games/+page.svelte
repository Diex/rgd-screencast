<script lang="ts">
	import GameGrid from '$lib/components/GameGrid.svelte';
	import { games, fetchGames, loading, error } from '$lib/stores/games';

	$effect(() => {
		fetchGames();
	});
</script>

<svelte:head>
	<title>All Games - RGD Screencast</title>
</svelte:head>

<div class="space-y-8">
	<h1 class="h1 font-bold">All Games</h1>

	{#if $loading}
		<div class="py-12 text-center">
			<p class="text-surface-400">Loading games...</p>
		</div>
	{:else if $error}
		<div class="py-12 text-center">
			<p class="text-error-500">Error: {$error}</p>
			<button class="btn preset-filled-primary-500 mt-4" onclick={() => fetchGames()}>Retry</button>
		</div>
	{:else if $games.length === 0}
		<p class="text-surface-400">No games found.</p>
	{:else}
		<GameGrid title="" games={$games} />
	{/if}
</div>
