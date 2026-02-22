export type Platform = 'nes' | 'snes' | 'genesis' | 'gba' | 'gb' | 'n64';

export interface Game {
	id: string;
	slug: string;
	title: string;
	platform: Platform;
	year: number;
	description: string;
	romUrl: string;
	screenshotUrl: string;
	screenshots: string[];
	tags: string[];
	featured: boolean;
}

export const PLATFORM_TO_CORE: Record<Platform, string> = {
	nes: 'nes',
	snes: 'snes',
	genesis: 'segaMD',
	gba: 'gba',
	gb: 'gb',
	n64: 'n64'
};

export const PLATFORM_LABELS: Record<Platform, string> = {
	nes: 'NES',
	snes: 'SNES',
	genesis: 'Genesis',
	gba: 'GBA',
	gb: 'Game Boy',
	n64: 'N64'
};
