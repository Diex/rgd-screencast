/**
 * Platform identifiers — these match the EmulatorJS `EJS_core` values directly
 * so no mapping layer is needed. See: https://emulatorjs.org/editor
 */
export const PLATFORMS = {
	// Nintendo
	nes: { core: 'nes', label: 'NES' },
	snes: { core: 'snes', label: 'SNES' },
	n64: { core: 'n64', label: 'Nintendo 64' },
	gb: { core: 'gb', label: 'Game Boy' },
	gba: { core: 'gba', label: 'GBA' },
	nds: { core: 'nds', label: 'Nintendo DS' },
	vb: { core: 'vb', label: 'Virtual Boy' },
	// Sega
	genesis: { core: 'genesis', label: 'Genesis / Mega Drive' },
	sms: { core: 'sms', label: 'Master System' },
	gamegear: { core: 'gamegear', label: 'Game Gear' },
	sega32x: { core: 'sega32x', label: 'Sega 32X' },
	segacd: { core: 'segacd', label: 'Sega CD' },
	saturn: { core: 'saturn', label: 'Sega Saturn' },
	// Sony
	psx: { core: 'psx', label: 'PlayStation' },
	psp: { core: 'psp', label: 'PSP' },
	// Atari
	atari2600: { core: 'atari2600', label: 'Atari 2600' },
	atari5200: { core: 'atari5200', label: 'Atari 5200' },
	atari7800: { core: 'atari7800', label: 'Atari 7800' },
	jaguar: { core: 'jaguar', label: 'Atari Jaguar' },
	lynx: { core: 'lynx', label: 'Atari Lynx' },
	// Commodore
	c64: { core: 'c64', label: 'Commodore 64' },
	c128: { core: 'c128', label: 'Commodore 128' },
	amiga: { core: 'amiga', label: 'Amiga' },
	pet: { core: 'pet', label: 'Commodore PET' },
	plus4: { core: 'plus4', label: 'Commodore Plus/4' },
	vic20: { core: 'vic20', label: 'Commodore VIC-20' },
	// Other
	'3do': { core: '3do', label: '3DO' },
	arcade: { core: 'arcade', label: 'Arcade' },
	coleco: { core: 'coleco', label: 'ColecoVision' },
	mame2003: { core: 'mame2003', label: 'MAME 2003' },
} as const;

export type Platform = keyof typeof PLATFORMS;

/** Get the EmulatorJS core string for a platform */
export function getCoreForPlatform(platform: string): string | undefined {
	return (PLATFORMS as Record<string, { core: string; label: string }>)[platform]?.core;
}

/** Get display label for a platform */
export function getLabelForPlatform(platform: string): string {
	return (PLATFORMS as Record<string, { core: string; label: string }>)[platform]?.label ?? platform;
}

/** Sorted entries for use in UI selectors */
export const PLATFORM_ENTRIES = Object.entries(PLATFORMS)
	.map(([id, { label }]) => ({ id, label }))
	.sort((a, b) => a.label.localeCompare(b.label));

export interface Game {
	id: string;
	slug: string;
	title: string;
	platform: Platform;
	year: number;
	description: string;
	rom: string;
	screenshots: string[];
	tags: string[];
	featured: boolean;
	votes?: Record<string, number>;
}

export function getAverageRating(game: Game): number {
	const values = Object.values(game.votes ?? {});
	if (values.length === 0) return 0;
	return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function getRatingCount(game: Game): number {
	return Object.keys(game.votes ?? {}).length;
}

export function getUserRating(game: Game, uid: string): number {
	return game.votes?.[uid] ?? 0;
}
