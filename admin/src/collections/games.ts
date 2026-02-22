import { buildCollection } from '@firecms/core';

export const gamesCollection = buildCollection({
	id: 'games',
	name: 'Games',
	singularName: 'Game',
	path: 'games',
	icon: 'SportsEsports',
	properties: {
		slug: {
			name: 'Slug',
			validation: { required: true },
			dataType: 'string'
		},
		title: {
			name: 'Title',
			validation: { required: true },
			dataType: 'string'
		},
		platform: {
			name: 'Platform',
			validation: { required: true },
			dataType: 'string',
			enumValues: {
				nes: 'NES',
				snes: 'SNES',
				genesis: 'Genesis',
				gba: 'GBA',
				gb: 'Game Boy',
				n64: 'N64'
			}
		},
		year: {
			name: 'Year',
			validation: { required: true, min: 1970, max: 2010 },
			dataType: 'number'
		},
		description: {
			name: 'Description',
			dataType: 'string',
			markdown: true
		},
		romUrl: {
			name: 'ROM File',
			validation: { required: true },
			dataType: 'string',
			storage: {
				storagePath: 'roms',
				acceptedFiles: ['*/*']
			}
		},
		screenshotUrl: {
			name: 'Main Screenshot',
			dataType: 'string',
			storage: {
				storagePath: 'screenshots',
				acceptedFiles: ['image/*']
			}
		},
		screenshots: {
			name: 'Screenshots',
			dataType: 'array',
			of: {
				dataType: 'string',
				storage: {
					storagePath: 'screenshots',
					acceptedFiles: ['image/*']
				}
			}
		},
		tags: {
			name: 'Tags',
			dataType: 'array',
			of: {
				dataType: 'string'
			}
		},
		featured: {
			name: 'Featured',
			dataType: 'boolean',
			defaultValue: false
		}
	}
});
