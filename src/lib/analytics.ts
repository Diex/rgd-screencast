import { getApp } from 'firebase/app';
import { getAnalytics, isSupported, logEvent as firebaseLogEvent } from 'firebase/analytics';
import type { Analytics } from 'firebase/analytics';

const analyticsPromise: Promise<Analytics | null> = isSupported().then((supported) => {
	if (!supported) return null;
	try {
		return getAnalytics(getApp());
	} catch {
		return null;
	}
});

export function logEvent(eventName: string, params?: Record<string, unknown>): void {
	analyticsPromise.then((analytics) => {
		if (analytics) firebaseLogEvent(analytics, eventName, params);
	});
}
