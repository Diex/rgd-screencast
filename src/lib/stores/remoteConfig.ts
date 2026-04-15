import { readable } from 'svelte/store';
import { fetchAndActivate, getBoolean } from 'firebase/remote-config';
import { remoteConfig } from '$lib/firebase';

remoteConfig.settings.minimumFetchIntervalMillis = import.meta.env.DEV ? 0 : 3_600_000;

export const showRatings = readable<boolean>(true, (set) => {
	fetchAndActivate(remoteConfig)
		.then(() => set(getBoolean(remoteConfig, 'showRatings')))
		.catch((err) => console.warn('[RemoteConfig] fetch failed, using default:', err));
	return () => {};
});
