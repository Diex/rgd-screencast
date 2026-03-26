<script lang="ts">
	import '../app.css';
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import type { Snippet } from 'svelte';
	import {
		currentUser,
		authLoading,
		signInWithGoogle,
		signInWithEmail,
		signUpWithEmail,
		sendPasswordReset,
		logOut
	} from '$lib/stores/auth';

	let { children }: { children: Snippet } = $props();

	let showAuthModal = $state(false);
	let isSignUp = $state(false);
	let isForgotPassword = $state(false);
	let resetSent = $state(false);
	let email = $state('');
	let password = $state('');
	let authError = $state('');
	let submitting = $state(false);

	function openAuth() {
		showAuthModal = true;
		isSignUp = false;
		isForgotPassword = false;
		resetSent = false;
		email = '';
		password = '';
		authError = '';
	}

	function closeAuth() {
		showAuthModal = false;
		isForgotPassword = false;
		resetSent = false;
		authError = '';
	}

	async function handleEmailSubmit(e: Event) {
		e.preventDefault();
		authError = '';
		submitting = true;
		try {
			if (isSignUp) {
				await signUpWithEmail(email, password);
			} else {
				await signInWithEmail(email, password);
			}
			closeAuth();
		} catch (err: any) {
			authError = err?.message?.replace('Firebase: ', '') ?? 'Authentication failed';
		} finally {
			submitting = false;
		}
	}

	async function handlePasswordReset(e: Event) {
		e.preventDefault();
		authError = '';
		submitting = true;
		try {
			await sendPasswordReset(email);
			resetSent = true;
		} catch (err: any) {
			authError = err?.message?.replace('Firebase: ', '') ?? 'Failed to send reset email';
		} finally {
			submitting = false;
		}
	}

	async function handleGoogleSignIn() {
		authError = '';
		try {
			await signInWithGoogle();
			closeAuth();
		} catch (err: any) {
			authError = err?.message?.replace('Firebase: ', '') ?? 'Authentication failed';
		}
	}
</script>

<div class="flex min-h-screen flex-col bg-surface-900 text-surface-50">
	<!-- Header -->
	<AppBar>
		<AppBar.Toolbar>
			<AppBar.Lead>
				<a href="/" class="text-xl font-bold text-primary-500">RGD Screencast</a>
			</AppBar.Lead>
			<AppBar.Trail>
				<nav class="flex items-center gap-4">
					<a href="/" class="hover:text-primary-400 transition-colors">Home</a>
					<a href="/games" class="hover:text-primary-400 transition-colors">Games</a>
					{#if $authLoading}
						<div class="h-5 w-5 animate-spin rounded-full border-2 border-surface-400 border-t-primary-500"></div>
					{:else if $currentUser}
						<span class="text-sm text-surface-300">{$currentUser.displayName || $currentUser.email}</span>
						<button class="btn btn-sm preset-tonal-surface" onclick={logOut}>Sign Out</button>
					{:else}
						<button class="btn btn-sm preset-filled-primary-500" onclick={openAuth}>Sign In</button>
					{/if}
				</nav>
			</AppBar.Trail>
		</AppBar.Toolbar>
	</AppBar>

	<!-- Main content -->
	<main class="container mx-auto flex-1 px-4 py-8">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="bg-surface-800 p-4 text-center text-sm text-surface-400">
		<p>&copy; {new Date().getFullYear()} RGD Screencast. Play retro games in your browser.</p>
	</footer>
</div>

<!-- Auth Modal -->
{#if showAuthModal}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
		onkeydown={(e) => e.key === 'Escape' && closeAuth()}
		onclick={(e) => e.target === e.currentTarget && closeAuth()}
	>
		<div class="card w-full max-w-sm space-y-4 p-6">
			<h2 class="h3 font-bold text-center">
				{isForgotPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Sign In'}
			</h2>

			{#if isForgotPassword}
				{#if resetSent}
					<div class="space-y-3 text-sm text-surface-300 text-center">
						<p>If <strong>{email}</strong> has a password account, a reset link has been sent — check your inbox.</p>
						<p>If you signed up with Google, use <button class="text-primary-400 hover:underline" onclick={() => { isForgotPassword = false; resetSent = false; authError = ''; }}>"Continue with Google"</button> to sign in instead.</p>
					</div>
				{:else}
					<form onsubmit={handlePasswordReset} class="space-y-3">
						<label class="label">
							<span class="text-sm">Email</span>
							<input
								type="email"
								class="input"
								bind:value={email}
								required
								autocomplete="email"
							/>
						</label>

						{#if authError}
							<p class="text-sm text-error-500">{authError}</p>
						{/if}

						<button type="submit" class="btn preset-filled-primary-500 w-full" disabled={submitting}>
							{submitting ? 'Please wait...' : 'Send Reset Link'}
						</button>
					</form>
				{/if}
			{:else}
				<form onsubmit={handleEmailSubmit} class="space-y-3">
					<label class="label">
						<span class="text-sm">Email</span>
						<input
							type="email"
							class="input"
							bind:value={email}
							required
							autocomplete="email"
						/>
					</label>
					<label class="label">
						<span class="text-sm">Password</span>
						<input
							type="password"
							class="input"
							bind:value={password}
							required
							minlength="6"
							autocomplete={isSignUp ? 'new-password' : 'current-password'}
						/>
					</label>

					{#if !isSignUp}
						<div class="text-right">
							<button
								type="button"
								class="text-sm text-primary-400 hover:underline"
								onclick={() => { isForgotPassword = true; authError = ''; }}
							>Forgot password?</button>
						</div>
					{/if}

					{#if authError}
						<p class="text-sm text-error-500">{authError}</p>
					{/if}

					<button type="submit" class="btn preset-filled-primary-500 w-full" disabled={submitting}>
						{submitting ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
					</button>
				</form>

				<div class="flex items-center gap-3">
					<hr class="flex-1 border-surface-600" />
					<span class="text-xs text-surface-400">or</span>
					<hr class="flex-1 border-surface-600" />
				</div>

				<button class="btn preset-tonal-surface w-full" onclick={handleGoogleSignIn}>
					Continue with Google
				</button>
			{/if}

			<p class="text-center text-sm text-surface-400">
				{#if isForgotPassword}
					Back to
					<button
						class="text-primary-400 hover:underline"
						onclick={() => { isForgotPassword = false; resetSent = false; authError = ''; }}
					>Sign In</button>
				{:else if isSignUp}
					Already have an account?
					<button class="text-primary-400 hover:underline" onclick={() => (isSignUp = false)}>Sign In</button>
				{:else}
					Don't have an account?
					<button class="text-primary-400 hover:underline" onclick={() => (isSignUp = true)}>Sign Up</button>
				{/if}
			</p>
		</div>
	</div>
{/if}
