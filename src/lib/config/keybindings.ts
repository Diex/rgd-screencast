import type { Platform } from '$lib/types/game';

type KeyBinding = { value: string; value2: string };
type PlayerBindings = Record<number, KeyBinding>;
type ControllerBindings = Record<number, PlayerBindings>;

export const PLATFORM_KEYBINDINGS: Partial<Record<Platform, ControllerBindings>> = {
	coleco: {
		0: {
			0: { value: 'x', value2: '' },
			8: { value: 'z', value2: '' },
			4: { value: 'up arrow', value2: '' },
			5: { value: 'down arrow', value2: '' },
			6: { value: 'left arrow', value2: '' },
			7: { value: 'right arrow', value2: '' },
			1: { value: '1', value2: '' },
			9: { value: '2', value2: '' },
			10: { value: '3', value2: '' },
			11: { value: '4', value2: '' },
			12: { value: '5', value2: '' },
			13: { value: '6', value2: '' },
			14: { value: '7', value2: '' },
			15: { value: '8', value2: '' },
			2: { value: 'w', value2: '' },
			3: { value: 'q', value2: '' }
		},
		1: {},
		2: {},
		3: {}
	}
};
