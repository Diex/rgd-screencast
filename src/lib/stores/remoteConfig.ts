import { readable } from 'svelte/store';
import { fetchAndActivate, getBoolean } from 'firebase/remote-config';
import { remoteConfig } from '$lib/firebase';

remoteConfig.settings.minimumFetchIntervalMillis = import.meta.env.DEV ? 0 : 3_600_000;

// Single fetch shared by all exported flags
const _ready = fetchAndActivate(remoteConfig).catch((err) =>
	console.warn('[RemoteConfig] fetch failed, using defaults:', err)
);

function remoteBoolean(key: string, defaultValue: boolean) {
	return readable<boolean>(defaultValue, (set) => {
		_ready.then(() => set(getBoolean(remoteConfig, key)));
		return () => {};
	});
}

export const showRatings = remoteBoolean('showRatings', true);
export const allowedToVote = remoteBoolean('allowedToVote', true);
