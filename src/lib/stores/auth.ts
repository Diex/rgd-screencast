import { writable } from 'svelte/store';
import {
	onAuthStateChanged,
	signInWithPopup,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	sendPasswordResetEmail,
	signOut,
	GoogleAuthProvider,
	type User
} from 'firebase/auth';
import { auth } from '$lib/firebase';

export const currentUser = writable<User | null>(null);
export const authLoading = writable(true);

onAuthStateChanged(auth, (user) => {
	currentUser.set(user);
	authLoading.set(false);
});

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<void> {
	await signInWithPopup(auth, googleProvider);
}

export async function signUpWithEmail(email: string, password: string): Promise<void> {
	await createUserWithEmailAndPassword(auth, email, password);
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
	await signInWithEmailAndPassword(auth, email, password);
}

export async function sendPasswordReset(email: string): Promise<void> {
	await sendPasswordResetEmail(auth, email);
}

export async function logOut(): Promise<void> {
	await signOut(auth);
}
