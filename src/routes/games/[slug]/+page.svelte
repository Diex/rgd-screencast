<script lang="ts">
	import { page } from '$app/stores';
	import GamePlayer from '$lib/components/GamePlayer.svelte';
	import { PLATFORM_LABELS } from '$lib/types/game';
	import { fetchGameBySlug } from '$lib/stores/games';
	import type { Game } from '$lib/types/game';

	let game = $state<Game | null>(null);
	let loading = $state(true);
	let error = $state(false);

	$effect(() => {
		const slug = $page.params.slug;
		loading = true;
		error = false;
		fetchGameBySlug(slug).then((result) => {
			game = result;
			loading = false;
			if (!result) error = true;
		});
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
			<div class="flex flex-wrap gap-3">
				<span class="badge preset-filled-primary-500">
					{PLATFORM_LABELS[game.platform]}
				</span>
				<span class="badge preset-filled-surface-500">{game.year}</span>
				{#each game.tags as tag}
					<span class="badge preset-tonal-surface">{tag}</span>
				{/each}
			</div>

			{#if game.description}
				<p class="text-surface-300 whitespace-pre-line">{game.description}</p>
			{/if}
		</div>

		<!-- Screenshots Gallery -->
		{#if game.screenshots && game.screenshots.length > 0}
			<section class="space-y-4">
				<h2 class="h3 font-bold">Screenshots</h2>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each game.screenshots as screenshot}
						<img
							src={screenshot}
							alt="{game.title} screenshot"
							class="w-full rounded-lg object-cover"
						/>
					{/each}
				</div>
			</section>
		{/if}
	</div>
{/if}
