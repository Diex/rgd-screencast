<script lang="ts">
	import '../app.css';
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import type { Snippet } from 'svelte';
	import { currentUser, authLoading, signInWithGoogle, logOut } from '$lib/stores/auth';

	let { children }: { children: Snippet } = $props();
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
						<button class="btn btn-sm preset-filled-primary-500" onclick={signInWithGoogle}>Sign In</button>
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
