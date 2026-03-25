<script lang="ts">
	import { page } from '$app/stores';
	import GamePlayer from '$lib/components/GamePlayer.svelte';
	import StarRating from '$lib/components/StarRating.svelte';
	import { getLabelForPlatform } from '$lib/types/game';
	import { fetchGameBySlug } from '$lib/stores/games';
	import type { Game } from '$lib/types/game';

	let game = $state<Game | null>(null);
	let loading = $state(true);
	let error = $state(false);

	$effect(() => {
		const slug = $page.params.slug ?? '';
		let cancelled = false;
		loading = true;
		error = false;
		fetchGameBySlug(slug)
			.then((result) => {
				if (cancelled) return;
				game = result;
				loading = false;
				if (!result) error = true;
			})
			.catch(() => {
				if (cancelled) return;
				loading = false;
				error = true;
			});
		return () => {
			cancelled = true;
		};
	});
</script>

<svelte:head>
	<title>{game ? game.title : 'Game'} - RGD Screencast</title>
</svelte:head>

{#if loading}
	<div class="py-12 text-center">
		<p class="text-surface-400">Loading game...</p>
	</div>
{:else if error || !game}
	<div class="py-12 text-center">
		<h2 class="h2 font-bold">Game Not Found</h2>
		<p class="text-surface-400 mt-2">The game you're looking for doesn't exist.</p>
		<a href="/games" class="btn preset-filled-primary-500 mt-4">Back to Games</a>
	</div>
{:else}
	<div class="mx-auto max-w-5xl space-y-8">
		<div class="flex items-center gap-4">
			<a href="/games" class="text-primary-400 hover:underline">&larr; Back</a>
			<h1 class="h1 font-bold">{game.title}</h1>
		</div>

		<!-- Player -->
		<GamePlayer {game} />

		<!-- Info -->
		<div class="card p-6 space-y-4">
			<div class="flex flex-wrap items-center gap-3">
				<span class="badge preset-filled-primary-500">
					{getLabelForPlatform(game.platform)}
				</span>
				<span class="badge preset-filled-surface-500">{game.year}</span>
				{#each game.tags as tag}
					<span class="badge preset-tonal-surface">{tag}</span>
				{/each}
			</div>

			<StarRating {game} />

			{#if game.description}
				<p class="text-surface-300 whitespace-pre-line">{game.description}</p>
			{/if}

			{#if game.instructions}
				<div>
					<h3 class="h4 font-semibold mb-1">Instructions</h3>
					<p class="text-surface-300 whitespace-pre-line">{game.instructions}</p>
				</div>
			{/if}

			{#if game.commands}
				<div>
					<h3 class="h4 font-semibold mb-1">Commands</h3>
					<p class="text-surface-300 whitespace-pre-line">{game.commands}</p>
				</div>
			{/if}
		</div>
	</div>
{/if}
