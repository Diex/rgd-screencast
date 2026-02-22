import { buildCollection } from '@firecms/core';


export const gamesCollection = buildCollection({

// const gamesCollection:EntityCollection = {
	id: 'games',
	name: 'Games',
	path: 'games',
	description: 'Manage your collection of retro video games.',
	editable: true,
	properties: {
		title: {
			validation: {
				required: true,
			},
			dataType: 'string',
			name: 'Title',
		},
		description: {
			validation: {
				required: true,
			},
			dataType: 'string',
			name: 'Description',
		},
		featured: {
			name: 'Featured',
			validation: {
				required: true,
			},
			dataType: 'boolean',
		},
		platform: {
			dataType: 'string',
			validation: {
				required: true,
			},
			enumValues: [
				// Nintendo
				{ id: 'nes', label: 'NES' },
				{ id: 'snes', label: 'SNES' },
				{ id: 'n64', label: 'Nintendo 64' },
				{ id: 'gb', label: 'Game Boy' },
				{ id: 'gba', label: 'GBA' },
				{ id: 'nds', label: 'Nintendo DS' },
				{ id: 'vb', label: 'Virtual Boy' },
				// Sega
				{ id: 'genesis', label: 'Genesis / Mega Drive' },
				{ id: 'sms', label: 'Master System' },
				{ id: 'gamegear', label: 'Game Gear' },
				{ id: 'sega32x', label: 'Sega 32X' },
				{ id: 'segacd', label: 'Sega CD' },
				{ id: 'saturn', label: 'Sega Saturn' },
				// Sony
				{ id: 'psx', label: 'PlayStation' },
				{ id: 'psp', label: 'PSP' },
				// Atari
				{ id: 'atari2600', label: 'Atari 2600' },
				{ id: 'atari5200', label: 'Atari 5200' },
				{ id: 'atari7800', label: 'Atari 7800' },
				{ id: 'jaguar', label: 'Atari Jaguar' },
				{ id: 'lynx', label: 'Atari Lynx' },
				// Other
				{ id: 'arcade', label: 'Arcade' },
				{ id: 'mame2003', label: 'MAME 2003' },
				{ id: '3do', label: '3DO' },
				{ id: 'coleco', label: 'ColecoVision' },
			],
			name: 'Platform',
		},
		rom: {
			storage: {
				storagePath: "/games/roms",
				fileName: "{file}"
			},
			name: "rom",
			dataType: "string"
		},
			screenshotUrl: {
			name: 'Screenshoturl',
			
			dataType: 'string',
		},
		screenshots: {
			name: 'Screenshots',
			dataType: 'array',
			of: {
				name: 'Screenshots',
				dataType: 'string',
			},
		},
		slug: {
			name: 'Slug',
			validation: {
				required: true,
			},
			dataType: 'string',
		},
		tags: {
			of: {
				dataType: 'string',
				name: 'Tags',
			},
			dataType: 'array',
			name: 'Tags',
		},
		year: {
			name: 'Year',
			validation: {
				required: true,
			},
			dataType: 'number',
		},
		__order: {
			hideFromCollection: true,
			dataType: 'number',
			name: '__Order',
		},
	},
	subcollections: [],
// }
});
