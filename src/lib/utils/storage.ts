import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '$lib/firebase';

/** Resolves a Firebase Storage path or passthrough an absolute URL. */
export async function resolveStorageUrl(url: string): Promise<string> {
	if (url.startsWith('http://') || url.startsWith('https://')) return url;
	return getDownloadURL(ref(storage, url));
}
