import { writable, derived } from 'svelte/store';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '$lib/firebase';
import type { Game } from '$lib/types/game';

export const games = writable<Game[]>([]);
export const loading = writable(true);
export const error = writable<string | null>(null);

export const featuredGames = derived(games, ($games) =>
	$games.filter((game) => game.featured)
);

let fetched = false;

export async function fetchGames(force = false): Promise<void> {
	if (fetched && !force) return;
	loading.set(true);
	error.set(null);
	try {
		const snapshot = await getDocs(collection(db, 'games'));
		const result: Game[] = [];
		snapshot.forEach((doc) => {
			result.push({ id: doc.id, ...doc.data() } as Game);
		});
		games.set(result);
		fetched = true;
	} catch (e) {
		console.error('Failed to fetch games:', e);
		error.set(e instanceof Error ? e.message : 'Failed to load games');
	} finally {
		loading.set(false);
	}
}

export async function fetchGameBySlug(slug: string): Promise<Game | null> {
	const q = query(collection(db, 'games'), where('slug', '==', slug));
	const snapshot = await getDocs(q);
	if (snapshot.empty) return null;
	const doc = snapshot.docs[0];
	return { id: doc.id, ...doc.data() } as Game;
}
