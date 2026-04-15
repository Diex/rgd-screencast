<script lang="ts">
	import { fetchAllGames, gamesByBayesianScore, globalAverage, loading, error } from '$lib/stores/games';
	import { getBayesianScore, getRatingCount, BAYESIAN_MIN_VOTES } from '$lib/types/game';
	import { getLabelForPlatform } from '$lib/types/game';
	import { allowedToVote } from '$lib/stores/remoteConfig';

	$effect(() => {
		fetchAllGames();
	});

	const MEDALS = ['🥇', '🥈', '🥉'];
</script>

<svelte:head>
	<title>Audience Award - Retro_ GameDev 2026</title>
</svelte:head>

<div class="space-y-8">
	<div>
		<h1 class="h1 font-bold">Audience Award</h1>
		<p class="mt-2 text-surface-400">Games ranked by community rating using a Bayesian weighted score.</p>
	</div>

	{#if $allowedToVote}
		<div class="py-20 text-center">
			<p class="text-4xl">🗳️</p>
			<p class="mt-4 text-lg font-bold">Voting is open</p>
			<p class="mt-2 text-surface-400">Results will be revealed once voting closes.</p>
			<a href="/games" class="btn preset-filled-primary-500 mt-6">Go vote</a>
		</div>
	{:else if $loading}
		<div class="py-12 text-center">
			<p class="text-surface-400">Loading rankings...</p>
		</div>
	{:else if $error}
		<div class="py-12 text-center">
			<p class="text-error-500">Error: {$error}</p>
			<button class="btn preset-filled-primary-500 mt-4" onclick={() => fetchAllGames(true)}>Retry</button>
		</div>
	{:else if $gamesByBayesianScore.length === 0}
		<p class="text-surface-400">No games found.</p>
	{:else}
		<div class="space-y-2">
			{#each $gamesByBayesianScore as game, i}
				{@const voteCount = getRatingCount(game)}
				{@const score = getBayesianScore(game, $globalAverage)}
				<a
					href="/games/{game.slug}"
					class="card card-hover flex items-center gap-4 p-4 transition-colors"
					class:opacity-50={voteCount === 0}
				>
					<!-- Rank -->
					<div class="w-10 shrink-0 text-center">
						{#if i < 3 && voteCount > 0}
							<span class="text-2xl">{MEDALS[i]}</span>
						{:else}
							<span class="font-mono text-lg font-bold text-surface-400">#{i + 1}</span>
						{/if}
					</div>

					<!-- Title + platform -->
					<div class="min-w-0 flex-1">
						<p class="truncate font-bold">{game.title}</p>
						<div class="mt-1 flex flex-wrap gap-1">
							<span class="badge preset-filled-primary-500 text-xs">{getLabelForPlatform(game.platform)}</span>
							<span class="badge preset-filled-surface-500 text-xs">{game.year}</span>
						</div>
					</div>

					<!-- Score + votes -->
					<div class="shrink-0 text-right">
						{#if voteCount > 0}
							<p class="font-mono text-xl font-bold text-yellow-400">{score.toFixed(2)}</p>
							<p class="text-xs text-surface-400">{voteCount} {voteCount === 1 ? 'vote' : 'votes'}</p>
						{:else}
							<p class="text-sm text-surface-500">No votes yet</p>
						{/if}
					</div>

					<!-- Star bar -->
					<div class="hidden shrink-0 sm:block">
						{#each [1, 2, 3, 4, 5] as star}
							<span class="text-lg {voteCount > 0 && star <= Math.round(score) ? 'text-yellow-400' : 'text-surface-700'}">
								{voteCount > 0 && star <= Math.round(score) ? '★' : '☆'}
							</span>
						{/each}
					</div>
				</a>
			{/each}
		</div>

		<!-- Footnote -->
		<p class="text-xs text-surface-600">
			Score = (v·R + {BAYESIAN_MIN_VOTES}·C) / (v + {BAYESIAN_MIN_VOTES}) &nbsp;·&nbsp;
			C = {$globalAverage.toFixed(2)} (global average) &nbsp;·&nbsp;
			m = {BAYESIAN_MIN_VOTES} (minimum votes)
		</p>
	{/if}
</div>
