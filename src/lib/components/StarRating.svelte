<script lang="ts">
	import type { Game } from '$lib/types/game';
	import { getAverageRating, getRatingCount, getUserRating } from '$lib/types/game';
	import { currentUser } from '$lib/stores/auth';
	import { doc, updateDoc, deleteField } from 'firebase/firestore';
	import { db } from '$lib/firebase';

	let { game }: { game: Game } = $props();

	let hoverIndex = $state(0);
	let optimisticRating = $state<number | null>(null);
	let saving = $state(false);

	let userRating = $derived(
		optimisticRating !== null
			? optimisticRating
			: $currentUser
				? getUserRating(game, $currentUser.uid)
				: 0
	);
	let average = $derived(getAverageRating(game));
	let count = $derived(getRatingCount(game));

	function displayStars(index: number): boolean {
		if (hoverIndex > 0) return index <= hoverIndex;
		return index <= userRating;
	}

	async function rate(stars: number) {
		if (!$currentUser || saving) return;
		const uid = $currentUser.uid;
		const currentRating = getUserRating(game, uid);
		const newRating = currentRating === stars ? 0 : stars;

		optimisticRating = newRating;
		saving = true;

		try {
			const gameRef = doc(db, 'games', game.id);
			if (newRating === 0) {
				await updateDoc(gameRef, { [`votes.${uid}`]: deleteField() });
				if (game.votes) delete game.votes[uid];
			} else {
				await updateDoc(gameRef, { [`votes.${uid}`]: newRating });
				if (!game.votes) game.votes = {};
				game.votes[uid] = newRating;
			}
		} catch (e) {
			console.error('Failed to save rating:', e);
			optimisticRating = null;
		} finally {
			optimisticRating = null;
			saving = false;
		}
	}
</script>

<div class="flex flex-col gap-1">
	<div class="flex items-center gap-1">
		{#each [1, 2, 3, 4, 5] as star}
			{#if $currentUser}
				<button
					type="button"
					class="text-2xl transition-colors {saving ? 'cursor-wait' : 'cursor-pointer'}"
					onmouseenter={() => (hoverIndex = star)}
					onmouseleave={() => (hoverIndex = 0)}
					onclick={() => rate(star)}
					aria-label="Rate {star} star{star > 1 ? 's' : ''}"
				>
					<span class={displayStars(star) ? 'text-yellow-400' : 'text-surface-600'}>
						{displayStars(star) ? '\u2605' : '\u2606'}
					</span>
				</button>
			{:else}
				<span class="text-2xl {star <= Math.round(average) ? 'text-yellow-400' : 'text-surface-600'}">
					{star <= Math.round(average) ? '\u2605' : '\u2606'}
				</span>
			{/if}
		{/each}
	</div>
	<div class="text-sm text-surface-400">
		{#if count > 0}
			{average.toFixed(1)} ({count} {count === 1 ? 'rating' : 'ratings'})
		{:else}
			No ratings yet
		{/if}
		{#if !$currentUser}
			<span class="text-surface-500">&middot; Sign in to rate</span>
		{/if}
	</div>
</div>
