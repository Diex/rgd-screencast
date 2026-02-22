import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize with service account or Application Default Credentials
initializeApp({
	credential: cert(
		JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}')
	)
});

const db = getFirestore();

const games = [
	{
		slug: 'super-mario-bros',
		title: 'Super Mario Bros',
		platform: 'nes',
		year: 1985,
		description:
			'<p>The classic platformer that started it all. Join Mario on his quest to rescue Princess Toadstool from the evil Bowser.</p>',
		romUrl: '',
		screenshotUrl: '',
		screenshots: [],
		tags: ['platformer', 'classic', 'nintendo'],
		featured: true
	},
	{
		slug: 'sonic-the-hedgehog',
		title: 'Sonic the Hedgehog',
		platform: 'genesis',
		year: 1991,
		description:
			'<p>Speed through loop-de-loops and collect rings as Sonic in this iconic Sega Genesis title.</p>',
		romUrl: '',
		screenshotUrl: '',
		screenshots: [],
		tags: ['platformer', 'speed', 'sega'],
		featured: true
	},
	{
		slug: 'street-fighter-ii',
		title: 'Street Fighter II',
		platform: 'snes',
		year: 1992,
		description:
			'<p>The legendary fighting game. Choose your fighter and battle opponents from around the world.</p>',
		romUrl: '',
		screenshotUrl: '',
		screenshots: [],
		tags: ['fighting', 'arcade', 'multiplayer'],
		featured: true
	},
	{
		slug: 'pokemon-red',
		title: 'Pokemon Red',
		platform: 'gb',
		year: 1996,
		description:
			'<p>Begin your journey as a Pokemon trainer. Catch, train, and battle your way to become the Pokemon Champion.</p>',
		romUrl: '',
		screenshotUrl: '',
		screenshots: [],
		tags: ['rpg', 'adventure', 'pokemon'],
		featured: true
	},
	{
		slug: 'the-legend-of-zelda',
		title: 'The Legend of Zelda',
		platform: 'nes',
		year: 1986,
		description:
			'<p>Explore the vast land of Hyrule and rescue Princess Zelda from the evil Ganon in this groundbreaking action-adventure.</p>',
		romUrl: '',
		screenshotUrl: '',
		screenshots: [],
		tags: ['adventure', 'action', 'nintendo'],
		featured: true
	}
];

async function seed() {
	const batch = db.batch();

	for (const game of games) {
		const ref = db.collection('games').doc(game.slug);
		batch.set(ref, game);
	}

	await batch.commit();
	console.log(`Seeded ${games.length} games successfully.`);
}

seed().catch(console.error);
